import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCustomerVehicles } from '../services/vehicle.service';
import { getPackages, createAppointment } from '../services/appointment.service';
import { getMechanics } from '../services/auth.service';
import Navbar from '../components/Navbar';
import { Calendar, Car, Sparkles, User, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const BookAppointment = () => {
  const { authState, customerProfile } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [mechanics, setMechanics] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };



  useEffect(() => {
    const loadBookingData = async () => {
      if (!customerProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        const [vehiclesData, packagesData] = await Promise.all([
          getCustomerVehicles(authState.userId),
          getPackages()
        ]);
        setVehicles(vehiclesData || []);
        setPackages(packagesData || []);
        
        if (vehiclesData?.length > 0) {
          setSelectedVehicle(vehiclesData[0].id);
        }
        if (packagesData?.length > 0) {
          setSelectedPackage(packagesData[0].id);
        }
      } catch (err) {
        console.warn('Failed to load vehicles or packages', err);
        setError('Could not retrieve service details. Please try again.');
      }

      try {
        const mechanicsData = await getMechanics();
        setMechanics(mechanicsData || []);
        if (mechanicsData?.length > 0) {
          setSelectedMechanic(mechanicsData[0].id);
        }
      } catch (err) {
        console.warn('Failed to load registered mechanics, falling back to empty list', err);
        setMechanics([]);
      }

      setLoading(false);
    };

    loadBookingData();
  }, [customerProfile, authState.userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedPackage || !appointmentDate) {
      setError('Please complete all form selection fields.');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const now = new Date();
    if (selectedDate < now) {
      setError('Cannot book appointments for past dates and times. Please select a current or future time.');
      return;
    }

    setSubmitting(true);
    setError('');

    const packageObj = packages.find(p => String(p.id) === String(selectedPackage));

    const payload = {
      customerId: Number(authState.userId),
      vehicleId: Number(selectedVehicle),
      packageId: Number(selectedPackage),
      mechanicId: Number(selectedMechanic),
      status: 'PENDING',
      appointmentDate: appointmentDate.length === 16 ? `${appointmentDate}:00` : appointmentDate
    };

    try {
      const result = await createAppointment(payload);
      // Nice workflow: redirect directly to payment page with appointment details
      navigate(`/payment`, { 
        state: { 
          appointmentId: result.id, 
          amount: packageObj?.price || 99.99,
          packageName: packageObj?.name || 'Standard Service'
        } 
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while scheduling. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container text-center mt-lg">
          <p className="text-muted">Loading garage details and service menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Navbar />
      <div className="container animate-fade-in">
        <div className="booking-header">
          <h1>Book Service Appointment</h1>
          <p>Choose your vehicle, select a repair package, and choose your preferred mechanic</p>
        </div>

        {!customerProfile ? (
          <div className="glass-panel text-center mt-lg warning-panel">
            <ShieldAlert size={48} className="warning-color" />
            <h3 className="mt-sm">Profile Details Required</h3>
            <p className="text-muted mt-xs">Before booking services, you need to set up your customer name and contact details.</p>
            <Link to="/profile" className="btn btn-primary mt-md">Complete Profile Now</Link>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="glass-panel text-center mt-lg warning-panel">
            <Car size={48} className="logo-accent" />
            <h3 className="mt-sm">No Registered Vehicles Found</h3>
            <p className="text-muted mt-xs">You need to add at least one vehicle to your garage before booking an appointment.</p>
            <Link to="/profile" className="btn btn-primary mt-md">Register a Vehicle</Link>
          </div>
        ) : (
          <div className="grid-cols-3 mt-lg">
            {/* Booking Form (2 columns) */}
            <div className="glass-panel col-span-2">
              <h3 className="section-title flex-row gap-sm">
                <Calendar size={20} className="logo-icon" />
                Appointment Specifications
              </h3>

              {error && <div className="error-alert mt-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="mt-md">
                <div className="form-group">
                  <label className="form-label">Select Vehicle</label>
                  <select
                    id="booking-vehicle"
                    className="glass-input glass-select"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Service Package</label>
                  <select
                    id="booking-package"
                    className="glass-input glass-select"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    required
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Mechanic</label>
                  <select
                    id="booking-mechanic"
                    className="glass-input glass-select"
                    value={selectedMechanic}
                    onChange={(e) => setSelectedMechanic(e.target.value)}
                    required
                  >
                    {mechanics.length === 0 ? (
                      <option value="">No registered mechanics available</option>
                    ) : (
                      mechanics.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.username}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Date & Time</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="input-icon" />
                    <input
                      id="booking-date"
                      type="datetime-local"
                      className="glass-input has-icon"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={getMinDateTime()}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-md" disabled={submitting}>
                  {submitting ? 'Confirming Appointment...' : 'Submit & Proceed to Checkout'}
                </button>
              </form>
            </div>

            {/* Service catalog quick details */}
            <div className="catalog-sidebar flex-column gap-md">
              <h3 className="sidebar-title flex-row gap-sm">
                <Sparkles size={18} className="logo-accent" />
                Service Catalog Details
              </h3>

              <div className="catalog-list mt-sm">
                {packages.map((p) => (
                  <div 
                    key={p.id} 
                    className={`catalog-card glass-card ${String(p.id) === String(selectedPackage) ? 'selected' : ''}`}
                    onClick={() => setSelectedPackage(p.id)}
                  >
                    <div className="flex-between">
                      <h5>{p.name}</h5>
                      <span className="price-tag">₹{p.price}</span>
                    </div>
                    <p className="catalog-desc">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booking-page {
          min-height: 100vh;
        }
        .col-span-2 {
          grid-column: span 2 / span 2;
        }
        .catalog-sidebar {
          display: flex;
          flex-direction: column;
        }
        .sidebar-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
        }
        .catalog-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .catalog-card {
          cursor: pointer;
          background: rgba(30, 41, 59, 0.15);
          transition: all 0.2s ease;
        }
        .catalog-card.selected {
          border-color: var(--primary);
          background: var(--primary-glow);
          box-shadow: 0 0 10px var(--primary-glow);
        }
        .price-tag {
          color: var(--secondary);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
        }
        .catalog-desc {
          font-size: 0.8rem;
          margin-top: 0.5rem;
          line-height: 1.4;
          color: var(--text-secondary);
        }
        .warning-panel {
          padding: 3.5rem 2rem;
        }
        .warning-color {
          color: var(--warning);
        }
        .input-with-icon {
          position: relative;
          display: flex;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }
        .glass-input.has-icon {
          padding-left: 2.75rem;
          width: 100%;
        }
        .error-alert {
          background: var(--danger-glow);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        @media (max-width: 992px) {
          .grid-cols-3 {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1 / span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
