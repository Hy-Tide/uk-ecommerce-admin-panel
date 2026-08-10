import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  ShieldCheck,
  Layout,
  ShoppingBag,
  Folder,
  Award,
  Package,
  FileText,
  Users,
  Ticket,
  Truck,
  FileCode,
  PenTool,
  ChefHat,
  MessageSquare,
  BarChart3,
  CreditCard,
  Settings as SettingsIcon,
  UserCheck,
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
  HelpCircle,
  User
} from 'lucide-react';

// Import API Services
import { getStoredAuthData, clearAuthData, getData } from './services/api';

// Import reusable components
import ToastContainer from './components/Notification';
import CommandPalette from './components/CommandPalette';
import Button from './components/Button';
import PlaceholderPage from './components/PlaceholderPage';
import NotFound from './components/NotFound';

// Lazy Loaded Page Modules
const Login = React.lazy(() => import('./modules/Login'));
const Dashboard = React.lazy(() => import('./modules/Dashboard'));
const Products = React.lazy(() => import('./modules/Products'));
const Categories = React.lazy(() => import('./modules/Categories'));
const Brands = React.lazy(() => import('./modules/Brands'));
const Inventory = React.lazy(() => import('./modules/Inventory'));
const Orders = React.lazy(() => import('./modules/Orders'));
const Customers = React.lazy(() => import('./modules/Customers'));
const Enquiries = React.lazy(() => import('./modules/Enquiries'));
const Notifications = React.lazy(() => import('./modules/Notifications'));
const Coupons = React.lazy(() => import('./modules/Coupons'));
const Offers = React.lazy(() => import('./modules/Offers'));
const Delivery = React.lazy(() => import('./modules/Delivery'));
const CMS = React.lazy(() => import('./modules/CMS'));
const HomeConfiguration = React.lazy(() => import('./modules/HomeConfiguration'));
const Blogs = React.lazy(() => import('./modules/Blogs'));
const Recipes = React.lazy(() => import('./modules/Recipes'));
const Testimonials = React.lazy(() => import('./modules/Testimonials'));
const WhatsApp = React.lazy(() => import('./modules/WhatsApp'));
const Reports = React.lazy(() => import('./modules/Reports'));
const Payments = React.lazy(() => import('./modules/Payments'));
const Settings = React.lazy(() => import('./modules/Settings'));
const UserManagement = React.lazy(() => import('./modules/UserManagement'));
const Security = React.lazy(() => import('./modules/Security'));
const Banners = React.lazy(() => import('./modules/Banners'));

// Import initial database seeds
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_DRIVERS,
  INITIAL_ROLES_MATRIX,
  INITIAL_CMS_DATA,
  INITIAL_BLOGS,
  INITIAL_RECIPES,
  INITIAL_AUDIT_LOGS
} from './data/seedData';

// Full Screen Shimmer Skeleton loader for page transitions and lazy imports
const LoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: '12px 0' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="shimmer" style={{ width: '220px', height: '28px', borderRadius: '8px' }} />
      <div className="shimmer" style={{ width: '360px', height: '16px', borderRadius: '6px' }} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <div className="shimmer" style={{ height: '110px', borderRadius: '14px' }} />
      <div className="shimmer" style={{ height: '110px', borderRadius: '14px' }} />
      <div className="shimmer" style={{ height: '110px', borderRadius: '14px' }} />
      <div className="shimmer" style={{ height: '110px', borderRadius: '14px' }} />
    </div>

    <div className="shimmer" style={{ width: '100%', height: '50px', borderRadius: '12px' }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="shimmer" style={{ width: '100%', height: '46px', borderRadius: '10px' }} />
      ))}
    </div>
  </div>
);

