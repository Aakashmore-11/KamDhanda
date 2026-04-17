import React, { forwardRef, useState } from "react";
import { Eye, EyeClosed } from "lucide-react"; // You can use any icon lib you prefer

const Input = forwardRef(
  ({ label, className, icon: Icon, type = "text", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type == "password";

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-1 ml-1">
            {label}
          </label>
        )}

        <div className=" relative  flex items-center border border-gray-300 rounded-md ">
          {Icon && (
            <div className="px-2.5 flex items-center pointer-events-none border-r  border-gray-300">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            type={isPassword ? (!showPassword ? "password" : "text") : type}
            className={`py-2.5 pl-2 pr-10 grow outline-none ${className}`}
            {...props}
            autoComplete="off"
            ref={ref}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1} // prevents focus loss
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeClosed className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        <p className="text-red-500 text-sm ">{error}</p>
      </div>
    );
  }
);

export default Input;
