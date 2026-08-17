import { API_URL } from './url';

export const API_BASE_URL = API_URL.replace(/\/+$/, '');

// Helper to show snackbars from any place
export const showSnackbar = (message, type = 'error') => {
  window.dispatchEvent(new CustomEvent('snack', { detail: { message, type } }));
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getToken = () => {
  return (
    sessionStorage.getItem('admin_access_token') ||
    localStorage.getItem('admin_access_token') ||
    sessionStorage.getItem('sessionToken') ||
    localStorage.getItem('sessionToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('accessToken')
  );
};

/**
 * Refresh access token transparently
 */
const handleTokenRefresh = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;
  const refreshToken =
    sessionStorage.getItem('admin_refresh_token') ||
    localStorage.getItem('admin_refresh_token') ||
    sessionStorage.getItem('refreshToken') ||
    localStorage.getItem('refreshToken');

  if (!refreshToken) {
    isRefreshing = false;
    return null;
  }

  try {
    const URL_ROUTE = `${API_URL}admin/auth/refresh-token`;
    const response = await fetch(URL_ROUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const newToken =
        data?.data?.tokens?.accessToken ||
        data?.data?.token ||
        data?.token ||
        data?.accessToken;
      const newRefreshToken =
        data?.data?.tokens?.refreshToken ||
        data?.data?.refreshToken ||
        data?.refreshToken;

      if (newToken) {
        sessionStorage.setItem('admin_access_token', newToken);
        sessionStorage.setItem('sessionToken', newToken);
        if (newRefreshToken) {
          sessionStorage.setItem('admin_refresh_token', newRefreshToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }
        isRefreshing = false;
        onRefreshed(newToken);
        return newToken;
      }
    }

    isRefreshing = false;
    return null;
  } catch (error) {
    isRefreshing = false;
    return null;
  }
};

/**
 * Authenticate admin against the remote API endpoint
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Incorrect email or password');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to authentication server. Please check your network connection.');
    }
    throw error;
  }
};

/**
 * Persist authentication tokens and user payload to localStorage or sessionStorage
 */
export const saveAuthData = (user, tokens, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const accessToken = tokens?.accessToken || tokens?.token || '';
  const refreshToken = tokens?.refreshToken || '';

  storage.setItem('admin_access_token', accessToken);
  storage.setItem('sessionToken', accessToken);
  storage.setItem('admin_refresh_token', refreshToken);
  storage.setItem('refreshToken', refreshToken);
  storage.setItem('admin_user', JSON.stringify(user));
  storage.setItem('auth_user', JSON.stringify(user));
};

/**
 * Retrieve saved auth details from local or session storage
 */
export const getStoredAuthData = () => {
  const token = getToken();
  const userStr =
    localStorage.getItem('admin_user') ||
    sessionStorage.getItem('admin_user') ||
    localStorage.getItem('auth_user') ||
    sessionStorage.getItem('auth_user');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token };
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  return null;
};

/**
 * Clear stored authentication tokens and user details
 */
export const clearAuthData = () => {
  const keys = [
    'admin_access_token',
    'admin_refresh_token',
    'admin_user',
    'sessionToken',
    'refreshToken',
    'auth_user',
  ];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/**
 * Utility to extract detailed validation error messages from API responses
 */
export const extractErrorMessage = (responseData, defaultMessage = 'Operation failed') => {
  if (!responseData) return defaultMessage;
  if (typeof responseData === 'string') return responseData;

  if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map(e => (typeof e === 'object' ? (e.msg || e.message || e.error || JSON.stringify(e)) : String(e)))
      .join(', ');
  }

  if (Array.isArray(responseData.error) && responseData.error.length > 0) {
    return responseData.error
      .map(e => (typeof e === 'object' ? (e.msg || e.message || e.error || JSON.stringify(e)) : String(e)))
      .join(', ');
  }

  if (Array.isArray(responseData.message) && responseData.message.length > 0) {
    return responseData.message.join(', ');
  }

  if (typeof responseData.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }

  if (typeof responseData.error === 'object' && responseData.error !== null) {
    return responseData.error.message || JSON.stringify(responseData.error);
  }

  return defaultMessage;
};

const getData = async (route, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const sessionToken = getToken();
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  const URL_ROUTE = `${API_URL}${cleanRoute}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const response = await fetch(URL_ROUTE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        return {
          success: false,
          error: Array.isArray(responseData?.error)
            ? responseData.error[0]
            : responseData?.error || responseData.message,
          data: responseData,
        };
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryResponse = await fetch(URL_ROUTE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          return {
            success: false,
            error: Array.isArray(retryData?.error)
              ? retryData.error[0]
              : retryData?.error || retryData.message,
            data: retryData,
          };
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = extractErrorMessage(responseData, `HTTP Error ${response.status}`);
      showSnackbar(`Response Error: ${errorMsg}`, 'error');
      return {
        success: false,
        error: errorMsg,
        data: responseData,
      };
    }

    return responseData;
  } catch (e) {
    console.error('API Error:', e);
    return { success: false, error: e.message || 'Network error occurred' };
  }
};

const postData = async (route, data, token) => {
  try {
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
    const URL_ROUTE = `${API_URL}${cleanRoute}`.replace(/\/+$/, '');
    const authToken = token || getToken();
    const isFormData = data instanceof FormData;
    const headers = {};

    // Only attach Authorization header if a token exists and we are not attempting a login request
    if (authToken && !cleanRoute.includes('auth/login')) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(URL_ROUTE, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        return {
          success: false,
          error: Array.isArray(responseData?.error)
            ? responseData.error[0]
            : responseData?.error || responseData.message,
          data: responseData,
        };
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryHeaders = { Authorization: `Bearer ${newToken}` };
        if (!isFormData) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        const retryResponse = await fetch(URL_ROUTE, {
          method: 'POST',
          headers: retryHeaders,
          body: isFormData ? data : JSON.stringify(data),
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          return {
            success: false,
            error: Array.isArray(retryData?.error)
              ? retryData.error[0]
              : retryData?.error || retryData.message,
            data: retryData,
          };
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('API Error Response:', responseData);
      const errorMsg = extractErrorMessage(responseData, `API Error ${response.status}`);
      showSnackbar(`Validation Error: ${errorMsg}`, 'error');
      return {
        success: false,
        error: errorMsg,
        data: responseData,
      };
    }

    return responseData;
  } catch (e) {
    console.error('Unexpected Error:', e.message);
    return { success: false, error: e.message || 'Network error occurred' };
  }
};

const patchData = async (route, body = {}) => {
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  const URL_ROUTE = `${API_URL}${cleanRoute}`;
  const sessionToken = getToken();
  try {
    const response = await fetch(URL_ROUTE, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        return {
          success: false,
          error: Array.isArray(responseData?.error)
            ? responseData.error[0]
            : responseData?.error || responseData.message,
          data: responseData,
        };
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryResponse = await fetch(URL_ROUTE, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify(body),
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          return {
            success: false,
            error: Array.isArray(retryData?.error)
              ? retryData.error[0]
              : retryData?.error || retryData.message,
            data: retryData,
          };
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Response Error:', responseData);
      return {
        success: false,
        error: Array.isArray(responseData?.error)
          ? responseData.error[0]
          : responseData?.error || responseData.message,
        data: responseData,
      };
    }

    return responseData;
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

const putData = async (route, data, token) => {
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  const URL_ROUTE = `${API_URL}${cleanRoute}`.replace(/\/+$/, '');
  const authToken = token || getToken();
  const isFormData = data instanceof FormData;
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(URL_ROUTE, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        throw new Error(responseData.message || `Error: ${response.status}`);
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryHeaders = { Authorization: `Bearer ${newToken}` };
        if (!isFormData) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        const retryResponse = await fetch(URL_ROUTE, {
          method: 'PUT',
          headers: retryHeaders,
          body: isFormData ? data : JSON.stringify(data),
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          throw new Error(retryData.message || `Error: ${retryResponse.status}`);
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('API Error Response:', responseData);
      const errorMsg = extractErrorMessage(responseData, `API Error ${response.status}`);
      showSnackbar(`Validation Error: ${errorMsg}`, 'error');
      return {
        success: false,
        error: errorMsg,
        data: responseData,
      };
    }

    return responseData;
  } catch (e) {
    console.error('Unexpected Error:', e.message);
    return { success: false, error: e.message || 'Network error occurred' };
  }
};

const deleteData = async (route, token) => {
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  const URL_ROUTE = `${API_URL}${cleanRoute}`.replace(/\/+$/, '');
  const authToken = token || getToken();
  try {
    const response = await fetch(URL_ROUTE, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        return {
          success: false,
          error: Array.isArray(responseData?.error)
            ? responseData.error[0]
            : responseData?.error || responseData.message,
          data: responseData,
        };
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryResponse = await fetch(URL_ROUTE, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          return {
            success: false,
            error: Array.isArray(retryData?.error)
              ? retryData.error[0]
              : retryData?.error || retryData.message,
            data: retryData,
          };
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Response Error:', responseData);
      return {
        success: false,
        error: Array.isArray(responseData?.error)
          ? responseData.error[0]
          : responseData?.error || responseData.message,
        data: responseData,
      };
    }

    return responseData;
  } catch (e) {
    console.error('Unexpected Error:', e.message);
    throw e;
  }
};

const uploadFile = async (route, file, token, method = 'POST') => {
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  const URL_ROUTE = `${API_URL}${cleanRoute}`.replace(/\/+$/, '');
  const authToken = token || getToken();
  try {
    if (!file) {
      return { success: false, message: 'No file selected' };
    }

    const headers = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(URL_ROUTE, {
      method,
      headers,
      body: file,
    });

    if (response.status === 401) {
      if (URL_ROUTE.includes('/auth/')) {
        const responseData = await response.json();
        return {
          success: false,
          error: Array.isArray(responseData?.error)
            ? responseData.error[0]
            : responseData?.error || responseData.message,
          data: responseData,
        };
      }

      const newToken = await handleTokenRefresh();
      if (newToken) {
        const retryHeaders = { Authorization: `Bearer ${newToken}` };
        const retryResponse = await fetch(URL_ROUTE, {
          method,
          headers: retryHeaders,
          body: file,
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          return {
            success: false,
            error: Array.isArray(retryData?.error)
              ? retryData.error[0]
              : retryData?.error || retryData.message,
            data: retryData,
          };
        }
        return retryData;
      }

      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Response Error:', responseData);
      return {
        success: false,
        error: Array.isArray(responseData?.error)
          ? responseData.error[0]
          : responseData?.error || responseData.message,
        data: responseData,
      };
    }

    return responseData;
  } catch (error) {
    console.error('File Upload Error:', error);
    return { success: false, message: 'Error uploading file' };
  }
};

export const fetchCustomers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.is_blocked !== undefined) queryParams.append('is_blocked', params.is_blocked);

  const route = `admin/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getCustomerById = async (id) => {
  return await getData(`admin/customers/${id}`);
};

export const updateCustomer = async (id, customerData) => {
  return await putData(`admin/customers/${id}`, customerData);
};

export const updateCustomerStatus = async (id, status) => {
  return await patchData(`admin/customers/${id}/status`, { status });
};

export const blockCustomer = async (id) => {
  return await patchData(`admin/customers/${id}/block`);
};

export const unblockCustomer = async (id) => {
  return await patchData(`admin/customers/${id}/unblock`);
};

export const getCustomerWishlist = async (id) => {
  return await getData(`admin/customers/${id}/wishlist`);
};

export const getCustomerCart = async (id) => {
  return await getData(`admin/customers/${id}/cart`);
};

// ─── Coupons API Endpoints ──────────────────────────────────────────────────
export const fetchCoupons = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.status) queryParams.append('status', params.status);

  const route = `admin/coupons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const createCoupon = async (couponData) => {
  return await postData('admin/coupons', couponData);
};

export const updateCoupon = async (id, couponData) => {
  return await putData(`admin/coupons/${id}`, couponData);
};

export const deleteCoupon = async (id) => {
  return await deleteData(`admin/coupons/${id}`);
};

export const toggleCouponStatus = async (id, isActive) => {
  return await patchData(`admin/coupons/${id}/status`, { isActive });
};

export const getCouponUsageReport = async () => {
  return await getData('admin/coupons/usage-report');
};

// ─── Orders API Endpoints ──────────────────────────────────────────────────
export const fetchOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const route = `admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Recipes API Endpoints ──────────────────────────────────────────────────
export const fetchRecipes = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);

  const route = `admin/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};


export const createRecipe = async (recipeData) => {
  return await postData('admin/recipes', recipeData);
};

export const updateRecipe = async (id, recipeData) => {
  return await putData(`admin/recipes/${id}`, recipeData);
};

export const deleteRecipe = async (id) => {
  return await deleteData(`admin/recipes/${id}`);
};

export const toggleRecipeStatus = async (id, is_active) => {
  return await patchData(`admin/recipes/${id}/status`, { is_active });
};

// ─── Blogs API Endpoints ──────────────────────────────────────────────────
export const fetchBlogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const route = `admin/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const createBlog = async (blogData) => {
  return await postData('admin/blogs', blogData);
};

