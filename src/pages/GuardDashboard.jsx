import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Search, ShieldCheck, Laptop, User, AlertCircle, Cpu, HardDrive } from 'lucide-react';
import api from '../api';
import mitLogo from '../assets/mit_logo.svg';
import muLogo from '../assets/mu_logo.svg';
import { MapPin, ArrowRightCircle } from 'lucide-react';

const GuardDashboard = () => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(`/laptops/search/${encodeURIComponent(query)}`);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleUpdateLocation = async (laptopId, currentStatus) => {
    const newStatus = currentStatus === 'In Campus' ? 'Out of Campus' : 'In Campus';
    setUpdatingId(laptopId);
    try {
      const { data } = await api.put(`/laptops/${laptopId}/location`, { locationStatus: newStatus });
      setResults(results.map(l => l._id === laptopId ? { ...l, ...data } : l));
    } catch (error) {
      console.error('Error updating location status:', error);
      alert('Failed to update location status. Please ensure the backend server is restarted.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 bg-slate-800/50 pr-4 pl-0 py-0 rounded-xl border border-slate-700/50">
              <div className="bg-white p-2 rounded-l-xl flex items-center gap-3 h-full self-stretch shadow-sm">
                <img src={mitLogo} alt="MIT Logo" className="h-8 w-auto object-contain" />
                <img src={muLogo} alt="MU Logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-white ml-1">Security Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-4">
            Verify <span className="text-emerald-600">Device</span> Ownership
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            Quickly search by Serial Number, MAC Address, or Student ID to verify registered laptops.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-32 py-5 text-lg bg-white border-2 border-slate-200 rounded-2xl leading-5 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm group-hover:shadow-md placeholder-slate-400"
              placeholder="Enter Serial Number, MAC, or Student ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all focus:outline-none ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? 'Scanning...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-16">
          {hasSearched && !isLoading && results.length === 0 && (
            <div className="text-center p-12 bg-white rounded-3xl border border-red-100 shadow-sm animate-fade-in max-w-2xl mx-auto">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Match Found</h3>
              <p className="text-slate-500">
                We couldn't find any registered laptops matching "<span className="font-semibold">{query}</span>".
                If this is a student device, instruct them to register it immediately.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" /> Verification Results ({results.length})
              </h2>
              <div className="grid gap-6">
                {results.map((laptop) => (
                  <div key={laptop._id} className="bg-white rounded-3xl shadow-sm border-2 border-emerald-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Status indicator sidebar */}
                    <div className="bg-emerald-50 w-full md:w-48 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-emerald-100 text-center">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                        <ShieldCheck className="h-10 w-10 text-emerald-600" />
                      </div>
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-sm flex flex-col items-center">
                        <span className="text-xs text-emerald-500 font-medium mb-1">Status</span>
                        Verified
                      </span>
                      <div className="mt-4 pt-4 border-t border-emerald-200/50 w-full">
                        <span className="text-xs text-emerald-600/70 font-medium mb-1 block uppercase tracking-wider">Location</span>
                        <div className={`inline-flex items-center justify-center w-full py-1.5 rounded-lg text-xs font-bold ${(laptop.locationStatus || 'Out of Campus') === 'In Campus'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                          {laptop.locationStatus || 'Out of Campus'}
                        </div>
                      </div>
                      {laptop.lastVerifiedBy && (
                        <div className="mt-4 pt-4 border-t border-emerald-200/50 w-full">
                          <span className="text-xs text-emerald-600/70 font-medium mb-1 block uppercase tracking-wider">Verified By</span>
                          <span className="text-sm font-bold text-emerald-800">{laptop.lastVerifiedBy.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Laptop and User Details */}
                    <div className="p-6 md:p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Device Information</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Laptop className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{laptop.brand} {laptop.model}</p>
                              {laptop.color && <p className="text-xs text-slate-500">{laptop.color}</p>}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <HardDrive className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500">Serial Number</p>
                              <p className="text-sm font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{laptop.serialNumber}</p>
                            </div>
                          </div>

                          {laptop.macAddress && (
                            <div className="flex items-start gap-3">
                              <Cpu className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-slate-500">MAC Address</p>
                                <p className="text-sm font-mono text-slate-700">{laptop.macAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:border-l border-slate-100 md:pl-8">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Owner Details</h4>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg hidden sm:flex">
                              {laptop.studentId?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{laptop.studentId.name}</p>
                              <p className="text-sm text-slate-500">{laptop.studentId.email}</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-500">ID</span>
                              <span className="text-sm font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">{laptop.studentId.universityId}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Toggle Action */}
                      <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                          disabled={updatingId === laptop._id}
                          onClick={() => handleUpdateLocation(laptop._id, laptop.locationStatus || 'Out of Campus')}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md ${updatingId === laptop._id ? 'opacity-50 cursor-not-allowed bg-slate-400 text-white cursor-pointer' :
                            (laptop.locationStatus || 'Out of Campus') === 'In Campus'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                          {updatingId === laptop._id ? 'Updating...' :
                            (laptop.locationStatus || 'Out of Campus') === 'In Campus' ? (
                              <>
                                <ArrowRightCircle size={18} />
                                Mark as Out of Campus
                              </>
                            ) : (
                              <>
                                <MapPin size={18} />
                                Mark as In Campus
                              </>
                            )}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuardDashboard;
