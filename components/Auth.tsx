//Auth.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Spinner from './Spinner';

interface AuthProps {
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('investor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password, role);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      {/* Blurred shapes */}
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-pink-500 to-orange-400 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500 to-pink-500 opacity-15 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('/assets/noise.png')] bg-repeat opacity-5"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/80 p-8 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-4xl font-bold text-center text-white mb-2">LiftUP</h1>
        <p className="text-center text-slate-400 mb-6">Invest in the Future</p>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 text-sm font-medium ${isLogin ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 text-sm font-medium ${!isLogin ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="text-sm font-bold text-slate-400 block mb-2">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-bold text-slate-400 block mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-bold text-slate-400 block mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {!isLogin && (
            <div>
              <span className="text-sm font-bold text-slate-400 block mb-2">I am a...</span>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="role" value="investor" checked={role === 'investor'} onChange={() => setRole('investor')} className="form-radio text-teal-500" />
                  <span className="ml-2 text-white">Investor</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="role" value="creator" checked={role === 'creator'} onChange={() => setRole('creator')} className="form-radio text-teal-500" />
                  <span className="ml-2 text-white">Creator</span>
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-teal-400 disabled:bg-slate-600 transition flex items-center justify-center"
          >
            {loading ? <Spinner size="sm" /> : isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full mt-2 text-sm text-gray-400 hover:text-white transition"
          >
            Back to Landing
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
