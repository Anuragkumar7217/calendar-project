import React from "react";

const ProgressBar = ({ progress, color }) => (
  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
    <div className={`bg-${color}-500 h-2 rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
  </div>
);

export default ProgressBar;
