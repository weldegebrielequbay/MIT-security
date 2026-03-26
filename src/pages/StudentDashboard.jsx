import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Laptop, User, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import api from '../api';
import mitLogo from '../assets/mit_logo.svg';
import muLogo from '../assets/mu_logo.svg';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [laptops, setLaptops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    macAddress: '',
    color: '',
  });

  const fetchLaptops = async () => {
    try {
      const { data } = await api.get('/laptops/mine');
      setLaptops(data);
    } catch (error) {
      console.error('Error fetching laptops:', error);
    }
  };

  useEffect(() => {
    fetchLaptops();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/laptops', formData);
      setFormData({ brand: '', model: '', serialNumber: '', macAddress: '', color: '' });
      setShowForm(false);
      fetchLaptops();
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering laptop');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src={mitLogo} alt="MIT Logo" className="h-10 w-auto object-contain" />
              <img src={muLogo} alt="MU Logo" className="h-10 w-auto object-contain" />
              <div className="h-8 w-px bg-slate-300 mx-2 hidden sm:block"></div>
              <span className="font-bold text-xl text-slate-800 hidden sm:block">Student Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <User size={16} />
                <span className="text-sm font-medium">{user.name} ({user.universityId})</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Registered Devices</h1>
            <p className="text-slate-500 mt-1">Manage your laptops registered with campus security.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-md transition-colors"
          >
            {showForm ? 'Cancel' : <><Plus size={20} /> Register New</>}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Register a New Laptop</h2>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Apple, Dell, HP"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MacBook Pro M2"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. C02X543B21"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Space Gray"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">MAC Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium shadow-md transition-colors"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Laptops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laptops.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <Laptop size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-700">No laptops registered yet</h3>
              <p className="text-slate-500">Click the 'Register New' button to add your device.</p>
            </div>
          ) : (
            laptops.map((laptop) => (
              <div key={laptop._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                    <Laptop size={24} />
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    laptop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {laptop.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800">{laptop.brand} {laptop.model}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HardDrive size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-500 w-16">Serial:</span> 
                    <span className="font-mono text-slate-700">{laptop.serialNumber}</span>
                  </div>
                  
                  {laptop.color && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Cpu size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-500 w-16">Color:</span> 
                      <span>{laptop.color}</span>
                    </div>
                  )}

                  {laptop.macAddress && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-500 w-16">MAC:</span> 
                      <span className="font-mono">{laptop.macAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
