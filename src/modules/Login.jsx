import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { postData, showSnackbar, saveAuthData } from '../services/api';
import { INITIAL_USERS } from '../data/seedData';

export const Login = ({ onLoginSuccess, users = INITIAL_USERS }) => {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: cleanEmail,
        password
      };
      
      const response = await postData('admin/auth/login', payload);

      if (response.success || response.statusCode === 200) {
        const apiUser = response?.data?.user || {};
        const tokens = response?.data?.tokens || {};
        const token = tokens.accessToken || response?.data?.token;
        const refreshToken = tokens.refreshToken || response?.data?.refreshToken;

        if (token) {
          sessionStorage.setItem('sessionToken', token);
          sessionStorage.setItem('admin_access_token', token);
        }
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
          sessionStorage.setItem('admin_refresh_token', refreshToken);
        }

        const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());

        const userPayload = {
          id: apiUser.id || matchedUser?.id || 'admin-id',
          name: apiUser.name || matchedUser?.name || 'Admin',
          email: apiUser.email || cleanEmail,
          role: matchedUser?.role || 'Super Admin',
          avatar: matchedUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          tokens: { accessToken: token, refreshToken }
        };

        saveAuthData(userPayload, userPayload.tokens, rememberMe);
        showSnackbar('Login successful!', 'success');
        setLoading(false);
        onLoginSuccess(userPayload);
      } else {
        const errMsg = response?.error || response?.message || 'Login failed';
        setPasswordError(errMsg);
        showSnackbar(errMsg, 'error');
        setLoading(false);
      }
    } catch (err) {
      const errMsg = err.message || 'Error during login';
      setPasswordError(errMsg);
      showSnackbar(errMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden'
      }}
    >
      {/* Animated Gradient Background and Grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.1,
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, var(--text-secondary) 1px, transparent 1px), linear-gradient(to bottom, var(--text-secondary) 1px, transparent 1px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          opacity: 0.15,
          zIndex: 1,
          filter: 'blur(40px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          bottom: '-20%',
          right: '-10%',
          opacity: 0.1,
          zIndex: 1,
          filter: 'blur(50px)'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', padding: '16px' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Company Logo — centered */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Logo mark */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(5,150,105,0.35)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', fontFamily: 'var(--font-sans)' }}>FC</span>
            </div>
            {/* Brand name */}
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.04em', margin: 0, color: 'var(--text-primary)' }}>
                UK E-commerce
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '500' }}>
                Admin Panel — Sign in to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="name@ukecommerce.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={emailError}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                error={passwordError}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '36px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                Remember my device
              </label>
              <a href="#forgot" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="premium-btn" style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              Sign In <ArrowRight size={16} className="btn-arrow-icon" />
            </Button>
          </form>

        </motion.div>
      </div>

      <style>{`
        .premium-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: var(--radius-md) !important;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4) !important;
          font-weight: 600 !important;
          letter-spacing: -0.010em !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative;
          overflow: hidden;
        }
        .premium-btn:hover {
          background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #0f766e 100%) !important;
          box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.6) !important;
          transform: translateY(-1px) !important;
        }
        .premium-btn:active {
          transform: translateY(1px) !important;
        }

        .btn-arrow-icon {
          transition: transform 0.2s ease !important;
        }
        .premium-btn:hover .btn-arrow-icon {
          transform: translateX(4px) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;

