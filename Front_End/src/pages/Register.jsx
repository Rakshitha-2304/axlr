import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth.service';
import { UserPlus, Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(username, password, email, role);
      if (role === 'MECHANIC' || role === 'SERVICE_ADVISOR') {
        setSuccess('Registration submitted successfully! Your account is pending administrator approval.');
        setTimeout(() => {
          navigate('/login');
        }, 4000);
      } else {
        setSuccess('User registered successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data || 
        'Registration failed. Username or email might be taken.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex-row justify-center align-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <div className="auth-icon-wrapper animate-glow">
            <UserPlus size={28} />
          </div>
          <h2>Create Account</h2>
          <p>Register a new system user profile</p>
        </div>

        {error && (
          <div className="error-alert flex-row gap-sm animate-slide-up">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-alert flex-row gap-sm animate-slide-up">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="register-username"
              type="text"
              className="glass-input"
              placeholder="Pick a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="glass-input"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="glass-input password-field"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              id="register-role"
              className="glass-input glass-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading || success}
              required
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="MECHANIC">MECHANIC</option>
              <option value="SERVICE_ADVISOR">SERVICE_ADVISOR</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-md" disabled={loading || success}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer text-center">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
          border-radius: var(--radius-lg);
        }
        .auth-header {
          margin-bottom: 2rem;
        }
        .auth-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary-glow);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .auth-form {
          margin-bottom: 1.5rem;
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          width: 100%;
        }
        .password-field {
          width: 100%;
          padding-right: 2.75rem;
        }
        .password-toggle-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        .password-toggle-btn:hover {
          color: var(--text-primary);
        }
        .error-alert {
          background: var(--danger-glow);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
        }
        .success-alert {
          background: var(--success-glow);
          color: var(--success);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(16, 185, 129, 0.2);
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
        }
        .auth-footer {
          margin-top: 1.5rem;
          font-size: 0.9rem;
        }
        .w-full {
          width: 100%;
        }
        .mt-md {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Register;
