import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { processPayment } from '../services/payment.service';
import Navbar from '../components/Navbar';
import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft, Receipt } from 'lucide-react';

const Payment = () => {
  const { authState, customerProfile } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve states sent from appointment booking or dashboard
  const appointmentId = location.state?.appointmentId || '';
  const amount = location.state?.amount || 99.99;
  const packageName = location.state?.packageName || 'Standard Service';

  // Form states
  const [cardHolder, setCardHolder] = useState(customerProfile?.fullName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentId || !authState?.userId) {
      setError('Invalid appointment references. Please retry from the Dashboard.');
      return;
    }

    if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3) {
      setError('Please enter valid credit card details.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      appointmentId: Number(appointmentId),
      customerId: Number(authState.userId),
      amount: Number(amount),
      status: 'PENDING'
    };

    try {
      const response = await processPayment(payload);
      setReceipt(response); // response contains details showing successful payment
      
      // Update local storage so the dashboard immediately shows 'PAID' status
      const savedPaid = localStorage.getItem('paid_appointment_ids');
      const paidList = savedPaid ? JSON.parse(savedPaid) : [];
      if (!paidList.includes(Number(appointmentId))) {
        paidList.push(Number(appointmentId));
        localStorage.setItem('paid_appointment_ids', JSON.stringify(paidList));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <div className="container animate-fade-in">
        <div className="payment-header">
          <Link to="/dashboard" className="back-link flex-row gap-xs">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="mt-xs">Secure Checkout</h1>
          <p>Authorize payment for your scheduled vehicle service</p>
        </div>

        {receipt ? (
          /* Receipt Screen */
          <div className="glass-panel receipt-panel animate-slide-up text-center mt-lg">
            <div className="receipt-success-icon-wrapper animate-glow">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="mt-sm">Payment Successful!</h2>
            <p className="text-muted">Thank you for your payment. Your receipt details are listed below.</p>
            
            <div className="receipt-details glass-card mt-md text-left">
              <h4 className="flex-row gap-xs border-b pb-sm mb-sm text-center justify-center">
                <Receipt size={18} className="logo-accent" /> Official Receipt
              </h4>
              <div className="receipt-row flex-between">
                <span>Transaction ID:</span>
                <span className="receipt-val">#{receipt.id}</span>
              </div>
              <div className="receipt-row flex-between">
                <span>Appointment Reference:</span>
                <span className="receipt-val">#{receipt.appointmentId}</span>
              </div>
              <div className="receipt-row flex-between">
                <span>Service Package:</span>
                <span className="receipt-val">{packageName}</span>
              </div>
              <div className="receipt-row flex-between">
                <span>Date Paid:</span>
                <span className="receipt-val">
                  {new Date(receipt.paymentDate).toLocaleString()}
                </span>
              </div>
              <div className="receipt-row flex-between total-row pt-sm border-t mt-sm">
                <span>Amount Charged:</span>
                <span className="receipt-total">₹{receipt.amount}</span>
              </div>
            </div>

            <Link to="/dashboard" className="btn btn-primary mt-lg">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          /* Payment Processing Form */
          <div className="grid-cols-2 mt-lg">
            {/* Left: Card inputs */}
            <div className="glass-panel">
              <h3 className="section-title flex-row gap-sm mb-md">
                <CreditCard size={20} className="logo-icon" />
                Credit Card Information
              </h3>

              {error && <div className="error-alert mb-sm">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    id="payment-cardholder"
                    type="text"
                    className="glass-input"
                    placeholder="e.g. John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    id="payment-cardnumber"
                    type="text"
                    maxLength="19"
                    className="glass-input"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Expiration Date</label>
                    <input
                      id="payment-expiry"
                      type="text"
                      maxLength="5"
                      className="glass-input"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      id="payment-cvv"
                      type="password"
                      maxLength="3"
                      className="glass-input"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-md" disabled={loading || !appointmentId}>
                  {loading ? 'Processing Transaction...' : `Pay ₹${amount}`}
                </button>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="flex-column gap-md justify-between">
              {/* Order Summary */}
              <div className="glass-panel">
                <h3 className="section-title">Order Summary</h3>
                <div className="summary-details mt-sm">
                  <div className="summary-row flex-between">
                    <span>Appointment Reference:</span>
                    <span className="summary-val">#{appointmentId || 'N/A'}</span>
                  </div>
                  <div className="summary-row flex-between">
                    <span>Selected Package:</span>
                    <span className="summary-val">{packageName}</span>
                  </div>
                  <div className="summary-row flex-between total-row pt-sm border-t mt-sm">
                    <span>Total Bill:</span>
                    <span className="summary-total">₹{amount}</span>
                  </div>
                </div>
                <div className="security-assurance flex-row gap-sm mt-md">
                  <ShieldCheck className="success-color" size={20} />
                  <span className="security-text">256-bit SSL encrypted connection. Payment records are locked securely.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .payment-page {
          min-height: 100vh;
        }
        .back-link {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .back-link:hover {
          color: var(--text-primary);
        }
        .mt-xs { margin-top: 0.25rem; }
        .receipt-panel {
          max-width: 500px;
          margin: 2rem auto;
          padding: 2.5rem 2rem;
        }
        .receipt-success-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .receipt-details {
          background: rgba(15,23,42,0.4);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .border-b { border-bottom: 1px solid var(--glass-border); }
        .border-t { border-top: 1px solid var(--glass-border); }
        .pb-sm { padding-bottom: 0.5rem; }
        .pb-xs { padding-bottom: 0.25rem; }
        .pt-sm { padding-top: 0.5rem; }
        .mb-sm { margin-bottom: 0.5rem; }
        .receipt-row, .summary-row {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .receipt-val, .summary-val {
          color: var(--text-primary);
          font-weight: 500;
        }
        .receipt-total, .summary-total {
          color: var(--secondary);
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-display);
        }
        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .security-assurance {
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.1);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }
        .security-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }
        .success-color {
          color: var(--success);
        }
        .error-alert {
          background: var(--danger-glow);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Payment;
