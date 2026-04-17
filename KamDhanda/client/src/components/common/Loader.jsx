import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative w-20 h-20">
        {/* Outer ring (indigo) */}
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Inner ring (lighter indigo) */}
        <div className="absolute inset-4 border-4 border-indigo-200 border-b-transparent rounded-full animate-spin animation-delay-200"></div>

        {/* Center dot (indigo) */}
        <div className="absolute inset-6 bg-indigo-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default Loader;
