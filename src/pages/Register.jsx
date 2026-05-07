import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Laptop, Lock, Mail, User, Shield, AlertCircle, Eye, EyeOff, ChevronDown } from 'lucide-react';
import mitLogo from '../assets/mit_logo.svg';
import muLogo from '../assets/mu_logo.svg';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    grandfatherName: '',
    universityId: 'mit/ur//',
    email: '',
    password: '',
    role: '', 
    department: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState('password');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Client-side Validation ---
    const { firstName, fatherName, grandfatherName, role, email, password, department } = formData;

    if (!role) {
      setError('Please select an account type.');
      return;
    }
    if (!firstName.trim() || !fatherName.trim() || !grandfatherName.trim()) {
      setError('All name fields are required.');
      return;
    }
    if (role === 'student' && !department) {
      setError('Please select your department.');
      return;
    }
    if (role !== 'guard') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const name = `${firstName} ${fatherName} ${grandfatherName}`.trim();
    const payload = {
      name,
      universityId: formData.universityId.trim(),
      email: email.trim(),
      password,
      role,
      department,
    };

    const result = await register(payload);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };
  const toggleVisibility = () => {
    setShowPassword(showPassword === 'password' ? 'text' : 'password');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-linear-to-r from-indigo-50 via-white to-blue-50 py-12">
      <div className="z-10 w-full max-w-md p-8 glass-panel rounded-2xl shadow-xl border border-white/40">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full">
            <img src={mitLogo} alt="MIT Logo" className="h-10 sm:h-12 w-auto object-contain" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src={muLogo} alt="MU Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-800">
            Create Account
          </h2>
          <p className="text-slate-500 mt-2">Join Campus Security</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                <option value="" disabled>Select account type</option>
                <option value="student">Student</option>
                <option value="guard">Security Guard</option>
                <option value="admin">Administrator</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown size={18} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Hayelom"
              />
            </div>
          </div>

          {/* Father's Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                name="fatherName"
                required
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Haile"
              />
            </div>
          </div>

          {/* Grandfather's Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grandfather's Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                name="grandfatherName"
                required
                value={formData.grandfatherName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Teklay"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">University ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                name="universityId"
                required
                value={formData.universityId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="mit/ur//"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                required={formData.role !== 'guard'}
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="student@mit.edu"
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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


          {/* Department — only for students */}
          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select your program</option>
                  <option value="Computer Science AND ENGINEERING">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="BOILOGICAL AND CHEMICAL ENGINEERING">BCN</option>
                  <option value="Electrical and Communication Engineering">ECE</option>
                  <option value="Electrical AND ELECTRONICS Engineering">EEE</option>

                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronDown size={18} className="text-slate-400" />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 mt-2 bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
