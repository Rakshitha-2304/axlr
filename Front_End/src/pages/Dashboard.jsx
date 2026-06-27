import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCustomerVehicles } from '../services/vehicle.service';
import { getCustomerAppointments, getAllAppointments, getPackages } from '../services/appointment.service';
import { getCustomerPayments, getAllPayments } from '../services/payment.service';
import { 
  Car, 
  Calendar, 
  Clock, 
  CreditCard, 
  Bell, 
  User, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  FolderSync,
  CheckCircle,
  FileCheck,
  Shield,
  X
} from 'lucide-react';
import { getAllUsers, getPendingUsers, approveUser, rejectUser } from '../services/auth.service';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { authState, customerProfile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Track paid appointments in local storage to keep state persistent
  const [paidAppointments, setPaidAppointments] = useState([]);

  useEffect(() => {
    // Load paid state
    const savedPaid = localStorage.getItem('paid_appointment_ids');
    if (savedPaid) {
      setPaidAppointments(JSON.parse(savedPaid));
    }
  }, []);

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => String(p.id) === String(packageId));
    return pkg ? pkg.name : `Service Package #${packageId}`;
  };

  const getPackagePrice = (packageId) => {
    const pkg = packages.find(p => String(p.id) === String(packageId));
    return pkg ? pkg.price : 99.99;
  };

  const getMechanicName = (mechanicId) => {
    const user = users.find(u => Number(u.id) === Number(mechanicId));
    return user ? user.username : `Mechanic #${mechanicId}`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const packageList = await getPackages();
        setPackages(packageList || []);
      } catch (err) {
        console.warn('Failed to load packages', err);
      }

      try {
        const userList = await getAllUsers();
        setUsers(userList || []);
      } catch (err) {
        console.warn('Failed to load users list', err);
        setUsers([]);
      }

      if (authState.role === 'ADMIN') {
        try {
          const pending = await getPendingUsers();
          setPendingUsers(pending || []);
        } catch (err) {
          console.warn('Failed to load pending users', err);
        }
      }

      try {
        if (authState.role === 'CUSTOMER') {
          if (customerProfile?.id && authState?.userId) {
            const [vehiclesData, appointmentsData, paymentsData] = await Promise.all([
              getCustomerVehicles(authState.userId),
              getCustomerAppointments(authState.userId),
              getCustomerPayments(authState.userId).catch(() => [])
            ]);
            setVehicles(vehiclesData || []);
            setAppointments(appointmentsData || []);
            
            const paidIds = (paymentsData || [])
              .filter(p => p.status === 'SUCCESSFUL')
              .map(p => Number(p.appointmentId));
            setPaidAppointments(paidIds);
          } else {
            setVehicles([]);
            setAppointments([]);
          }
        } else {
          // Admin/Staff loads all appointments
          const [allAppointments, paymentsData] = await Promise.all([
            getAllAppointments(),
            getAllPayments().catch(() => [])
          ]);
          if (authState.role === 'MECHANIC') {
            const filtered = (allAppointments || []).filter(a => Number(a.mechanicId) === Number(authState.userId));
            setAppointments(filtered);
          } else {
            setAppointments(allAppointments || []);
          }
          
          const paidIds = (paymentsData || [])
            .filter(p => p.status === 'SUCCESSFUL')
            .map(p => Number(p.appointmentId));
          setPaidAppointments(paidIds);
        }
      } catch (err) {
        console.warn('Dashboard loading warning', err);
        setError('Failed to retrieve system details. Downstream microservices may be starting up.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [authState.role, authState.userId, customerProfile]);

  const handleApprove = async (id) => {
    try {
      setError('');
      await approveUser(id);
      const pending = await getPendingUsers();
      setPendingUsers(pending || []);
      const userList = await getAllUsers();
      setUsers(userList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to verify user. Please try again.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this registration request? This will permanently delete the user account.')) {
      return;
    }
    try {
      setError('');
      await rejectUser(id);
      const pending = await getPendingUsers();
      setPendingUsers(pending || []);
      const userList = await getAllUsers();
      setUsers(userList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to decline registration request. Please try again.');
    }
  };

  const handlePayClick = (appt) => {
    const amt = getPackagePrice(appt.packageId);
    const pName = getPackageName(appt.packageId);
    navigate('/payment', { 
      state: { 
        appointmentId: appt.id, 
        amount: amt, 
        packageName: pName 
      } 
    });
  };

  // Helper status elements
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      case 'ASSIGNED':
        return <span className="badge badge-assigned">Assigned</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED':
        return <span className="badge badge-success">Completed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const isPaid = (appointmentId) => {
    // Also mark as paid if status is COMPLETED automatically for mock convenience
    const isSaved = paidAppointments.includes(Number(appointmentId));
    return isSaved;
  };

  // Staff Stats Aggregation
  const getStaffStats = () => {
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'PENDING').length,
      progress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
    };
    return stats;
  };

  const staffStats = getStaffStats();

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="container animate-fade-in">
        
        {/* Header Title */}
        <div className="dashboard-banner flex-between">
          <div>
            <h1>Control Panel</h1>
            <p>
              Signed in as <span className="username-accent">{authState.username}</span> ({authState.role})
            </p>
          </div>
          <div>
            {authState.role === 'CUSTOMER' && customerProfile && (
              <Link to="/book-appointment" className="btn btn-primary">
                <Calendar size={18} /> Book New Service
              </Link>
            )}
            {authState.role !== 'CUSTOMER' && (
              <Link to="/staff/appointments" className="btn btn-primary">
                <FolderSync size={18} /> Manage Tickets
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="error-alert flex-row gap-sm mt-md">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted mt-lg">Compiling panel metrics...</p>
        ) : authState.role === 'CUSTOMER' ? (
          /* ================= CUSTOMER VIEW ================= */
          <div className="customer-dashboard mt-lg">
            {!customerProfile ? (
              <div className="glass-panel text-center warning-setup-panel">
                <User size={48} className="warning-color" />
                <h3 className="mt-sm">Profile Configuration Required</h3>
                <p className="text-muted mt-xs">
                  To access scheduling, payments, and garages, you must first register your contact info.
                </p>
                <Link to="/profile" className="btn btn-primary mt-md">Set Up Profile</Link>
              </div>
            ) : (
              <div className="dashboard-layout-grid">
                
                {/* Left side: Appointments and Garage */}
                <div className="main-content-flow">
                  {/* Garage Overview */}
                  <div className="glass-panel garage-section mb-lg">
                    <div className="flex-between border-b pb-sm mb-sm">
                      <h3 className="flex-row gap-xs"><Car size={20} className="logo-icon" /> Garage</h3>
                      <Link to="/profile" className="btn btn-secondary btn-xs">Manage Garage</Link>
                    </div>
                    {vehicles.length === 0 ? (
                      <p className="text-muted text-sm">No vehicles registered. Visit your profile to add one.</p>
                    ) : (
                      <div className="garage-strip">
                        {vehicles.map((v) => (
                          <div key={v.id} className="garage-strip-item glass-card">
                            <span className="strip-plate">{v.licensePlate}</span>
                            <h5>{v.make} {v.model}</h5>
                            <p>{v.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Appointments Table */}
                  <div className="glass-panel">
                    <h3 className="border-b pb-sm mb-sm flex-row gap-xs">
                      <Calendar size={20} className="logo-accent" /> Booked Appointments
                    </h3>
                    
                    {appointments.length === 0 ? (
                      <div className="empty-appointments text-center py-lg">
                        <Calendar size={32} className="text-muted" />
                        <p className="text-muted mt-sm text-sm">No appointments scheduled.</p>
                        <Link to="/book-appointment" className="btn btn-secondary btn-xs mt-sm">
                          Book your first service
                        </Link>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Ref ID</th>
                              <th>Service Date</th>
                              <th>Package</th>
                              <th>Service Status</th>
                              <th>Payment Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map((a) => (
                              <tr key={a.id}>
                                <td>#{a.id}</td>
                                <td>
                                  {new Date(a.appointmentDate).toLocaleDateString()}{' '}
                                  {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td>{getPackageName(a.packageId)}</td>
                                <td>{getStatusBadge(a.status)}</td>
                                <td>
                                  {isPaid(a.id) || a.status === 'COMPLETED' ? (
                                    <span className="badge badge-success flex-row gap-xs w-fit">
                                      <CheckCircle size={12} /> Paid
                                    </span>
                                  ) : (
                                    <span className="badge badge-pending w-fit">Unpaid</span>
                                  )}
                                </td>
                                <td>
                                  {!isPaid(a.id) && a.status !== 'COMPLETED' ? (
                                    <button 
                                      className="btn btn-secondary btn-xs flex-row gap-xs"
                                      onClick={() => handlePayClick(a)}
                                    >
                                      <CreditCard size={12} /> Pay Now
                                    </button>
                                  ) : (
                                    <span className="text-muted text-xs">No Action Required</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Stats & Quick links */}
                <div className="sidebar-flow">
                  <div className="glass-panel info-summary-card mb-lg text-center">
                    <h3>Service Counter</h3>
                    <div className="stats-large mt-sm color-secondary">
                      {appointments.length}
                    </div>
                    <p className="text-xs text-muted mt-xs">Total registered service tickets</p>
                  </div>

                  <div className="glass-panel links-card">
                    <h4 className="border-b pb-sm mb-sm">Quick Navigation</h4>
                    <div className="vertical-links">
                      <Link to="/profile" className="glass-card link-item flex-row gap-sm">
                        <User size={16} /> Profile Details
                      </Link>
                      <Link to="/book-appointment" className="glass-card link-item flex-row gap-sm">
                        <Calendar size={16} /> Appointment Wizard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= STAFF VIEW (ADMIN/MECHANIC/ADVISOR) ================= */
          <div className="staff-dashboard mt-lg">
            {/* Operational Metrics Cards */}
            <div className="grid-cols-4 stat-panels mb-lg">
              <div className="glass-panel stat-card">
                <div className="flex-between">
                  <span className="stat-label">Total Jobs</span>
                  <TrendingUp size={20} className="logo-accent" />
                </div>
                <div className="stat-val">{staffStats.total}</div>
              </div>
              <div className="glass-panel stat-card">
                <div className="flex-between">
                  <span className="stat-label">Pending</span>
                  <Clock size={20} className="warning-color" />
                </div>
                <div className="stat-val">{staffStats.pending}</div>
              </div>
              <div className="glass-panel stat-card">
                <div className="flex-between">
                  <span className="stat-label">Active (In-Progress)</span>
                  <FolderSync size={20} className="logo-icon" />
                </div>
                <div className="stat-val">{staffStats.progress}</div>
              </div>
              <div className="glass-panel stat-card">
                <div className="flex-between">
                  <span className="stat-label">Completed</span>
                  <FileCheck size={20} className="success-color" />
                </div>
                <div className="stat-val">{staffStats.completed}</div>
              </div>
            </div>

            {/* Pending Staff Verification - ADMIN ONLY */}
            {authState.role === 'ADMIN' && (
              <div className="glass-panel mb-lg animate-fade-in">
                <h3 className="border-b pb-sm mb-sm flex-row gap-xs">
                  <Shield size={20} className="logo-accent" /> Pending Staff Verification
                </h3>
                {pendingUsers.length === 0 ? (
                  <p className="text-muted text-sm py-md text-center">No pending registrations require verification.</p>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email Address</th>
                          <th>Requested Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="font-semibold">{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className="badge badge-assigned">{u.role}</span>
                            </td>
                            <td>
                              <div className="flex-row gap-xs">
                                <button
                                  className="btn btn-primary btn-xs flex-row gap-xs"
                                  onClick={() => handleApprove(u.id)}
                                >
                                  <CheckCircle size={12} /> Verify
                                </button>
                                <button
                                  className="btn btn-secondary btn-xs flex-row gap-xs btn-danger-hover"
                                  onClick={() => handleReject(u.id)}
                                >
                                  <X size={12} /> Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Active Tickets List */}
            <div className="glass-panel">
              <div className="flex-between border-b pb-sm mb-sm">
                <h3 className="flex-row gap-xs"><Calendar size={20} className="logo-icon" /> Active Service Tickets</h3>
                <Link to="/staff/appointments" className="btn btn-secondary btn-xs">Open Status Manager</Link>
              </div>

              {appointments.length === 0 ? (
                <p className="text-center text-muted py-lg">No appointments are currently logged in the system database.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Client ID</th>
                        <th>Vehicle ID</th>
                        <th>Service Package</th>
                        <th>Job Date</th>
                        <th>Assigned Staff</th>
                        <th>Current Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td>#{a.id}</td>
                          <td>User #{a.customerId}</td>
                          <td>Vehicle #{a.vehicleId}</td>
                          <td>{getPackageName(a.packageId)}</td>
                          <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                          <td>{getMechanicName(a.mechanicId)}</td>
                          <td>{getStatusBadge(a.status)}</td>
                          <td>
                            {isPaid(a.id) || a.status === 'COMPLETED' ? (
                              <span className="badge badge-success flex-row gap-xs w-fit">
                                <CheckCircle size={12} /> Paid
                              </span>
                            ) : (
                              <span className="badge badge-pending w-fit">Unpaid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
        }
        .dashboard-banner {
          padding: 1rem 0;
        }
        .username-accent {
          color: var(--primary);
          font-weight: 600;
        }
        .dashboard-layout-grid {
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 992px) {
          .dashboard-layout-grid {
            grid-template-columns: 1fr;
          }
        }
        .main-content-flow {
          display: flex;
          flex-direction: column;
        }
        .sidebar-flow {
          display: flex;
          flex-direction: column;
        }
        .mb-lg { margin-bottom: 1.5rem; }
        .mt-lg { margin-top: 1.5rem; }
        .mt-md { margin-top: 1rem; }
        .mt-sm { margin-top: 0.75rem; }
        .mt-xs { margin-top: 0.25rem; }
        .py-lg { padding-top: 2rem; padding-bottom: 2rem; }
        .border-b { border-bottom: 1px solid var(--glass-border); }
        .pb-sm { padding-bottom: 0.5rem; }
        .mb-sm { margin-bottom: 0.5rem; }
        .w-fit { width: fit-content; }
        .btn-xs {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
        }
        .garage-strip {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .garage-strip-item {
          min-width: 200px;
          flex-shrink: 0;
          background: rgba(15,23,42,0.4);
        }
        .strip-plate {
          font-size: 0.7rem;
          background: rgba(6,182,212,0.1);
          color: var(--secondary);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          font-weight: bold;
          font-family: var(--font-display);
        }
        .garage-strip-item h5 {
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }
        .garage-strip-item p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .info-summary-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(30,41,59,0.4) 100%);
        }
        .stats-large {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .color-secondary {
          color: var(--secondary);
        }
        .vertical-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .link-item {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--text-primary);
          background: rgba(15,23,42,0.3);
          transition: all 0.2s ease;
        }
        .link-item:hover {
          color: var(--primary);
          background: var(--primary-glow);
        }
        .warning-setup-panel {
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
        }
        .warning-color {
          color: var(--warning);
        }
        .success-color {
          color: var(--success);
        }
        .grid-cols-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
        }
        .stat-card {
          background: rgba(30,41,59,0.3);
        }
        .stat-label {
          font-family: var(--font-display);
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-val {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }
        .error-alert {
          background: var(--danger-glow);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .btn-danger-hover:hover {
          color: var(--danger) !important;
          background: var(--danger-glow) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
        }
        .py-md {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