// Module Error Boundary Component to prevent white screens on navigation or render errors
export class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured module render error in ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            padding: '32px',
            textAlign: 'center',
            gap: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            margin: '20px 0'
          }}
        >
          <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
            <AlertCircle size={40} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Module Display Restored
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '460px', margin: 0 }}>
            The module encountered a temporary rendering condition. Click below to reload state cleanly.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Module
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (window.location.pathname !== '/dashboard') {
                  window.location.href = '/dashboard';
                }
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// RBAC Protected Route Wrapper (Declared outside to prevent unmounting components during sibling state changes)
export const ProtectedRoute = ({ children, moduleKey, user, rolePermissions = {}, navigate }) => {
  const roleName = user?.role || 'Super Admin';
  const activeUserPermissions = rolePermissions[roleName] || rolePermissions['Super Admin'] || {};
  const hasAccess = activeUserPermissions[moduleKey] !== false;

  if (!hasAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '20px' }}>
        <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
          <ShieldAlert size={48} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Permission Denied</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '14px' }}>
          Your account role <strong>({roleName})</strong> is restricted from viewing the module <strong>({moduleKey})</strong>.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate && navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return children;
};

// Extracted, non-remounting Top-Level Layout Component
export const AppLayout = ({
  user,
  setUser,
  theme,
  setTheme,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  commandPaletteOpen,
  setCommandPaletteOpen,
  toasts,
  removeToast,
  sessionTimeoutTime,
  sidebarItems,
  activeTab,
  rolePermissions,
  executeQuickAction,
  navigate,
  showQuickMenu,
  setShowQuickMenu,
  showNotificationPanel,
  setShowNotificationPanel
}) => {
  const activeSidebarItem = sidebarItems.find((item) => item.key === activeTab);
  const sidebarNavRef = React.useRef(null);

  const [cmsOpen, setCmsOpen] = React.useState(() => {
    return activeTab === 'cms' || activeTab === 'home-config';
  });

  const processedItems = React.useMemo(() => {
    return sidebarItems.reduce((acc, item) => {
      if (item.isGroup) {
        if (sidebarCollapsed) {
          item.children.forEach(child => {
            acc.push({
              ...child,
              isRestrictedKey: child.key
            });
          });
        } else {
          acc.push(item);
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [sidebarItems, sidebarCollapsed]);

  // Restore sidebar scroll position on mount / render
  React.useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll && sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  const handleSidebarScroll = (e) => {
    sessionStorage.setItem('sidebar-scroll', e.target.scrollTop);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>

      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside
        style={{
          width: sidebarCollapsed ? '72px' : '260px',
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
        }}
        className="sidebar-container"
      >
        {/* Brand Header */}
        <div
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            padding: sidebarCollapsed ? '0' : '0 24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="Grandma's Basket Logo"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                borderRadius: '6px',
                backgroundColor: '#fff',
                padding: '2px',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}
            />
            {!sidebarCollapsed && <span style={{ fontWeight: '800', letterSpacing: '-0.02em', fontSize: '16px' }}>Grandma's Basket</span>}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed expander arrow */}
        {sidebarCollapsed && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav
          ref={sidebarNavRef}
          onScroll={handleSidebarScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          {processedItems.map((item) => {
            if (item.isGroup) {
              const GroupIcon = item.icon || HelpCircle;
              const hasActiveChild = item.children.some(c => activeTab === c.key);
              const isOpen = cmsOpen || hasActiveChild;

              return (
                <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <button
                    onClick={() => setCmsOpen(!cmsOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      justifyContent: 'flex-start',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    title={item.label}
                    type="button"
                  >
                    <GroupIcon size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>
                      ▶
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '14px', borderLeft: '1.5px solid var(--border-color)', marginLeft: '24px', marginTop: '2px', marginBottom: '2px' }}>
                      {item.children.map(child => {
                        const ChildIcon = child.icon || HelpCircle;
                        const isChildRestricted = rolePermissions[user.role]?.[child.key] === false;
                        const childActive = activeTab === child.key;

                        return (
                          <NavLink
                            key={child.key}
                            to={`/${child.key}`}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                              fontWeight: isActive ? '600' : '500',
                              border: 'none',
                              textDecoration: 'none',
                              cursor: isChildRestricted ? 'not-allowed' : 'pointer',
                              width: '100%',
                              opacity: isChildRestricted ? 0.35 : 1
                            })}
                            onClick={(e) => {
                              if (isChildRestricted) {
                                e.preventDefault();
                              } else {
                                setMobileMenuOpen(false);
                              }
                            }}
                            title={child.label}
                          >
                            <ChildIcon size={16} style={{ color: childActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                            <span style={{ fontSize: '12px' }}>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const IconComponent = item.icon || HelpCircle;
            const targetKey = item.isRestrictedKey || item.key;
            const isTabRestricted = rolePermissions[user.role]?.[targetKey] === false;

            return (
              <NavLink
                key={item.key}
                to={`/${item.key}`}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '12px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '10px' : '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: isTabRestricted ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  opacity: isTabRestricted ? 0.35 : 1,
                  position: 'relative'
                })}
                onClick={(e) => {
                  if (isTabRestricted) {
                    e.preventDefault();
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                title={item.label}
              >
                <IconComponent size={18} style={{ color: activeTab === item.key ? 'var(--primary)' : 'var(--text-muted)' }} />
                {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>{item.label}</span>}
                {item.badge !== undefined && item.badge > 0 && !sidebarCollapsed && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: activeTab === item.key ? 'var(--primary)' : 'var(--border-color)',
                      color: activeTab === item.key ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer profile area */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.role}</span>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => {
                  clearAuthData();
                  setUser(null);
                }}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
          backgroundColor: 'var(--bg-app)',
          transition: 'margin-left var(--transition-normal)'
        }}
      >
        {/* Sticky Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-header)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Mobile hamburger menu toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-hamburger-btn"
              style={{ display: 'none', border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar activator */}
            <div
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-muted)',
                width: '100%',
                maxWidth: '220px'
              }}
            >
              <Search size={14} />
              <span>Search Command...</span>
              <kbd style={{ marginLeft: 'auto', fontSize: '9px', backgroundColor: 'var(--border-color)', padding: '2px 4px', borderRadius: '4px' }}>
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Header actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>

            {/* Quick Actions menu */}
            <div style={{ position: 'relative' }}>
              <Button variant="outline" size="sm" onClick={() => setShowQuickMenu(!showQuickMenu)}>
                Quick Action
              </Button>
              {showQuickMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '38px',
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    width: '180px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <button
                    onClick={() => { executeQuickAction('add-product'); setShowQuickMenu(false); }}
                    style={{ padding: '8px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '6px' }}
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => { executeQuickAction('create-coupon'); setShowQuickMenu(false); }}
                    style={{ padding: '8px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '6px' }}
                  >
                    Create Coupon
                  </button>
                  <button
                    onClick={() => { executeQuickAction('whatsapp-campaign'); setShowQuickMenu(false); }}
                    style={{ padding: '8px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '6px' }}
                  >
                    WhatsApp Campaign
                  </button>
                </div>
              )}
            </div>

            {/* Notification alert dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', position: 'relative' }}
              >
                <Bell size={20} />
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--danger)',
                    borderRadius: '50%'
                  }}
                />
              </button>

              {showNotificationPanel && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '16px',
                    width: '320px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>System Notifications</span>
                    <button onClick={() => setShowNotificationPanel(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <strong>Low Stock Warning</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Organic Whole Milk is below the minimum limit.</p>
                    </div>
                    <div style={{ fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <strong>New Customer Registration</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Emma Rodriguez created an account.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Light/Dark mode switcher */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Timeout: {Math.floor(sessionTimeoutTime / 60)}:{(sessionTimeoutTime % 60).toString().padStart(2, '0')}
            </span>

          </div>
        </header>

        {/* Main Panel Content with Breadcrumb */}
        <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

          {/* Breadcrumb row */}
          <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'capitalize' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{activeSidebarItem?.label || activeTab}</span>
          </div>

          {/* Nested route content injected here with error boundary */}
          <ModuleErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ModuleErrorBoundary>

        </main>
      </div>

      {/* 3. MOBILE SLIDE OVER SIDEBAR */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001, display: 'flex' }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
          <aside style={{ position: 'relative', width: '260px', height: '100%', backgroundColor: 'var(--bg-card)', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            {/* Same navigation inside mobile drawer */}
            <div style={{ height: '64px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800' }}>UK E-commerce Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sidebarItems.map(item => {
                if (item.isGroup) {
                  return (
                    <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 16px', letterSpacing: '0.05em' }}>
                        {item.label}
                      </div>
                      {item.children.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.key}
                            to={`/${child.key}`}
                            onClick={() => setMobileMenuOpen(false)}
                            style={({ isActive }) => ({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 16px',
                              paddingLeft: '24px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                              border: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left'
                            })}
                          >
                            <ChildIcon size={16} />
                            <span style={{ fontSize: '13px' }}>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  );
                }

                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={`/${item.key}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
                    })}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: '13px' }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Global search trigger keyboard overlay */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => navigate(`/${tab}`)}
        onQuickAction={executeQuickAction}
      />

      {/* Floats notifications manager */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-container {
            display: none !important;
          }
          div[style*="marginLeft: 260px"], div[style*="marginLeft: 72px"] {
            margin-left: 0 !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export const AppContent = () => {
  // Authentication & Session
  const [user, setUser] = useState(() => {
    const stored = getStoredAuthData();
    return stored?.user || null;
  });
  const [sessionTimeoutTime, setSessionTimeoutTime] = useState(3600); // 1 hour session (3600 seconds)

  // Theme Mode
  const [theme, setTheme] = useState('light');

  // Sidebar Layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command Palette & Search
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Live Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Live Real Backend Databases Only (Initialized empty, populated dynamically from APIs)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [users, setUsers] = useState([]);
  const [cmsData, setCmsData] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Custom navigation bypass (e.g. Dashboard clicking add-product triggers drawer in Products module)
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false);

  // Quick Actions Dropdown menu state
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Header Notification panel list toggle
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Determine activeTab for headers and indicators
  const activeTab = location.pathname.substring(1) || 'dashboard';

  // Add Toast helper
  const addToast = (message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };



  // Enforce Light/Dark Mode variables on DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Centralized Real Data Initializer with Lazy Loading
  const loadedFlags = React.useRef({
    products: false, orders: false, categories: false, brands: false, customers: false,
    coupons: false, users: false, roles: false, auditLogs: false, blogs: false,
    recipes: false, cmsData: false
  });

  useEffect(() => {
    if (!user) return;

    // 1. Fetch Products
    const loadProducts = async () => {
      if (loadedFlags.current.products) return;
      try {
        const prodRes = await getData('admin/products');
        if (prodRes && prodRes.success !== false) {
          const list = prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
          if (Array.isArray(list)) setProducts(list);
          loadedFlags.current.products = true;
        }
      } catch (e) { console.error('Error loading real products:', e); }
    };

    // 2. Fetch Orders
    const loadOrders = async () => {
      if (loadedFlags.current.orders) return;
      try {
        const ordRes = await getData('admin/orders');
        if (ordRes && ordRes.success !== false) {
          const list = ordRes.data?.orders || (Array.isArray(ordRes.data) ? ordRes.data : []);
          if (Array.isArray(list)) setOrders(list);
          loadedFlags.current.orders = true;
        }
      } catch (e) { console.error('Error loading real orders:', e); }
    };

    // 3. Fetch Categories
    const loadCategories = async () => {
      if (loadedFlags.current.categories) return;
      try {
        const catRes = await getData('admin/categories');
        if (catRes && catRes.success !== false) {
          const list = catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
          if (Array.isArray(list)) setCategories(list);
          loadedFlags.current.categories = true;
        }
      } catch (e) { console.error('Error loading real categories:', e); }
    };

    // 4. Fetch Brands
    const loadBrands = async () => {
      if (loadedFlags.current.brands) return;
      try {
        const brandRes = await getData('admin/brands');
        if (brandRes && brandRes.success !== false) {
          const list = brandRes.data?.brands || (Array.isArray(brandRes.data) ? brandRes.data : []);
          if (Array.isArray(list)) setBrands(list);
          loadedFlags.current.brands = true;
        }
      } catch (e) { console.error('Error loading real brands:', e); }
    };

    // 5. Fetch Customers
    const loadCustomers = async () => {
      if (loadedFlags.current.customers) return;
      try {
        const custRes = await getData('admin/customers');
        if (custRes && custRes.success !== false) {
          const list = custRes.data?.customers || (Array.isArray(custRes.data) ? custRes.data : []);
          if (Array.isArray(list)) setCustomers(list);
          loadedFlags.current.customers = true;
        }
      } catch (e) { console.error('Error loading real customers:', e); }
    };

    // 6. Fetch Coupons
    const loadCoupons = async () => {
      if (loadedFlags.current.coupons) return;
      try {
        const coupRes = await getData('admin/coupons');
        if (coupRes && coupRes.success !== false) {
          const list = coupRes.data?.coupons || (Array.isArray(coupRes.data) ? coupRes.data : []);
          if (Array.isArray(list)) setCoupons(list);
          loadedFlags.current.coupons = true;
        }
      } catch (e) { console.error('Error loading real coupons:', e); }
    };

    // 7. Fetch Admin Users
    const loadUsers = async () => {
      if (loadedFlags.current.users) return;
      try {
        const userRes = await getData('admin/users');
        if (userRes && userRes.success !== false) {
          const list = userRes.data?.users || (Array.isArray(userRes.data) ? userRes.data : []);
          if (Array.isArray(list)) setUsers(list);
          loadedFlags.current.users = true;
        }
      } catch (e) { console.error('Error loading real users:', e); }
    };

    // 8. Fetch Roles Matrix
    const loadRoles = async () => {
      if (loadedFlags.current.roles) return;
      try {
        const roleRes = await getData('admin/roles');
        if (roleRes && roleRes.success !== false) {
          const roles = roleRes.data?.roles || (Array.isArray(roleRes.data) ? roleRes.data : []);
          if (Array.isArray(roles) && roles.length > 0) {
            const matrix = {};
            roles.forEach(r => {
              matrix[r.name] = {
                dashboard: true, products: true, categories: true, brands: true, inventory: true,
                orders: true, customers: true, coupons: true, delivery: true, cms: true,
                blogs: true, recipes: true, whatsapp: true, reports: true, settings: true,
                user_management: true, security: true, banners: true
              };
            });
            setRolePermissions(matrix);
            loadedFlags.current.roles = true;
          }
        }
      } catch (e) { console.error('Error loading real roles:', e); }
    };

    // 9. Fetch Audit Logs
    const loadAuditLogs = async () => {
      if (loadedFlags.current.auditLogs) return;
      try {
        const auditRes = await getData('admin/audit-logs');
        if (auditRes && auditRes.success !== false) {
          const logs = auditRes.data?.logs || (Array.isArray(auditRes.data) ? auditRes.data : []);
          if (Array.isArray(logs)) setAuditLogs(logs);
          loadedFlags.current.auditLogs = true;
        }
      } catch (e) { console.error('Error loading real audit logs:', e); }
    };

    // 10. Fetch Blogs
    const loadBlogs = async () => {
      if (loadedFlags.current.blogs) return;
      try {
        const blogRes = await getData('admin/blogs');
        if (blogRes && blogRes.success !== false) {
          const list = blogRes.data?.blogs || (Array.isArray(blogRes.data) ? blogRes.data : []);
          if (Array.isArray(list)) setBlogs(list);
          loadedFlags.current.blogs = true;
        }
      } catch (e) { console.error('Error loading real blogs:', e); }
    };

    // 11. Fetch Recipes
    const loadRecipes = async () => {
      if (loadedFlags.current.recipes) return;
      try {
        const recipeRes = await getData('admin/recipes');
        if (recipeRes && recipeRes.success !== false) {
          const list = recipeRes.data?.recipes || (Array.isArray(recipeRes.data) ? recipeRes.data : []);
          if (Array.isArray(list)) setRecipes(list);
          loadedFlags.current.recipes = true;
        }
      } catch (e) { console.error('Error loading real recipes:', e); }
    };

    // 12. Fetch CMS
    const loadCmsData = async () => {
      if (loadedFlags.current.cmsData) return;
      try {
        const cmsRes = await getData('admin/cms');
        if (cmsRes && cmsRes.success !== false && cmsRes.data) {
          setCmsData(cmsRes.data);
          loadedFlags.current.cmsData = true;
        }
      } catch (e) { console.error('Error loading real CMS:', e); }
    };

    // Always fetch Roles and Users globally early to prevent layout shifting or routing flickers 
    // caused by Role-based access checks (ProtectedRoute).
    loadRoles();
    loadUsers();

    // Dynamically trigger only the APIs strictly necessary for the active page module
    switch (activeTab) {
      case 'dashboard':
        // The dashboard now purely relies on its own /admin/dashboard API endpoint
        break;
      case 'products':
        // Products page handles its own live API fetching (products, categories, subcategories, brands)
        break;
      case 'categories':
        loadCategories();
        break;
      case 'brands':
        // Brands page handles its own live API fetching
        break;
      case 'inventory':
        loadProducts();
        loadAuditLogs();
        break;
      case 'orders':
        loadOrders();
        loadAuditLogs();
        break;
      case 'customers':
      case 'notifications':
        loadCustomers();
        loadAuditLogs();
        break;
      case 'coupons':
      case 'offers':
        loadCoupons();
        loadCategories();
        loadBrands();
        loadAuditLogs();
        break;
      case 'delivery':
        loadOrders();
        break;
      case 'cms':
      case 'home-config':
        loadCmsData();
        loadProducts();
        loadCategories();
        loadBrands();
        loadRecipes();
        loadAuditLogs();
        break;
      case 'blogs':
        loadBlogs();
        loadAuditLogs();
        break;
      case 'recipes':
        loadRecipes();
        loadProducts();
        loadAuditLogs();
        break;
      case 'reports':
      case 'settings':
        loadOrders();
        loadProducts();
        loadCustomers();
        loadCategories();
        loadBrands();
        loadAuditLogs();
        break;
      case 'user_management':
      case 'users':
        loadAuditLogs();
        break;
      case 'security':
        loadAuditLogs();
        break;
      default:
        break;
    }
  }, [activeTab, user]);

  // Centralized Route-Based Document Title Updater
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
      document.title = 'Dashboard | Admin Panel';
      return;
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment === 'login') {
      document.title = "Login | Grandma's Basket";
      return;
    }
    if (lastSegment === 'dashboard') {
      document.title = "Dashboard | Grandma's Basket";
      return;
    }
    if (lastSegment === '404') {
      document.title = "Page Not Found | Grandma's Basket";
      return;
    }

    // Format page name: replace dashes/underscores with space and capitalize each word
    const pageName = lastSegment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    document.title = pageName ? `${pageName} | Grandma's Basket` : "Grandma's Basket";
  }, [location.pathname]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K triggers command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Session timer ticker
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setSessionTimeoutTime((prev) => {
        if (prev <= 1) {
          clearAuthData();
          setUser(null);
          addToast('Your session has timed out due to inactivity', 'warning');
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Quick actions click inside command palette or widgets
  const executeQuickAction = (actionKey) => {
    if (actionKey === 'add-product') {
      navigate('/products');
      setProductsDrawerOpen(true);
    } else if (actionKey === 'create-coupon') {
      navigate('/coupons');
    } else if (actionKey === 'whatsapp-campaign') {
      navigate('/whatsapp');
    } else if (actionKey === 'export-sales') {
      addToast('Triggering sales CSV export...', 'info');
      // Run mock CSV download
      const csvContent = "data:text/csv;charset=utf-8,Order ID,Date,Customer,Total\n"
        + orders.map(o => `#${o.id},${o.date},${o.customerName},${o.total}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "quick_sales_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Sidebar Menu list
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Layout },
    { key: 'categories', label: 'Categories', icon: Folder },
    { key: 'brands', label: 'Brands', icon: Award },
    { key: 'products', label: 'Products', icon: ShoppingBag },
    { key: 'inventory', label: 'Inventory', icon: Package, badge: products.filter(p => p.stock <= p.minStock).length },
    { key: 'orders', label: 'Orders Queue', icon: FileText, badge: orders.filter(o => o.deliveryStatus === 'New Order').length },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'enquiries', label: 'Enquiries', icon: HelpCircle },
    { key: 'coupons', label: 'Coupons', icon: Ticket },
    { key: 'offers', label: 'Offers & Deals', icon: Sparkles },
    { key: 'notifications', label: 'Push Notifications', icon: Bell },
    { key: 'delivery', label: 'Delivery Dispatch', icon: Truck },
    { key: 'home-config', label: 'Home CMS', icon: SettingsIcon },
    { key: 'banners', label: 'Page Banners', icon: Sparkles },
    { key: 'blogs', label: 'Blog Posts', icon: PenTool },
    { key: 'recipes', label: 'Recipes Editor', icon: ChefHat },
    { key: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'payments', label: 'Payments Hub', icon: CreditCard },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
    { key: 'user_management', label: 'User Matrix', icon: UserCheck },
    { key: 'security', label: 'Security Logs', icon: ShieldCheck }
  ];

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <React.Suspense fallback={<LoadingFallback />}>
              <div className={theme === 'dark' ? 'dark' : ''}>
                <Login
                  users={users}
                  onLoginSuccess={(userData) => {
                    setUser(userData);
                    setSessionTimeoutTime(3600); // Reset timer to 1 hour
                    addToast(`Successfully authenticated as ${userData.name}`, 'success');
                  }}
                />
                <ToastContainer toasts={toasts} onCloseToast={removeToast} />
              </div>
            </React.Suspense>
          )
        }
      />

      {/* Main Layout containing Header, Sidebar & Outlet */}
      <Route
        path="/"
        element={
          user ? (
            <AppLayout
              user={user}
              setUser={setUser}
              theme={theme}
              setTheme={setTheme}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              commandPaletteOpen={commandPaletteOpen}
              setCommandPaletteOpen={setCommandPaletteOpen}
              toasts={toasts}
              removeToast={removeToast}
              sessionTimeoutTime={sessionTimeoutTime}
              sidebarItems={sidebarItems}
              activeTab={activeTab}
              rolePermissions={rolePermissions}
              executeQuickAction={executeQuickAction}
              navigate={navigate}
              showQuickMenu={showQuickMenu}
              setShowQuickMenu={setShowQuickMenu}
              showNotificationPanel={showNotificationPanel}
              setShowNotificationPanel={setShowNotificationPanel}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Redirect / to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Protected Module Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute moduleKey="dashboard" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Dashboard
                  products={products}
                  orders={orders}
                  customers={customers}
                  auditLogs={auditLogs}
                  onNavigate={(tab) => navigate(`/${tab}`)}
                  onQuickAction={executeQuickAction}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute moduleKey="products" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Products
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  brands={brands}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  addToast={addToast}
                  externalOpenDrawer={productsDrawerOpen}
                  setExternalOpenDrawer={setProductsDrawerOpen}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoute moduleKey="categories" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Categories
                  categories={categories}
                  setCategories={setCategories}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="brands"
          element={
            <ProtectedRoute moduleKey="brands" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Brands
                  brands={brands}
                  setBrands={setBrands}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute moduleKey="inventory" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Inventory
                  products={products}
                  setProducts={setProducts}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  addToast={addToast}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute moduleKey="orders" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Orders
                  orders={orders}
                  setOrders={setOrders}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  addToast={addToast}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={
            <ProtectedRoute moduleKey="customers" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Customers
                  customers={customers}
                  setCustomers={setCustomers}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="enquiries"
          element={
            <ProtectedRoute moduleKey="customers" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Enquiries addToast={addToast} />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="coupons"
          element={
            <ProtectedRoute moduleKey="coupons" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Coupons
                  coupons={coupons}
                  setCoupons={setCoupons}
                  categories={categories}
                  brands={brands}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="offers"
          element={
            <ProtectedRoute moduleKey="coupons" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Offers addToast={addToast} products={products} />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute moduleKey="customers" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Notifications customers={customers} addToast={addToast} />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="delivery"
          element={
            <ProtectedRoute moduleKey="delivery" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Delivery
                  drivers={drivers}
                  setDrivers={setDrivers}
                  orders={orders}
                  setOrders={setOrders}
                  addToast={addToast}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="cms"
          element={
            <ProtectedRoute moduleKey="cms" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <CMS
                  cmsData={cmsData}
                  setCmsData={setCmsData}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="home-config"
          element={
            <ProtectedRoute moduleKey="cms" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <HomeConfiguration
                  products={products}
                  categories={categories}
                  brands={brands}
                  recipes={recipes}
                  cmsData={cmsData}
                  setCmsData={setCmsData}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="blogs"
          element={
            <ProtectedRoute moduleKey="blogs" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Blogs
                  blogs={blogs}
                  setBlogs={setBlogs}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="recipes"
          element={
            <ProtectedRoute moduleKey="recipes" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Recipes
                  recipes={recipes}
                  setRecipes={setRecipes}
                  products={products}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="testimonials"
          element={
            <ProtectedRoute moduleKey="cms" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Testimonials addToast={addToast} />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="whatsapp"
          element={
            <ProtectedRoute moduleKey="whatsapp" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <WhatsApp
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute moduleKey="reports" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Reports
                  orders={orders}
                  products={products}
                  customers={customers}
                  addToast={addToast}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute moduleKey="reports" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Payments addToast={addToast} />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute moduleKey="settings" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Settings
                  products={products}
                  categories={categories}
                  brands={brands}
                  orders={orders}
                  customers={customers}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="user_management"
          element={
            <ProtectedRoute moduleKey="user_management" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <UserManagement
                  users={users}
                  setUsers={setUsers}
                  rolePermissions={rolePermissions}
                  setRolePermissions={setRolePermissions}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute moduleKey="user_management" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <UserManagement
                  users={users}
                  setUsers={setUsers}
                  rolePermissions={rolePermissions}
                  setRolePermissions={setRolePermissions}
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="security"
          element={
            <ProtectedRoute moduleKey="security" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Security
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  addToast={addToast}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="activity-log" element={<Navigate to="/security" replace />} />

        {/* Dynamic Placeholder Routes requested by user */}
        <Route path="reviews" element={<PlaceholderPage name="Reviews Control Panel" />} />
        <Route
          path="banners"
          element={
            <ProtectedRoute moduleKey="banners" user={user} rolePermissions={rolePermissions} navigate={navigate}>
              <React.Suspense fallback={<LoadingFallback />}>
                <Banners
                  addToast={addToast}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<PlaceholderPage name="User Profile Settings" />} />
        <Route path="notifications" element={<PlaceholderPage name="System Notifications Configuration" />} />
        <Route path="analytics" element={<PlaceholderPage name="Advanced Marketing Analytics" />} />
        <Route path="support" element={<PlaceholderPage name="Customer Support Desk" />} />
        <Route path="invoices" element={<PlaceholderPage name="Billing & Invoices Management" />} />
        <Route path="payments" element={<PlaceholderPage name="Payment Gateways Integration" />} />
        <Route path="roles" element={<PlaceholderPage name="Roles Manager" />} />
        <Route path="permissions" element={<PlaceholderPage name="Permissions Matrix" />} />
        <Route path="media-library" element={<PlaceholderPage name="Media Storage & Library" />} />
        <Route path="seo" element={<PlaceholderPage name="SEO & Meta Tag Configurations" />} />
        <Route path="system" element={<PlaceholderPage name="System Diagnostics & Settings" />} />

        {/* Visual 404 Fallback Route inside Layout */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};

export const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
