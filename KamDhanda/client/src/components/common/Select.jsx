import React from "react";

const Select = ({
  label,
  options = [],
  defaultValue = "Select",
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800 ">
          {label}
        </label>
      )}
      <select
        className={`border border-gray-300  rounded-md px-3 py-2.5 bg-white  text-sm outline-none ${className}`}
        defaultValue=""
        {...props}
      >
        <option value="" disabled>
          --{defaultValue}--
        </option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p className="text-red-500 text-sm ">{error}</p>
    </div>
  );
};

export default Select;
