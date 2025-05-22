// src/components/ui/Button.jsx
import React from "react";

const Button = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded transition-all hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;