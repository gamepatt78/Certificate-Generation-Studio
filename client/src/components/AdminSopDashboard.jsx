import React, { useState } from 'react';

const AdminSopDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const response = await fetch('/api/sop/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('New hire added successfully! SOP email pending.');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setStatus('Failed to add new hire.');
      }
    } catch (error) {
      setStatus('Failed to add new hire.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded border border-gray-300 shadow-sm">
      <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Add New Hire (SOP)</h2>
      
      {status && (
        <div className={`mb-3 p-2 rounded text-center text-sm font-medium ${
          status.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="name">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:border-blue-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="password">
            Temporary Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">Provide a temporary password for their first login.</p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-1.5 px-3 text-sm rounded hover:bg-blue-700 focus:outline-none mt-2"
        >
          Add New Hire
        </button>
      </form>
    </div>
  );
};

export default AdminSopDashboard;
