import React, { useState, useEffect, useContext } from 'react';
import { getAllAppointments, patchAppointmentStatus, patchAppointmentMechanic, getPackages } from '../services/appointment.service';
import { getAllPayments } from '../services/payment.service';
import { getAllUsers } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Calendar, RefreshCw, CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react';

const UpdateStatus = () => {
  const { authState } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [paidAppointments, setPaidAppointments] = useState([]);

  // No-op local storage hook. We load payments dynamically in loadData.

  const isPaid = (appointmentId) => {
    return paidAppointments.includes(Number(appointmentId));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptsData, packagesData, paymentsData] = await Promise.all([
        getAllAppointments(),
        getPackages(),
        getAllPayments().catch(() => [])
      ]);
      setAppointments(apptsData || []);
      setPackages(packagesData || []);

      const paidIds = (paymentsData || [])
        .filter(p => p.status === 'SUCCESSFUL')
        .map(p => Number(p.appointmentId));
      setPaidAppointments(paidIds);
    } catch (err) {
      console.warn('Failed to load tickets', err);
      setError('Could not query active job tickets. The services might be starting.');
    }

    try {
      const userList = await getAllUsers();
      setUsers(userList || []);
    } catch (err) {
      console.warn('Failed to load users list', err);
      setUsers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    setMessage({ text: '', type: '' });
    
    try {
      await patchAppointmentStatus(appointmentId, newStatus);
      setMessage({ 
        text: `Appointment #${appointmentId} status updated to ${newStatus} successfully!`, 
        type: 'success' 
      });
      // Refresh local array
      setAppointments(prev => prev.map(a => 
        String(a.id) === String(appointmentId) ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: `Failed to update status for appointment #${appointmentId}.`, 
        type: 'danger' 
      });
    } finally {
      setUpdatingId(null);
      // Auto clear message after 4s
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => String(p.id) === String(packageId));
    return pkg ? pkg.name : `Package #${packageId}`;
  };

  const getMechanicName = (mechanicId) => {
    const user = users.find(u => Number(u.id) === Number(mechanicId));
    return user ? user.username : `Mechanic #${mechanicId}`;
  };

  const handleMechanicChange = async (appointmentId, mechanicId) => {
    setUpdatingId(appointmentId);
    setMessage({ text: '', type: '' });
    
    try {
      await patchAppointmentMechanic(appointmentId, mechanicId ? Number(mechanicId) : null);
      setMessage({ 
        text: `Mechanic assigned to appointment #${appointmentId} successfully!`, 
        type: 'success' 
      });
      // Refresh local array
      setAppointments(prev => prev.map(a => 
        String(a.id) === String(appointmentId) ? { ...a, mechanicId: mechanicId ? Number(mechanicId) : null } : a
      ));
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: `Failed to assign mechanic for appointment #${appointmentId}.`, 
        type: 'danger' 
      });
    } finally {
      setUpdatingId(null);
      // Auto clear message after 4s
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const displayedAppointments = authState.role === 'MECHANIC'
    ? appointments.filter(a => Number(a.mechanicId) === Number(authState.userId))
    : appointments;

  return (
    <div className="status-page">
      <Navbar />
      <div className="container animate-fade-in">
        <div className="flex-between header-container mb-lg">
          <div>
            <h1>Ticket Status Control Panel</h1>
            <p>Inspect incoming bookings, assign states, and complete service cycles</p>
          </div>
          <button className="btn btn-secondary btn-sm flex-row gap-xs" onClick={loadData}>
            <RefreshCw size={16} /> Refresh List
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} flex-row gap-sm animate-slide-up mb-md`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger flex-row gap-sm animate-slide-up mb-md">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted mt-lg">Loading appointment tickets...</p>
        ) : displayedAppointments.length === 0 ? (
          <div className="glass-panel text-center py-lg mt-md">
            <Calendar size={36} className="text-muted" />
            <p className="text-muted mt-sm">No scheduled appointments logged in the system.</p>
          </div>
        ) : (
          <div className="glass-panel">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer ID</th>
                    <th>Vehicle ID</th>
                    <th>Service Package</th>
                    <th>Schedule Date</th>
                    <th>Assigned Mechanic</th>
                    <th>Current Status</th>
                    <th>Payment Status</th>
                    <th>Update Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((a) => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td>User #{a.customerId}</td>
                      <td>Vehicle #{a.vehicleId}</td>
                      <td>{getPackageName(a.packageId)}</td>
                      <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                      <td>
                        {authState.role === 'ADMIN' || authState.role === 'SERVICE_ADVISOR' ? (
                          <select
                            id={`mechanic-select-${a.id}`}
                            className="glass-input glass-select select-sm w-full"
                            value={a.mechanicId || ''}
                            onChange={(e) => handleMechanicChange(a.id, e.target.value)}
                            disabled={updatingId === a.id}
                          >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role === 'MECHANIC').map(m => (
                              <option key={m.id} value={m.id}>{m.username}</option>
                            ))}
                          </select>
                        ) : (
                          getMechanicName(a.mechanicId)
                        )}
                      </td>
                      <td>
                        {a.status === 'PENDING' && <span className="badge badge-pending">Pending</span>}
                        {a.status === 'ASSIGNED' && <span className="badge badge-assigned">Assigned</span>}
                        {a.status === 'IN_PROGRESS' && <span className="badge badge-progress">In Progress</span>}
                        {a.status === 'COMPLETED' && <span className="badge badge-success">Completed</span>}
                      </td>
                      <td>
                        {isPaid(a.id) || a.status === 'COMPLETED' ? (
                          <span className="badge badge-success flex-row gap-xs w-fit">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        ) : (
                          <span className="badge badge-pending w-fit">Unpaid</span>
                        )}
                      </td>
                      <td>
                        <select
                          id={`status-select-${a.id}`}
                          className="glass-input glass-select select-sm w-full"
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          disabled={updatingId === a.id}
                        >
                          {authState.role === 'MECHANIC' ? (
                            <>
                              {a.status !== 'IN_PROGRESS' && a.status !== 'COMPLETED' && (
                                <option value={a.status}>{a.status}</option>
                              )}
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </>
                          ) : (
                            <>
                              <option value="PENDING">PENDING</option>
                              <option value="ASSIGNED">ASSIGNED</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .status-page {
          min-height: 100vh;
        }
        .header-container {
          padding-top: 1rem;
        }
        .border-b { border-bottom: 1px solid var(--glass-border); }
        .pb-sm { padding-bottom: 0.5rem; }
        .mb-sm { margin-bottom: 0.5rem; }
        .mb-lg { margin-bottom: 1.5rem; }
        .mt-lg { margin-top: 1.5rem; }
        .mt-md { margin-top: 1rem; }
        .mt-sm { margin-top: 0.75rem; }
        .mb-md { margin-bottom: 1rem; }
        .btn-sm {
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
        }
        .select-sm {
          padding-top: 0.4rem;
          padding-bottom: 0.4rem;
          padding-left: 0.5rem !important;
          padding-right: 1.5rem !important;
          font-size: 0.85rem;
          min-width: 130px;
        }
        .alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          border: 1px solid transparent;
        }
        .alert-success {
          background: var(--success-glow);
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .alert-danger {
          background: var(--danger-glow);
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .w-full {
          width: 100%;
        }
        .glass-select {
          background-color: rgba(15, 23, 42, 0.85) !important;
          color: #f8fafc !important;
        }
        .glass-select option {
          background-color: #0b0f19 !important;
          color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default UpdateStatus;