export const updateBlog = async (id, blogData) => {
  return await putData(`admin/blogs/${id}`, blogData);
};

export const deleteBlog = async (id) => {
  return await deleteData(`admin/blogs/${id}`);
};

export const toggleBlogStatus = async (id, isActive) => {
  return await patchData(`admin/blogs/${id}/status`, { isActive });
};

// ─── Inventory API Endpoints ────────────────────────────────────────────────
export const fetchInventory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
  const route = `admin/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Blog Categories API Endpoints ──────────────────────────────────────────
export const fetchBlogCategories = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const route = `admin/blog-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const createBlogCategory = async (categoryData) => {
  return await postData('admin/blog-categories', categoryData);
};

export const updateBlogCategory = async (id, categoryData) => {
  return await putData(`admin/blog-categories/${id}`, categoryData);
};

export const deleteBlogCategory = async (id) => {
  return await deleteData(`admin/blog-categories/${id}`);
};

// ─── Cuisines API Endpoints ──────────────────────────────────────────────────
export const fetchCuisines = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const route = `admin/cuisines${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const createCuisine = async (cuisineData) => {
  return await postData('admin/cuisines', cuisineData);
};

export const updateCuisine = async (id, cuisineData) => {
  return await putData(`admin/cuisines/${id}`, cuisineData);
};

export const deleteCuisine = async (id) => {
  return await deleteData(`admin/cuisines/${id}`);
};

// ─── Offers API Endpoints ────────────────────────────────────────────────────
export const fetchOffers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);

  const route = `admin/offers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const createOffer = async (offerData) => {
  if (offerData instanceof FormData) {
    return await uploadFile('admin/offers', offerData, null, 'POST');
  }
  return await postData('admin/offers', offerData);
};

