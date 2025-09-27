import React, { useState } from "react";

interface CollapsibleBoxProps {
  title: string;
  children: React.ReactNode;
}

export const CollapsibleBox: React.FC<CollapsibleBoxProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-300 rounded-lg shadow bg-white max-w-md mx-auto px-1.5 " style={{ opacity: 0.6 }}>
      <button
        className="w-full flex justify-between items-center px-4 py-0.5 font-semibold text-slate-700 bg-slate-50 rounded-t-lg focus:outline-none "
        
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <span className={`transform transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-slate-200 text-slate-600">
          {children}
        </div>
      )}
    </div>
  );
};
