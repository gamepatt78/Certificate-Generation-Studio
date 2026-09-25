import React, { useState } from 'react';

const SopLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sop/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        // TODO: Handle successful login (e.g., redirect, store token)
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm w-full max-w-sm">
        <h2 className="text-lg font-bold mb-3 border-b pb-1 text-gray-800">User Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-1.5 px-3 text-sm rounded hover:bg-blue-700 focus:outline-none mt-2"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SopLogin;