export const updateOffer = async (id, offerData) => {
  if (offerData instanceof FormData) {
    return await uploadFile(`admin/offers/${id}`, offerData, null, 'PUT');
  }
  return await putData(`admin/offers/${id}`, offerData);
};

export const deleteOffer = async (id) => {
  return await deleteData(`admin/offers/${id}`);
};

export const toggleOfferStatus = async (id) => {
  return await patchData(`admin/offers/${id}/toggle-status`);
};

export const addProductsToOffer = async (id, productIds) => {
  return await postData(`admin/offers/${id}/products`, { productIds });
};

export const mapProductsToOffer = async (id, productIds) => {
  return await postData(`admin/offers/${id}/products`, { productIds });
};

export const fetchOfferProducts = async (id) => {
  return await getData(`admin/offers/${id}/products`);
};

export const getOfferProducts = async (id) => {
  return await getData(`admin/offers/${id}/products`);
};

export const removeProductFromOffer = async (id, productId) => {
  return await deleteData(`admin/offers/${id}/products/${productId}`);
};

export const deleteOfferProduct = async (id, productId) => {
  return await deleteData(`admin/offers/${id}/products/${productId}`);
};


// ─── Banners API Endpoints ───────────────────────────────────────────────────
export const fetchBanners = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.pageType) queryParams.append('pageType', params.pageType);

  const route = `admin/banners${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getBannerById = async (id) => {
  return await getData(`admin/banners/${id}`);
};

export const createBanner = async (bannerData) => {
  if (bannerData instanceof FormData) {
    return await uploadFile('admin/banners', bannerData, null, 'POST');
  }
  return await postData('admin/banners', bannerData);
};

export const updateBanner = async (id, bannerData) => {
  if (bannerData instanceof FormData) {
    return await uploadFile(`admin/banners/${id}`, bannerData, null, 'PUT');
  }
  return await putData(`admin/banners/${id}`, bannerData);
};

export const deleteBanner = async (id) => {
  return await deleteData(`admin/banners/${id}`);
};


// ─── Enquiries API Endpoints ──────────────────────────────────────────────────
export const fetchEnquiries = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);

  const route = `admin/enquiries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getEnquiryById = async (id) => {
  return await getData(`admin/enquiries/${id}`);
};

