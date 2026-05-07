import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Search, Activity, Users, Database, ShieldCheck, Laptop, MapPin, ArrowRightCircle, Loader2, KeyRound, RefreshCw, Copy, CheckCheck, X } from 'lucide-react';
import api from '../api';
import mitLogo from '../assets/mit_logo.svg';
import muLogo from '../assets/mu_logo.svg';
import ChangePasswordModal from '../components/ChangePasswordModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'users'
  const [activityQuery, setActivityQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearchingActivities, setIsSearchingActivities] = useState(false);

  // User Management State
  const [userQuery, setUserQuery] = useState('mit/ur//');
  const [users, setUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newId, setNewId] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password Reset Tab State
  const [resetQuery, setResetQuery] = useState('');
  const [resetRoleFilter, setResetRoleFilter] = useState(''); // '' = all
  const [resetUsers, setResetUsers] = useState([]);
  const [isSearchingReset, setIsSearchingReset] = useState(false);
  const [resettingId, setResettingId] = useState(null);
  const [resetResult, setResetResult] = useState(null); // { userName, newPassword }
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activities')
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivitySearch = (e) => {
    e.preventDefault();
    // Snapshot current values, then clear inputs immediately
    const q = activityQuery.trim();
    const sd = startDate;
    const ed = endDate;
    setActivityQuery('');
    setStartDate('');
    setEndDate('');
    setActivities([]);
    setIsSearchingActivities(true);
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (sd) params.append('startDate', sd);
    if (ed) params.append('endDate', ed);
    api.get(`/admin/activities?${params.toString()}`)
      .then(res => setActivities(res.data))
      .catch(err => console.error('Error fetching activities:', err))
      .finally(() => setIsSearchingActivities(false));
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsSearchingUsers(true);
    try {
      const { data } = await api.get(`/admin/users/search?q=${encodeURIComponent(userQuery)}`);
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Failed to search users');
    } finally {
      setIsSearchingUsers(false);
      setUserQuery('mit/ur//');
    }
  };

  const handleUpdateId = async (userId) => {
    if (!newId.trim()) return;
    setIsUpdatingId(true);
    try {
      await api.patch(`/admin/users/${userId}/universityId`, { universityId: newId });
      alert('University ID updated successfully');
      setUsers(users.map(u => u._id === userId ? { ...u, universityId: newId } : u));
      setEditingUserId(null);
      setNewId('');
      fetchData(); // Refresh stats
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update ID');
    } finally {
      setIsUpdatingId(false);
    }
  };

  const handleResetSearch = async (e) => {
    e.preventDefault();
    if (!resetQuery.trim()) return;
    setIsSearchingReset(true);
    try {
      const params = new URLSearchParams({ q: resetQuery });
      if (resetRoleFilter) params.set('role', resetRoleFilter);
      const { data } = await api.get(`/admin/users/search?${params.toString()}`);
      setResetUsers(data);
    } catch (error) {
      console.error('Error searching users for reset:', error);
      alert('Failed to search users');
    } finally {
      setIsSearchingReset(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    setResettingId(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/reset-password`);
      setResetResult({ userName: data.userName, newPassword: data.newPassword });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingId(null);
    }
  };

  const handleCopyPassword = () => {
    if (resetResult) {
      navigator.clipboard.writeText(resetResult.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statsDisplay = stats ? [
    { name: 'Student Registries', value: stats.totalLaptops, icon: <Laptop size={24} className="text-blue-400" />, change: 'Verified Devices' },
    { name: 'In Campus (Students)', value: stats.laptopsInCampus, icon: <MapPin size={24} className="text-emerald-400" />, change: 'Currently Present' },
    { name: 'Out of Campus (Students)', value: stats.laptopsOutCampus, icon: <ArrowRightCircle size={24} className="text-amber-400" />, change: 'Currently Away' },
    { name: 'Total Students', value: stats.totalStudents, icon: <Users size={24} className="text-indigo-400" />, change: 'Registered' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="h-auto flex flex-col items-center py-6 border-b border-slate-700 gap-4">
            <div className="bg-white p-3 rounded-2xl w-10/12 flex items-center justify-center gap-2 shadow-sm">
              <img src={mitLogo} alt="MIT" className="h-8 w-auto object-contain" />
              <img src={muLogo} alt="MU" className="h-8 w-auto object-contain" />
            </div>
            <span className="font-bold text-lg tracking-wide text-white">Admin Portal</span>
          </div>

          <div className="p-4 flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">Main Menu</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                  }`}
              >
                <Activity size={18} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'users'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                  }`}
              >
                <ShieldCheck size={18} /> ID Correction
              </button>
              <button
                onClick={() => setActiveTab('reset')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'reset'
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/20 shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                  }`}
              >
                <RefreshCw size={18} /> Password Reset
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-indigo-400/10 hover:text-indigo-400 rounded-lg transition-colors mb-1"
            >
              <KeyRound size={16} /> Change Password
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <header className="h-16 bg-slate-800 border-b border-slate-700 flex md:hidden items-center justify-between px-4">
            <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg">
              <img src={mitLogo} alt="MIT" className="h-6 w-auto" />
              <img src={muLogo} alt="MU" className="h-6 w-auto" />
            </div>
            <span className="font-bold text-white ml-2">Admin Control</span>
            <button onClick={logout} className="p-2 text-slate-400">
              <LogOut size={20} />
            </button>
          </header>

          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {activeTab === 'dashboard' ? 'System Overview' : activeTab === 'users' ? 'Identity Management' : 'Password Reset'}
              </h1>
              <p className="text-slate-400">
                {activeTab === 'dashboard'
                  ? 'Real-time statistics and activity for Campus Security.'
                  : activeTab === 'users'
                  ? 'Search and correct student identification records.'
                  : 'Reset account passwords for students and guards.'}
              </p>
            </div>

            {isLoading && activeTab === 'dashboard' ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading meaningful insights...</p>
              </div>
            ) : activeTab === 'dashboard' ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statsDisplay.map((stat, i) => (
                    <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg shadow-black/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          {stat.icon}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-slate-900/80 text-slate-400 rounded-md">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-white leading-none">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Activity Feed */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl shadow-black/20 mb-8">
                  <div className="px-6 py-5 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800/50 backdrop-blur-sm gap-4">
                    <div className="flex items-center gap-2 mb-3 sm:mb-0">
                      <Activity size={18} className="text-indigo-400" />
                      <h3 className="font-bold text-lg text-white">Live Activity Feed</h3>
                    </div>
                    <form onSubmit={handleActivitySearch} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-400 w-full"
                          title="Start Date"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-400 w-full"
                          title="End Date"
                        />
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="text"
                          placeholder="Search type, ID, or serial..."
                          value={activityQuery}
                          onChange={(e) => setActivityQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-200"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearchingActivities}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        {isSearchingActivities ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        Filter
                      </button>
                    </form>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-900/30 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-6 py-4">Action</th>
                          <th className="px-6 py-4">Device</th>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Security Officer</th>
                          <th className="px-6 py-4 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {activities.length > 0 ? activities.map((act) => (
                          <tr key={act._id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${act.action === 'Checked In'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                {act.action}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-200">{act.laptopId?.brand} {act.laptopId?.model}</p>
                              <p className="text-[10px] font-mono text-slate-500">{act.laptopId?.serialNumber}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-slate-300">{act.studentId?.name}</p>
                              <p className="text-[10px] text-slate-500">{act.studentId?.universityId}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                              <p className="text-sm font-medium text-slate-300">{act.guardId?.name}</p>
                              <p className="text-[10px] text-slate-500">{act.guardId?.universityId}</p>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                              {new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center">
                                <Database size={40} className="mb-3 opacity-20" />
                                <p>{activityQuery ? 'No activities match your search.' : 'No movement activities recorded yet.'}</p>
                                {!activityQuery && <p className="text-xs mt-1">Status updates from checkpoints will appear here.</p>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : activeTab === 'users' ? (
              /* User Management Tab */
              <div className="space-y-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                  <form onSubmit={handleUserSearch} className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                      <input
                        type="text"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Search student by name or current ID..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingUsers}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      {isSearchingUsers ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Search
                    </button>
                  </form>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="font-bold text-white">Search Results</h3>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {users.length > 0 ? users.map((u) => (
                      <div key={u._id} className="p-6 hover:bg-slate-700/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-white">{u.name}</p>
                          <p className="text-sm text-slate-400">Current ID: <span className="font-mono text-indigo-400 font-bold">{u.universityId}</span></p>
                          <p className="text-xs text-slate-500 mt-1">{u.email}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {editingUserId === u._id ? (
                            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-indigo-500/30">
                              <input
                                type="text"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                placeholder="Enter correct ID"
                                className="bg-transparent border-none outline-none text-sm px-2 w-32 sm:w-48"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateId(u._id)}
                                disabled={isUpdatingId}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-all"
                                title="Save"
                              >
                                {isUpdatingId ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                              </button>
                              <button
                                onClick={() => { setEditingUserId(null); setNewId(''); }}
                                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-all"
                                title="Cancel"
                              >
                                <LogOut size={16} className="rotate-180" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingUserId(u._id); setNewId(u.universityId); }}
                              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-600"
                            >
                              Correct ID
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-500">
                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                        <p>No students found matching your search.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Password Reset Tab */
              <div className="space-y-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                  <form onSubmit={handleResetSearch} className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={resetRoleFilter}
                      onChange={(e) => setResetRoleFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-slate-300 sm:w-44"
                    >
                      <option value="">All Roles</option>
                      <option value="student">Student</option>
                      <option value="guard">Guard</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                      <input
                        type="text"
                        value={resetQuery}
                        onChange={(e) => setResetQuery(e.target.value)}
                        placeholder="Search by name or University ID..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingReset}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      {isSearchingReset ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Search
                    </button>
                  </form>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="font-bold text-white">Search Results</h3>
                    <p className="text-xs text-slate-500 mt-1">Click "Reset Password" to generate a new temporary password for the user.</p>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {resetUsers.length > 0 ? resetUsers.map((u) => (
                      <div key={u._id} className="p-6 hover:bg-slate-700/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-bold text-white">{u.name}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : u.role === 'guard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>{u.role}</span>
                          </div>
                          <p className="text-sm text-slate-400 font-mono">{u.universityId}</p>
                          {u.email && <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>}
                        </div>
                        <button
                          onClick={() => handleResetPassword(u._id)}
                          disabled={resettingId === u._id}
                          className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          {resettingId === u._id ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                          Reset Password
                        </button>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-500">
                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                        <p>Search for a user to reset their password.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Password Reset Result Modal */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            <button
              onClick={() => { setResetResult(null); setCopied(false); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto mb-5">
              <RefreshCw size={24} className="text-emerald-400" />
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-1">Password Reset Successful</h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              Give this temporary password to <span className="font-semibold text-slate-200">{resetResult.userName}</span>. They should change it after logging in.
            </p>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
              <span className="font-mono text-2xl font-bold tracking-widest text-emerald-400 select-all">
                {resetResult.newPassword}
              </span>
              <button
                onClick={handleCopyPassword}
                className="shrink-0 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {copied ? <CheckCheck size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-rose-400/80 text-center">
              ⚠ This password will not be shown again. Copy it now.
            </p>

            <button
              onClick={() => { setResetResult(null); setCopied(false); }}
              className="mt-5 w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
