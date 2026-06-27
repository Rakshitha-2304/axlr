import React, { useState, useEffect } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage } from '../services/appointment.service';
import Navbar from '../components/Navbar';
import { Layers, Plus, Trash2, Edit3, Sparkles, Check, AlertCircle, X } from 'lucide-react';

const ManagePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form parameters
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPackagesData = async () => {
    setLoading(true);
    try {
      const data = await getPackages();
      setPackages(data || []);
    } catch (err) {
      console.warn('Failed to load packages catalog', err);
      setError('Could not query catalog. The service might be starting up.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesData();
  }, []);

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price);
    setDescription(p.description);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      setError('Please fill in all details.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      price: Number(price),
      description
    };

    try {
      if (editingId) {
        // Update package
        await updatePackage(editingId, payload);
        setSuccess('Service package updated successfully!');
      } else {
        // Create package
        await createPackage(payload);
        setSuccess('New service package cataloged!');
      }
      handleCancel();
      await fetchPackagesData();
    } catch (err) {
      console.error(err);
      setError('Failed to process catalog action. Make sure you are authorized.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service package?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await deletePackage(id);
      setSuccess('Package deleted successfully.');
      await fetchPackagesData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete package.');
    }
  };

  return (
    <div className="packages-page">
      <Navbar />
      <div className="container animate-fade-in">
        <div className="flex-between header-container mb-lg">
          <div>
            <h1>Manage Service Packages</h1>
            <p>Admin configuration for client service offerings and diagnostics costs</p>
          </div>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} /> New Package
            </button>
          )}
        </div>

        {success && (
          <div className="alert alert-success flex-row gap-sm animate-slide-up mb-md">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger flex-row gap-sm animate-slide-up mb-md">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Package Creator Form */}
        {showForm && (
          <div className="glass-panel form-panel animate-slide-up mb-lg">
            <div className="flex-between border-b pb-sm mb-sm">
              <h3 className="flex-row gap-xs">
                <Sparkles size={18} className="logo-accent" />
                {editingId ? 'Modify Package Specs' : 'Draft New Package'}
              </h3>
              <button className="close-btn" onClick={handleCancel} title="Close Form">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-md">
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Package Title</label>
                  <input
                    id="package-name"
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Synthetic Oil Tune-up"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹ INR)</label>
                  <input
                    id="package-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="glass-input"
                    placeholder="e.g. 129.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  id="package-description"
                  rows="3"
                  className="glass-input textarea-field"
                  placeholder="Detail the tasks, components, and procedures included in this package..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex-row gap-sm mt-md">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Cataloging Specs...' : editingId ? 'Update Package' : 'Publish Package'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Package Catalog View */}
        {loading ? (
          <p className="text-center text-muted mt-lg">Retrieving catalog records...</p>
        ) : packages.length === 0 ? (
          <div className="glass-panel text-center py-lg mt-md">
            <Layers size={36} className="text-muted" />
            <p className="text-muted mt-sm">No packages currently cataloged. Click 'New Package' to start.</p>
          </div>
        ) : (
          <div className="grid-cols-3 mt-md">
            {packages.map((p) => (
              <div key={p.id} className="glass-card package-item flex-column justify-between h-full">
                <div className="package-item-header border-b pb-sm mb-sm">
                  <div className="flex-between">
                    <h4>{p.name}</h4>
                    <span className="price-tag-badge">₹{p.price}</span>
                  </div>
                  <span className="package-id-badge">ID: #{p.id}</span>
                </div>
                
                <p className="package-item-desc mb-md">{p.description}</p>
                
                <div className="flex-row gap-sm pt-sm border-t mt-auto">
                  <button 
                    className="btn btn-secondary btn-sm flex-1 flex-row gap-xs"
                    onClick={() => handleEditClick(p)}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm flex-row gap-xs"
                    onClick={() => handleDeleteClick(p.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .packages-page {
          min-height: 100vh;
        }
        .header-container {
          padding-top: 1rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
        }
        .close-btn:hover {
          color: var(--danger);
          background: var(--danger-glow);
        }
        .textarea-field {
          resize: vertical;
          width: 100%;
        }
        .form-panel {
          background: rgba(15,23,42,0.4);
        }
        .border-b { border-bottom: 1px solid var(--glass-border); }
        .border-t { border-top: 1px solid var(--glass-border); }
        .pb-sm { padding-bottom: 0.5rem; }
        .mb-sm { margin-bottom: 0.5rem; }
        .pt-sm { padding-top: 0.5rem; }
        .mb-lg { margin-bottom: 1.5rem; }
        .mt-lg { margin-top: 1.5rem; }
        .mt-md { margin-top: 1rem; }
        .mt-sm { margin-top: 0.75rem; }
        .mb-md { margin-bottom: 1rem; }
        .flex-1 { flex: 1; }
        .h-full {
          height: 100%;
        }
        .btn-sm {
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
        }
        .price-tag-badge {
          color: var(--secondary);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
        }
        .package-id-badge {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .package-item {
          display: flex;
          flex-direction: column;
          background: rgba(30, 41, 59, 0.15);
        }
        .package-item-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
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
      `}</style>
    </div>
  );
};

export default ManagePackages;
