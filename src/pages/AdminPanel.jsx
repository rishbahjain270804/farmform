import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    district: '',
    state: '',
    practice: '',
    dateFrom: '',
    dateTo: '',
    landSizeMin: '',
    landSizeMax: ''
  });
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalLandSize: 0,
    avgLandSize: 0,
    naturalCount: 0,
    organicCount: 0
  });
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        window.location.href = '/admin/login';
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadFarmers();
    }
  }, [filter, searchTerm, currentPage, advancedFilters, sortBy, sortOrder]);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const response = await api.getFarmers(currentPage, 10, filter, searchTerm, {
        ...advancedFilters,
        sortBy,
        sortOrder
      });
      setRegistrations(response.farmers);
      setTotalPages(response.totalPages);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading farmers:', error);
      alert('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations
    .filter(reg => {
      if (filter === 'all') return true;
      return reg.status === filter;
    })
    .filter(reg => {
      if (!searchTerm) return true;
      const searchFields = [
        reg.name,
        reg.phone,
        reg.village,
        reg.district,
        reg.presentCrop
      ].map(field => field?.toLowerCase());
      return searchFields.some(field => field?.includes(searchTerm.toLowerCase()));
    });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateFarmerStatus(id, newStatus);
      loadFarmers(); // Reload the list after update
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-green-800 mb-4 md:mb-0">
              Farmer Registrations Admin Panel
            </h1>
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-xl w-full md:w-64"
              />
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <a
                href={`${API_URL}/farmers/export?format=csv&token=${localStorage.getItem('token')}`}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"
                download
              >
                Export CSV
              </a>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-xl bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">District</label>
                <input
                  type="text"
                  value={advancedFilters.district}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full border rounded-xl p-2"
                  placeholder="Filter by district"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">State</label>
                <input
                  type="text"
                  value={advancedFilters.state}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border rounded-xl p-2"
                  placeholder="Filter by state"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">Practice</label>
                <select
                  value={advancedFilters.practice}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, practice: e.target.value }))}
                  className="w-full border rounded-xl p-2"
                >
                  <option value="">All Practices</option>
                  <option value="Natural">Natural</option>
                  <option value="Organic">Organic</option>
                  <option value="Conventional">Conventional</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">Date From</label>
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full border rounded-xl p-2"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">Date To</label>
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full border rounded-xl p-2"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">Land Size Range (acres)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={advancedFilters.landSizeMin}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, landSizeMin: e.target.value }))}
                    className="w-full border rounded-xl p-2"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={advancedFilters.landSizeMax}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, landSizeMax: e.target.value }))}
                    className="w-full border rounded-xl p-2"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">Total Land</div>
              <div className="text-xl font-semibold text-green-700">{stats.totalLandSize.toFixed(2)} acres</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">Average Farm Size</div>
              <div className="text-xl font-semibold text-blue-700">{stats.avgLandSize.toFixed(2)} acres</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">Natural Farming</div>
              <div className="text-xl font-semibold text-yellow-700">{stats.naturalCount} farmers</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">Organic Farming</div>
              <div className="text-xl font-semibold text-purple-700">{stats.organicCount} farmers</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.map((reg, idx) => (
                  <tr key={reg.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{reg.name}</div>
                      <div className="text-sm text-gray-500">{reg.registrationDate}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{reg.phone}</div>
                      <div className="text-sm text-gray-500">{reg.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{reg.village}</div>
                      <div className="text-sm text-gray-500">{reg.district}, {reg.state}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{reg.landSize} acres</div>
                      <div className="text-sm text-gray-500">{reg.presentCrop}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(reg.id, 'approved')}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(reg.id, 'rejected')}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No registrations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4 items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-4 text-gray-600">
              Loading...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

