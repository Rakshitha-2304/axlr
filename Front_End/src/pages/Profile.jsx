import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createCustomerProfile, updateCustomerProfile } from '../services/customer.service';
import { getCustomerVehicles, registerVehicle } from '../services/vehicle.service';
import Navbar from '../components/Navbar';
import { User, Car, Plus, Compass, Phone, Home, Sparkles, Check, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { authState, customerProfile, refreshProfile, loadingProfile } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Profile forms
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Vehicle form
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleMessage, setVehicleMessage] = useState({ text: '', type: '' });
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Load profile values
  useEffect(() => {
    if (customerProfile) {
      setFullName(customerProfile.fullName || '');
      setPhone(customerProfile.phone || '');
      setAddress(customerProfile.address || '');
    }
  }, [customerProfile]);

  // Load vehicles if profile exists
  const fetchVehicles = async (userId) => {
    setLoadingVehicles(true);
    try {
      const data = await getCustomerVehicles(userId);
      setVehicles(data || []);
    } catch (e) {
      console.warn('Failed to load vehicles', e);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (authState?.userId) {
      fetchVehicles(authState.userId);
    }
  }, [authState?.userId]);

  // Submit Profile (Create or Update)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileMessage({ text: '', type: '' });

    const payload = {
      userId: Number(authState.userId),
      fullName,
      phone,
      address,
    };

    try {
      if (customerProfile) {
        // Update
        const updated = await updateCustomerProfile(authState.userId, payload);
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
        await refreshProfile();
      } else {
        // Create
        const created = await createCustomerProfile(payload);
        setProfileMessage({ text: 'Profile created successfully!', type: 'success' });
        await refreshProfile();
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({ text: 'Failed to update profile. Please try again.', type: 'danger' });
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Submit Vehicle
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!customerProfile?.id) {
      setVehicleMessage({ text: 'Please complete your customer profile first.', type: 'danger' });
      return;
    }

    setSubmittingVehicle(true);
    setVehicleMessage({ text: '', type: '' });

    const payload = {
      customerId: Number(authState.userId),
      make,
      model,
      year: Number(year),
      licensePlate,
    };

    try {
      await registerVehicle(payload);
      setVehicleMessage({ text: 'Vehicle registered successfully!', type: 'success' });
      setMake('');
      setModel('');
      setYear('');
      setLicensePlate('');
      setShowVehicleForm(false);
      await fetchVehicles(authState.userId);
    } catch (err) {
      console.error(err);
      setVehicleMessage({ text: 'Failed to register vehicle.', type: 'danger' });
    } finally {
      setSubmittingVehicle(false);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="container animate-fade-in">
        <div className="profile-header flex-row gap-md">
          <div className="avatar-large">
            <User size={36} />
          </div>
          <div>
            <h1>Profile Settings</h1>
            <p>Manage your address details and registered vehicles</p>
          </div>
        </div>

        <div className="grid-cols-2 mt-lg">
          {/* Profile Card */}
          <div className="glass-panel">
            <h3 className="section-title flex-row gap-sm">
              <Sparkles size={20} className="logo-accent" />
              {customerProfile ? 'Account Information' : 'Complete Your Profile'}
            </h3>
            
            {profileMessage.text && (
              <div className={`alert alert-${profileMessage.type} flex-row gap-sm`}>
                {profileMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-md">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="profile-fullName"
                    type="text"
                    className="glass-input has-icon"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    id="profile-phone"
                    type="tel"
                    className="glass-input has-icon"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service/Home Address</label>
                <div className="input-with-icon">
                  <Home size={16} className="input-icon" />
                  <input
                    id="profile-address"
                    type="text"
                    className="glass-input has-icon"
                    placeholder="Enter your street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-sm" disabled={submittingProfile}>
                {submittingProfile ? 'Saving...' : customerProfile ? 'Update Settings' : 'Create Profile'}
              </button>
            </form>
          </div>

          {/* Vehicles Card */}
          <div className="glass-panel">
            <div className="flex-between section-title-container">
              <h3 className="section-title flex-row gap-sm">
                <Car size={20} className="logo-icon" />
                Your Garage
              </h3>
              {customerProfile && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowVehicleForm(!showVehicleForm)}
                >
                  <Plus size={16} /> Add Vehicle
                </button>
              )}
            </div>

            {/* Vehicle Form */}
            {showVehicleForm && (
              <div className="vehicle-form-wrapper glass-card animate-slide-up mt-md">
                <h4 className="form-title">Register Vehicle</h4>
                
                {vehicleMessage.text && (
                  <div className={`alert alert-${vehicleMessage.type} flex-row gap-sm mt-sm`}>
                    {vehicleMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{vehicleMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleVehicleSubmit} className="mt-sm">
                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Make</label>
                      <input
                        id="vehicle-make"
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Toyota"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input
                        id="vehicle-model"
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Corolla"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input
                        id="vehicle-year"
                        type="number"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        className="glass-input"
                        placeholder="e.g. 2022"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">License Plate</label>
                      <input
                        id="vehicle-licensePlate"
                        type="text"
                        className="glass-input"
                        placeholder="e.g. XYZ1234"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex-row gap-sm mt-sm">
                    <button type="submit" className="btn btn-primary btn-sm flex-1" disabled={submittingVehicle}>
                      {submittingVehicle ? 'Saving...' : 'Register'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => setShowVehicleForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Garage List */}
            <div className="vehicles-list mt-md">
              {!customerProfile ? (
                <div className="no-profile-warning text-center">
                  <AlertCircle size={32} className="warning-color" />
                  <p className="mt-sm">You must complete your profile information to register vehicles and book services.</p>
                </div>
              ) : loadingVehicles ? (
                <p className="text-center text-muted">Retrieving garage items...</p>
              ) : vehicles.length === 0 ? (
                <div className="empty-garage text-center">
                  <Car size={36} className="text-muted" />
                  <p className="mt-sm">Your garage is currently empty. Click 'Add Vehicle' to get started.</p>
                </div>
              ) : (
                <div className="garage-grid">
                  {vehicles.map((v) => (
                    <div key={v.id} className="glass-card vehicle-card">
                      <div className="flex-between">
                        <div className="vehicle-info">
                          <h4>{v.make} {v.model}</h4>
                          <p className="vehicle-year-label">{v.year}</p>
                        </div>
                        <span className="plate-badge">{v.licensePlate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
        }
        .avatar-large {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-md);
          background: var(--primary-glow);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }
        .section-title-container {
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
        }
        .mt-lg { margin-top: 1.5rem; }
        .mt-md { margin-top: 1rem; }
        .mt-sm { margin-top: 0.75rem; }
        .flex-1 { flex: 1; }
        .btn-sm {
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
        }
        .alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1rem;
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
        .vehicle-form-wrapper {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(15,23,42,0.4);
        }
        .form-title {
          font-size: 1rem;
          font-weight: 600;
        }
        .plate-badge {
          background: rgba(6, 182, 212, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(6, 182, 212, 0.2);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }
        .vehicle-year-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .garage-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .vehicle-card {
          background: rgba(30, 41, 59, 0.15);
        }
        .no-profile-warning, .empty-garage {
          padding: 2.5rem 1.5rem;
          border-radius: var(--radius-md);
          background: rgba(15,23,42,0.2);
          border: 1px dashed var(--glass-border);
        }
        .warning-color {
          color: var(--warning);
        }
      `}</style>
    </div>
  );
};

export default Profile;
