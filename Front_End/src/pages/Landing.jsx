import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, ShieldCheck, Calendar, CreditCard, ChevronRight } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, authState } = useContext(AuthContext);

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="brand flex-row gap-xs">
            <Car className="brand-icon" />
            <span className="brand-name">VSM AutoCare</span>
          </div>
          <div className="nav-actions">
            {isAuthenticated() ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="flex-row gap-sm">
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container text-center">
          <h1 className="hero-title">Simple Vehicle Service Management</h1>
          <p className="hero-subtitle">
            Schedule appointments, track service details, process secure payments, and manage your garage in one unified system.
          </p>
          <div className="hero-buttons mt-md">
            {isAuthenticated() ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Control Panel
              </Link>
            ) : (
              <div className="flex-row justify-center gap-md">
                <Link to="/login" className="btn btn-primary btn-lg">Get Started</Link>
                <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features container">
        <h2 className="text-center section-title">Platform Features</h2>
        <div className="grid-cols-3 mt-lg">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Calendar size={24} />
            </div>
            <h3>Easy Booking</h3>
            <p>Select your vehicle, choose a service package, select a preferred mechanic, and pick a time slot.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CreditCard size={24} />
            </div>
            <h3>Secure Payments</h3>
            <p>Review detailed invoices and complete payments using our secure billing gateways with printed receipts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3>Progress Tracking</h3>
            <ul className="role-list">
              <li><strong>Real-Time Alerts</strong>: Receive instant notifications when your job status changes.</li>
              <li><strong>Service History</strong>: Keep a complete, persistent log of all vehicle repairs.</li>
              <li><strong>Mechanic Allocation</strong>: View details of the expert technician assigned to your vehicle.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="landing-footer text-center">
        <div className="container">
          <p>&copy; 2026 VSM AutoCare. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-main);
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%);
          background-attachment: fixed;
          color: var(--text-primary);
        }
        .landing-nav {
          background: rgba(22, 28, 45, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1.25rem 0;
        }
        .landing-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-icon {
          color: var(--secondary);
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
        }
        .brand-name {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .hero {
          position: relative;
          padding: 7rem 1.5rem;
          background: radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
          border-bottom: 1px solid var(--glass-border);
        }
        .hero-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto 2rem auto;
          line-height: 1.6;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 4rem;
          margin-bottom: 3rem;
          text-align: center;
          position: relative;
        }
        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: var(--secondary);
          border-radius: 99px;
        }
        .feature-card {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 2.5rem 2rem;
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      border-color 0.3s ease;
          box-shadow: var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: var(--shadow-lg), 0 0 20px rgba(99, 102, 241, 0.15);
        }
        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--primary-glow);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
        }
        .feature-card h3 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        .feature-card p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .role-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0 0 0;
          text-align: left;
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .role-list li {
          position: relative;
          padding-left: 1.5rem;
        }
        .role-list li::before {
          content: "✓";
          color: var(--secondary);
          font-weight: bold;
          position: absolute;
          left: 0.25rem;
        }
        .landing-footer {
          margin-top: auto;
          background-color: rgba(11, 15, 25, 0.8);
          border-top: 1px solid var(--glass-border);
          padding: 2rem 0;
          color: var(--text-muted);
          font-size: 0.9rem;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .landing-footer p {
          margin: 0;
          text-align: center;
          width: 100%;
        }
        .btn {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary {
          background-color: var(--primary);
          background-image: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: var(--text-primary) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          background-image: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }
        .btn-secondary {
          background-color: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-secondary) !important;
        }
        .btn-secondary:hover {
          background-color: var(--bg-accent);
          color: var(--text-primary) !important;
          border-color: var(--text-secondary);
        }
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }
        .btn-lg {
          padding: 0.875rem 1.75rem;
          font-size: 1.05rem;
        }
        @media (max-width: 768px) {
          .hero {
            padding: 5rem 1rem;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
