import React from "react";

const Button = ({
  type = "button",
  btnName,
  icon: Icon,
  className,
  children,
  loading,
  ...props
}) => {
  return (
    <button
      type={type}
      //w-full removed
      className={`flex justify-center  rounded-md  font-medium   ${className}`}
      {...props}
    >
      <span className="flex gap-1.5 items-center">
        {Icon && <Icon size={20} />}
        {btnName || children}
      </span>
    </button>
  );
};

export default Button;