export const deleteEnquiry = async (id) => {
  return await deleteData(`admin/enquiries/${id}`);
};

export const replyEnquiry = async (id, replyMessage) => {
  return await patchData(`admin/enquiries/${id}/reply`, { replyMessage });
};

export const updateEnquiryStatus = async (id, status) => {
  return await patchData(`admin/enquiries/${id}/status`, { status });
};

// ─── Notifications API Endpoints ─────────────────────────────────────────────
export const sendUserNotification = async (data) => {
  return await postData('admin/notifications/send', data);
};

export const broadcastNotification = async (data) => {
  return await postData('admin/notifications/broadcast', data);
};

export const fetchNotificationHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const route = `admin/notifications/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Reports API Endpoints ────────────────────────────────────────────────────
export const fetchSalesReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchCustomersReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchOrdersReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchInventoryReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  const route = `admin/reports/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchCouponsReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/coupons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchTaxesReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/taxes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchDeliveriesReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/deliveries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchPaymentsReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const route = `admin/reports/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Settings API Endpoints ───────────────────────────────────────────────────
export const fetchSettings = async () => {
  return await getData('admin/settings');
};

export const updateSettings = async (settingsData) => {
  return await putData('admin/settings', settingsData);
};

// ─── Search Analytics API Endpoints ───────────────────────────────────────────
export const fetchSearchAnalytics = async () => {
  return await getData('admin/search/analytics');
};

export const fetchTopSearches = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  const route = `admin/search/top${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Admin Roles API Endpoints ────────────────────────────────────────────────
export const fetchRoles = async () => {
  return await getData('admin/roles');
};

export const createRole = async (roleData) => {
  return await postData('admin/roles', roleData);
};

export const updateRole = async (id, roleData) => {
  return await putData(`admin/roles/${id}`, roleData);
};

export const deleteRole = async (id) => {
  return await deleteData(`admin/roles/${id}`);
};

// ─── Admin Users API Endpoints ────────────────────────────────────────────────
export const fetchAdminUsers = async () => {
  return await getData('admin/users');
};

export const getAdminUserById = async (id) => {
  return await getData(`admin/users/${id}`);
};

export const updateAdminUser = async (id, userData) => {
  return await patchData(`admin/users/${id}`, userData);
};

export const deleteAdminUser = async (id) => {
  return await deleteData(`admin/users/${id}`);
};

// ─── Testimonials API Endpoints ───────────────────────────────────────────────
export const fetchTestimonials = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);

  const route = `admin/testimonials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getTestimonialById = async (id) => {
  return await getData(`admin/testimonials/${id}`);
};

export const createTestimonial = async (data) => {
  return await postData('admin/testimonials', data);
};

export const updateTestimonial = async (id, data) => {
  return await putData(`admin/testimonials/${id}`, data);
};

export const deleteTestimonial = async (id) => {
  return await deleteData(`admin/testimonials/${id}`);
};

// ─── Audit Logs API Endpoints ──────────────────────────────────────────────────
export const fetchAuditLogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.action) queryParams.append('action', params.action);
  if (params.adminId) queryParams.append('adminId', params.adminId);
  if (params.entityType) queryParams.append('entityType', params.entityType);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit || 50);

  const route = `admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

