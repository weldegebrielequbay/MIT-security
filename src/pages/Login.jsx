import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Laptop, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import mitLogo from '../assets/mit_logo.svg';
import muLogo from '../assets/mu_logo.svg';

const Login = () => {
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState('password');

  const toggleVisibility = () => {
    setShowPassword(showPassword === 'password' ? 'text' : 'password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Client-side Validation ---
    const trimmedId = universityId.trim();
    if (!trimmedId) {
      setError('Please enter your Student or Guard ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (trimmedId.length > 50) {
      setError('ID is too long.');
      return;
    }
    if (password.length > 128) {
      setError('Password is too long.');
      return;
    }

    setIsLoading(true);

    const result = await login(trimmedId, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-blue-50">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-md p-8 glass-panel rounded-2xl shadow-xl border border-white/40">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full">
            <img src={mitLogo} alt="MIT Logo" className="h-10 sm:h-12 w-auto object-contain" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src={muLogo} alt="MU Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-800">
            Security Portal
          </h2>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student or Guard ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Laptop size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Enter your ID (e.g. mit/ur/...)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type='button'
                onClick={toggleVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword === 'password' ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
