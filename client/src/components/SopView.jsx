import React, { useState } from 'react';

const SopView = ({ onAccept }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsAccepted(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAccepted) {
      try {
        const response = await fetch('/api/sop/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          if (onAccept) onAccept();
        } else {
          console.error('Failed to accept SOP');
        }
      } catch (error) {
        console.error('Error accepting SOP:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2">
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm max-w-xl w-full">
        <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Terms and Conditions (SOP)</h2>
        
        <div className="h-48 overflow-y-auto mb-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-800">
          <h3 className="font-bold text-sm mb-1">Standard Operating Procedure</h3>
          <p className="mb-2">
            Welcome to our platform. By continuing to use this system, you agree to comply with our Standard Operating Procedures (SOP).
          </p>
          <ul className="list-disc pl-4 mb-2 space-y-1">
            <li>You must maintain the confidentiality of all company data.</li>
            <li>Use of this system is restricted to authorized personnel only.</li>
            <li>Any misuse of the platform will result in immediate termination of access.</li>
            <li>All activities on this system are logged and monitored.</li>
          </ul>
          <p>
            Please read these terms carefully. By clicking "I Accept" below, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="flex items-start gap-2 cursor-pointer bg-gray-50 p-2 border border-gray-200 rounded">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={handleCheckboxChange}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-400 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-gray-800 text-xs font-medium">
              I have read and agree to the Terms and Conditions (SOP) and consent to have my acceptance recorded and emailed.
            </span>
          </label>

          <button
            type="submit"
            disabled={!isAccepted}
            className={`mt-2 py-1.5 px-3 text-sm rounded font-bold transition-colors ${
              isAccepted 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Accept and Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default SopView;