// ─── Admin Payments API Endpoints ─────────────────────────────────────────────
export const fetchAdminPayments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const route = `admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchFailedPayments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const route = `admin/payments/failed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getPaymentById = async (id) => {
  return await getData(`admin/payments/${id}`);
};

export const refundPayment = async (id, amountData = {}) => {
  return await postData(`admin/payments/${id}/refund`, amountData);
};

// ─── Products Analytics & Quick Toggles API Endpoints ─────────────────────────
export const fetchAllProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  const route = `admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const fetchMostViewedProducts = async () => {
  return await getData('admin/products/most-viewed');
};

export const fetchTrendingProducts = async () => {
  return await getData('admin/products/trending');
};

export const fetchBestSellerProducts = async () => {
  return await getData('admin/products/best-seller');
};

export const fetchFeaturedProducts = async () => {
  return await getData('admin/products/featured');
};

export const fetchRelatedProducts = async (id) => {
  return await getData(`admin/products/${id}/related`);
};

export const toggleProductFeatured = async (id) => {
  return await patchData(`admin/products/${id}/toggle-featured`);
};

export const toggleProductBestSeller = async (id) => {
  return await patchData(`admin/products/${id}/toggle-best-seller`);
};

export const toggleProductStatus = async (id) => {
  return await patchData(`admin/products/${id}/toggle-status`);
};

export const toggleProductInStock = async (id) => {
  return await patchData(`admin/products/${id}/toggle-instock`);
};

// ─── Dashboard Overview API Endpoint ─────────────────────────────────────────
export const fetchDashboardData = async () => {
  try {
    const res = await getData('admin/dashboard');
    if (res && res.success !== false && res.data) {
      return res;
    }
  } catch (err) {
    console.warn('Dashboard backend API returned error. Using live client calculations.', err);
  }
  return {
    success: true,
    data: null
  };
};

// ─── Home Config API Endpoints ──────────────────────────────────────────────
export const fetchHomeConfigs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  
  const route = `admin/home-config${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getHomeConfigById = async (id) => {
  return await getData(`admin/home-config/${id}`);
};

export const createHomeConfig = async (configData) => {
  if (configData instanceof FormData) {
    return await uploadFile('admin/home-config', configData, null, 'POST');
  }
  return await postData('admin/home-config', configData);
};

export const updateHomeConfig = async (id, configData) => {
  if (configData instanceof FormData) {
    return await uploadFile(`admin/home-config/${id}`, configData, null, 'PUT');
  }
  return await putData(`admin/home-config/${id}`, configData);
};

export const deleteHomeConfig = async (id) => {
  return await deleteData(`admin/home-config/${id}`);
};

export const toggleHomeConfigStatus = async (id, enabled) => {
  return await patchData(`admin/home-config/${id}/toggle`, { enabled });
};

export const reorderHomeConfigs = async (items) => {
  return await putData('admin/home-config/reorder', { items });
};

// ─── Delivery Zones API Endpoints ───────────────────────────────────────────
export const fetchDeliveryZones = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const route = `admin/delivery-zones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await getData(route);
};

export const getDeliveryZoneById = async (id) => {
  return await getData(`admin/delivery-zones/${id}`);
};

export const createDeliveryZone = async (zoneData) => {
  return await postData('admin/delivery-zones', zoneData);
};

export const updateDeliveryZone = async (id, zoneData) => {
  return await putData(`admin/delivery-zones/${id}`, zoneData);
};

export const deleteDeliveryZone = async (id) => {
  return await deleteData(`admin/delivery-zones/${id}`);
};

export { getData, postData, putData, patchData, deleteData, uploadFile };




