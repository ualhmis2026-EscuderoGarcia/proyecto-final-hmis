import React from 'react';

const ToggleSwitch = ({ id, label, description, checked, onChange, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5">{label}</h4>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 m-0">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(id, e.target.checked)} 
        />
        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
