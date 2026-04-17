import React from "react";

const UnauthorizedRoute = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedRoute;
