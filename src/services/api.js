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

/**
 * Retrieve saved access token from storage
 */
const getToken = () => {
  return (
    sessionStorage.getItem('admin_access_token') ||
    localStorage.getItem('admin_access_token') ||
    sessionStorage.getItem('sessionToken') ||
    localStorage.getItem('sessionToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('accessToken') ||
    ''
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

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token };
    } catch {
      return null;
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();

    if (!response.ok) {
      showSnackbar(`Response Error: ${JSON.stringify(responseData)}`, 'error');
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
    return { success: false, error: e.message || 'Network error occurred' };
  }
};

const postData = async (route, data, token) => {
  try {
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return { success: false, error: 'Session timed out. Please login to continue.' };
    }

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Response Error:', responseData);
      throw new Error(responseData.message || `Error: ${response.status}`);
    }

    return responseData;
  } catch (e) {
    console.error('Unexpected Error:', e.message);
    throw e;
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
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

const uploadFile = async (route, file, token) => {
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
      method: 'POST',
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
          method: 'POST',
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

      showSnackbar('Session timed out. Please login to continue.', 'error');
      clearAuthData();
      if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
        window.location.href = '/login';
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

export { getData, postData, putData, patchData, deleteData, uploadFile };
