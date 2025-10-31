import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const KYCVerification: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) return;

    if (!fullName.trim() || !address.trim() || !idNumber.trim()) {
      return alert("Please fill in all fields.");
    }

    setLoading(true);
    try {
      await firestoreService.updateUserKyc(user.id, {
        kycStatus: 'verified',
        kycId: idNumber,
        fullName,
        address
      });

      await refreshUser();

      alert('KYC verified! You now have access.');
      navigate('/profile'); 
    } catch (err) {
      console.error(err);
      alert('Failed to submit KYC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-navy-800 p-6 rounded-lg shadow-lg text-slate-200">
      <h2 className="text-2xl font-bold mb-4">Complete Your KYC</h2>

      <div className="mb-4">
        <label className="block text-sm mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full p-2 rounded bg-navy-900 text-slate-200 border border-slate-700"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Address</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-2 rounded bg-navy-900 text-slate-200 border border-slate-700"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">National ID / Passport ID</label>
        <input
          type="text"
          value={idNumber}
          onChange={e => setIdNumber(e.target.value)}
          className="w-full p-2 rounded bg-navy-900 text-slate-200 border border-slate-700"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-teal-500 text-navy-900 py-2 rounded hover:bg-teal-400 font-semibold"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit KYC'}
      </button>
    </div>
  );
};

export default KYCVerification;
