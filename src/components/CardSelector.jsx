import React from 'react';

const CardSelector = ({ id, title, description, icon: Icon, selected, onClick }) => {
  return (
    <div 
      className={`relative flex flex-col items-start gap-3 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm ${
        selected 
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md shadow-blue-500/20 scale-[1.02]' 
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1'
      }`} 
      onClick={() => onClick(id)}
    >
      <div className={`transition-colors p-3 rounded-xl ${selected ? 'text-blue-600 bg-blue-100 dark:bg-blue-600/20' : 'text-gray-500 bg-gray-50 dark:bg-slate-700/50 dark:text-gray-400'}`}>
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-lg font-bold m-0 text-gray-900 dark:text-white leading-tight">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 m-0 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default CardSelector;
