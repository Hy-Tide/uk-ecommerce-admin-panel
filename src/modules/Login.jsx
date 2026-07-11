import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { INITIAL_USERS } from '../data/seedData';

export const Login = ({ onLoginSuccess, users = INITIAL_USERS }) => {
  const [email, setEmail] = useState('david.admin@freshcart.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (!matchedUser) {
      setEmailError('Email address not registered in the system.');
      return;
    }

    if (matchedUser.status === 'Inactive') {
      setEmailError('This account is currently inactive. Contact your administrator.');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Simulate validation and trigger login success
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        avatar: matchedUser.avatar
      });
    }, 800);
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
          {/* Brand Logo Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minHeight: '144px', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {matchedUser && matchedUser.status === 'Active' ? (
                <motion.img
                  key="avatar"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  src={matchedUser.avatar}
                  alt={matchedUser.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary)',
                    objectFit: 'cover',
                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
                    marginBottom: '8px'
                  }}
                />
              ) : (
                <motion.div
                  key="logo"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    marginBottom: '8px'
                  }}
                >
                  FC
                </motion.div>
              )}
            </AnimatePresence>
            <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.03em', margin: 0 }}>
              {matchedUser && matchedUser.status === 'Active' ? `Hello, ${matchedUser.name.split(' ')[0]}!` : 'Welcome back'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              {matchedUser && matchedUser.status === 'Active' 
                ? 'Enter your password to access the panel.' 
                : 'Enter your credentials to access the FreshCart Admin Panel.'}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="name@freshcart.com"
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

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Demo Accounts (Password: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>password123</span>)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
              <div>david.admin@freshcart.com</div>
              <div>melissa.mgr@freshcart.com</div>
              <div>sam.care@freshcart.com</div>
            </div>
          </div>
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

