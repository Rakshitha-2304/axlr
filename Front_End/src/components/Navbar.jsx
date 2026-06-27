import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getNotifications, markNotificationsAsRead } from '../services/notification.service';
import { 
  Bell, 
  LogOut, 
  User, 
  Car, 
  Calendar, 
  Shield, 
  Layers, 
  CreditCard,
  Menu,
  X,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

const Navbar = () => {
  const { authState, customerProfile, logout, isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && authState.userId) {
      try {
        await markNotificationsAsRead(authState.userId);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      } catch (e) {
        console.warn('Failed to mark notifications as read', e);
      }
    }
  };

  const unreadCount = notifications.filter(n => !(n.isRead || n.read)).length;

  // Fetch notifications for CUSTOMER role
  useEffect(() => {
    if (isAuthenticated() && authState.role === 'CUSTOMER' && authState.userId) {
      const fetchNotifs = async () => {
        try {
          const data = await getNotifications(authState.userId);
          setNotifications(data || []);
        } catch (e) {
          console.warn('Failed to load notifications', e);
        }
      };

      fetchNotifs();
      // Poll notifications every 10 seconds for real-time vibe
      const interval = setInterval(fetchNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [authState.role, authState.userId, isAuthenticated]);

  // Click outside notification panel closes it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated()) return null;

  const isActive = (path) => location.pathname === path;

  // Render navigation links based on user roles
  const renderLinks = () => {
    const baseLinkStyle = "nav-link flex-row gap-sm";
    
    if (authState.role === 'CUSTOMER') {
      return (
        <>
          <Link 
            to="/dashboard" 
            className={`${baseLinkStyle} ${isActive('/dashboard') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Layers size={18} /> Dashboard
          </Link>
          <Link 
            to="/profile" 
            className={`${baseLinkStyle} ${isActive('/profile') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Car size={18} /> Profile & Vehicles
          </Link>
          <Link 
            to="/book-appointment" 
            className={`${baseLinkStyle} ${isActive('/book-appointment') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calendar size={18} /> Book Service
          </Link>
        </>
      );
    }

    if (authState.role === 'ADMIN') {
      return (
        <>
          <Link 
            to="/dashboard" 
            className={`${baseLinkStyle} ${isActive('/dashboard') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Layers size={18} /> Dashboard
          </Link>
          <Link 
            to="/admin/packages" 
            className={`${baseLinkStyle} ${isActive('/admin/packages') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Shield size={18} /> Manage Packages
          </Link>
          <Link 
            to="/staff/appointments" 
            className={`${baseLinkStyle} ${isActive('/staff/appointments') ? 'active-nav' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calendar size={18} /> Status Control
          </Link>
        </>
      );
    }

    // Mechanics & Service Advisors
    return (
      <>
        <Link 
          to="/dashboard" 
          className={`${baseLinkStyle} ${isActive('/dashboard') ? 'active-nav' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Layers size={18} /> Dashboard
        </Link>
        <Link 
          to="/staff/appointments" 
          className={`${baseLinkStyle} ${isActive('/staff/appointments') ? 'active-nav' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Calendar size={18} /> Service Jobs
        </Link>
      </>
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'var(--danger)';
      case 'MECHANIC': return 'var(--primary)';
      case 'SERVICE_ADVISOR': return 'var(--secondary)';
      default: return 'var(--success)';
    }
  };

  const getNotificationIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('pay') || msg.includes('invoice') || msg.includes('billing') || msg.includes('paid')) {
      return <CreditCard size={15} color="var(--secondary)" />;
    }
    if (msg.includes('appointment') || msg.includes('book') || msg.includes('schedule')) {
      return <Calendar size={15} color="var(--primary)" />;
    }
    if (msg.includes('assign') || msg.includes('mechanic') || msg.includes('staff')) {
      return <User size={15} color="var(--warning)" />;
    }
    if (msg.includes('complete') || msg.includes('finish') || msg.includes('success')) {
      return <CheckCircle size={15} color="var(--success)" />;
    }
    if (msg.includes('cancel') || msg.includes('reject') || msg.includes('fail')) {
      return <AlertCircle size={15} color="var(--danger)" />;
    }
    return <Info size={15} color="var(--text-muted)" />;
  };

  const formatNotificationMessage = (message) => {
    if (!message) return '';
    let cleanMsg = message;
    
    // Check for ISO datetime strings and format them to a beautiful reader-friendly form
    const isoDateTimeRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/;
    const match = cleanMsg.match(isoDateTimeRegex);
    if (match) {
      try {
        const dateVal = new Date(match[0]);
        const formattedDate = dateVal.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + dateVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        cleanMsg = cleanMsg.replace(isoDateTimeRegex, formattedDate);
      } catch (e) {
        // fallback
      }
    }
    
    // Clean up raw identifiers to look professional
    cleanMsg = cleanMsg.replace(/\bcustomer\s+\d+/i, 'your account');
    cleanMsg = cleanMsg.replace(/\bvehicle\s+\d+/i, 'your vehicle');
    cleanMsg = cleanMsg.replace(/\bappointment\s+\d+/i, 'your appointment');
    
    return cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
  };

  return (
    <nav className="glass-nav">
      <div className="nav-container">
        {/* Branding */}
        <Link to="/dashboard" className="nav-logo">
          <Car className="logo-icon" />
          <span>VSM <span className="logo-accent">AutoCare</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          {renderLinks()}
        </div>

        {/* User Actions */}
        <div className="nav-actions">
          {/* Notifications */}
          {authState.role === 'CUSTOMER' && (
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                className="notif-btn" 
                onClick={handleToggleNotifications}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-badge animate-glow">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notif-dropdown glass-panel">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="badge badge-assigned">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="notif-body">
                    {notifications.length === 0 ? (
                      <p className="no-notifs">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`notif-item ${!(n.isRead || n.read) ? 'notif-unread' : ''}`}>
                          <div className="notif-icon-container">
                            {getNotificationIcon(n.message)}
                          </div>
                          <div className="notif-content-flow">
                            <p className="notif-msg">{formatNotificationMessage(n.message)}</p>
                            <span className="notif-time">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Role Info & Logout */}
          <div className="user-profile flex-row gap-sm">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-details-desktop">
              <span className="username">{customerProfile?.fullName || authState.username}</span>
              <span className="role-label" style={{ color: getRoleColor(authState.role) }}>
                {authState.role}
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel animate-slide-up">
          <div className="mobile-links">
            {renderLinks()}
          </div>
        </div>
      )}

      {/* Embedded CSS specific to Navigation details for styling integration */}
      <style>{`
        .glass-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(22, 28, 45, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--glass-border);
          height: 70px;
          display: flex;
          align-items: center;
        }
        .nav-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          text-decoration: none;
        }
        .logo-icon {
          color: var(--primary);
        }
        .logo-accent {
          color: var(--secondary);
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-link {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-accent);
        }
        .active-nav {
          color: var(--primary);
          background: var(--primary-glow);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .notif-wrapper {
          position: relative;
        }
        .notif-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        .notif-btn:hover {
          color: var(--text-primary);
          background: var(--bg-accent);
        }
        .notif-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--danger);
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          padding: 1px 5px;
          border-radius: 9999px;
          border: 1.5px solid rgba(22, 28, 45, 0.75);
        }
        .notif-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.75rem;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 100;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-lg);
          border-radius: var(--radius-md);
          padding: 1rem;
          animation: slideUp 0.15s ease;
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 0.75rem;
        }
        .notif-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          transition: background-color 0.2s ease;
        }
        .notif-item:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.3);
          flex-shrink: 0;
          border: 1px solid var(--glass-border);
        }
        .notif-content-flow {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex-grow: 1;
        }
        .notif-msg {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }
        .notif-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }
        .no-notifs {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 1.5rem 0;
        }
        .user-profile {
          padding-left: 1rem;
          border-left: 1px solid var(--glass-border);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-glow);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--glass-border);
        }
        .user-details-desktop {
          display: flex;
          flex-direction: column;
        }
        .username {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .role-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          color: var(--danger);
          background: var(--danger-glow);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }
        .mobile-drawer {
          position: absolute;
          top: 70px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          z-index: 40;
        }
        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .notif-unread {
          background-color: rgba(6, 182, 212, 0.04) !important;
          border-left: 3px solid var(--secondary);
        }

        @media (max-width: 768px) {
          .nav-links, .user-details-desktop {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
