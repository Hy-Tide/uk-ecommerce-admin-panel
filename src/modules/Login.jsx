import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Leaf, Flame, Wheat, Utensils, Sparkles, Package, Heart } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { postData, showSnackbar, saveAuthData } from '../services/api';
export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      const isSuccess = response?.success === true ||
        response?.statusCode === 200 ||
        response?.status === 200 ||
        Boolean(response?.data?.user) ||
        Boolean(response?.data?.tokens);


      if (isSuccess) {
        const apiUser = response?.data?.user || response?.user || {};
        const tokens = response?.data?.tokens || response?.tokens || {};
        const token = tokens.accessToken || response?.data?.token || response?.token || response?.accessToken || '';
        const refreshToken = tokens.refreshToken || response?.data?.refreshToken || response?.refreshToken || '';

        if (token) {
          sessionStorage.setItem('sessionToken', token);
          sessionStorage.setItem('admin_access_token', token);
        }
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
          sessionStorage.setItem('admin_refresh_token', refreshToken);
        }

        const userPayload = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email || cleanEmail,
          role_id: apiUser.role_id,
          avatar: apiUser.avatar,
          tokens: { accessToken: token, refreshToken }
        };

        saveAuthData(userPayload, userPayload.tokens, false);
        showSnackbar('Login successful!', 'success');
        setLoading(false);
        onLoginSuccess(userPayload);
      } else {
        const isNetworkError = response?.error?.toLowerCase().includes('fetch') ||
          response?.error?.toLowerCase().includes('network') ||
          !response;

        if (isNetworkError) {
          showSnackbar('Backend offline - Cannot authenticate', 'error');
          setLoading(false);
          return;
        }

        const errMsg = response?.error || response?.message || 'Login failed. Please check your credentials.';
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

  const spiceIcons = [
    { Icon: Leaf, top: '10%', left: '8%', size: 46, duration: '9s', delay: '0s' },
    { Icon: Flame, top: '18%', right: '12%', size: 40, duration: '11s', delay: '1s' },
    { Icon: Wheat, bottom: '15%', left: '12%', size: 52, duration: '10s', delay: '2s' },
    { Icon: Utensils, bottom: '22%', right: '10%', size: 44, duration: '12s', delay: '0.5s' },
    { Icon: Sparkles, top: '45%', left: '6%', size: 38, duration: '8s', delay: '3s' },
    { Icon: Package, top: '52%', right: '7%', size: 42, duration: '13s', delay: '1.5s' },
    { Icon: Leaf, bottom: '12%', right: '30%', size: 36, duration: '8.5s', delay: '2.5s' },
    { Icon: Wheat, top: '12%', left: '45%', size: 40, duration: '10.5s', delay: '0.8s' }
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#0f172a',
        overflow: 'hidden'
      }}
    >
      {/* Rich Spices & Herbs Background Image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1920')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }}
      />

      {/* Floating Low-Opacity Spices Icons */}
      {spiceIcons.map((item, idx) => (
        <div
          key={idx}
          className="floating-spice-icon"
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            color: '#10b981',
            opacity: 0.18,
            zIndex: 1,
            pointerEvents: 'none',
            animationDuration: item.duration,
            animationDelay: item.delay,
            filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
          }}
        >
          <item.Icon size={item.size} />
        </div>
      ))}

      {/* Glowing Ambient Orbs */}
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
          className="login-glass-card"
          style={{
            borderRadius: '24px',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Company Logo — centered */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Logo mark */}
            <img
              src="/logo.png"
              alt="Grandma's Basket Logo"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                borderRadius: '16px',
                backgroundColor: '#fff',
                padding: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color, #e2e8f0)',
                flexShrink: 0
              }}
            />
            {/* Brand name */}
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.04em', margin: 0, color: '#ffffff' }}>
                Grandma's Basket
              </h1>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0', fontWeight: '600' }}>
                Admin Operations Portal — Sign in to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="name@demo.com"
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
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '13px' }}>
              <a href="#forgot" style={{ color: '#34d399', textDecoration: 'none', fontWeight: '600' }}>
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
        .login-glass-card {
          background: rgba(15, 23, 42, 0.45) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 16px 36px rgba(16, 185, 129, 0.1) !important;
        }

        .login-glass-card label {
          color: #e2e8f0 !important;
          font-weight: 600 !important;
        }

        .login-glass-card input[type="email"],
        .login-glass-card input[type="password"],
        .login-glass-card input[type="text"] {
          background-color: rgba(255, 255, 255, 0.06) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          font-weight: 500 !important;
        }

        .login-glass-card input[type="email"]:focus,
        .login-glass-card input[type="password"]:focus,
        .login-glass-card input[type="text"]:focus {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: #10b981 !important;
          outline: none;
        }

        .login-glass-card input::placeholder {
          color: #94a3b8 !important;
        }

        @keyframes floatSpice {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(6deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-spice-icon {
          animation: floatSpice linear infinite;
        }

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

