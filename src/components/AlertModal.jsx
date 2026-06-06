import React, { useState } from 'react';
import { X, Bell, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, productName, currentPrice }) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9)); // Default to 10% off
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !targetPrice) return;

    setIsSubmitting(true);
    // Simulate API registration delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleClose = () => {
    // Reset state and close
    setEmail('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-card glass">
        <button className="modal-close-btn" onClick={handleClose}>
          <X size={18} />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-icon-container">
              <Bell size={24} className="text-indigo animate-bounce-slow" />
            </div>
            
            <h3 className="modal-title">Create Price Drop Alert</h3>
            <p className="modal-subtitle">We will scan all stores 24/7 and email you when the price drops below your target threshold.</p>
            
            <div className="modal-product-box">
              <div className="modal-product-name">{productName}</div>
              <div className="modal-product-price">Current Cheapest: <strong>₹{currentPrice.toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="modal-fields-group">
              <div className="input-field-wrapper">
                <label className="input-label">Target Price (₹)</label>
                <div className="input-icon-container">
                  <span className="input-icon-prefix">₹</span>
                  <input
                    type="number"
                    max={currentPrice}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    required
                    className="modal-input price-input"
                    placeholder="Enter target price"
                  />
                </div>
                <span className="input-helper text-indigo">
                  Usually sells for ₹{currentPrice.toLocaleString('en-IN')}. Setting target to ₹{targetPrice.toLocaleString('en-IN')} saves you ₹{Math.round(currentPrice - targetPrice).toLocaleString('en-IN')}!
                </span>
              </div>

              <div className="input-field-wrapper">
                <label className="input-label">Email Address</label>
                <div className="input-icon-container">
                  <Mail size={16} className="input-icon-prefix text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="modal-input"
                    placeholder="name@email.com"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="modal-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="spinner-border">Setting up alert...</div>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Activate Alert Tracker <Sparkles size={16} />
                </span>
              )}
            </button>

            <div className="modal-safety-tag">
              <ShieldAlert size={12} /> We respect your privacy. Unsubscribe in 1-click. No spam.
            </div>
          </form>
        ) : (
          <div className="modal-success-screen animate-fade-in">
            <div className="success-icon-container">
              <CheckCircle2 size={48} className="text-green" />
            </div>
            <h3 className="modal-title">Price Alert Active!</h3>
            <p className="modal-subtitle">
              You are all set! We have queued a price watcher for <strong>{productName}</strong>.
            </p>
            <div className="success-receipt-box">
              <div>📨 Target Alert: <strong>₹{targetPrice.toLocaleString('en-IN')}</strong></div>
              <div>📧 Email: <strong>{email}</strong></div>
            </div>
            <p className="success-footer-text">
              We'll send you an instant notification matching your criteria. Thank you for using Smart Buyer AI.
            </p>
            <button onClick={handleClose} className="modal-close-action-btn">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
