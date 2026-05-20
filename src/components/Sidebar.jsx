import React from 'react';
import { LayoutDashboard, History, Trash2, PlusCircle, BarChart3, Settings2, Sun, Moon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ currentView, setCurrentView, theme, toggleTheme }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'trash', label: 'Papelera', icon: Trash2 },
  ];

  const studioName = (() => {
    try {
      return JSON.parse(localStorage.getItem('crm_business'))?.studioName || 'Syncro CRM';
    } catch { return 'Syncro CRM'; }
  })();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error al cerrar sesión:', err.message);
    }
  };

  return (
    <aside className="w-60 bg-white dark:bg-[#0e1520] border-r border-gray-100 dark:border-white/[0.05] flex flex-col h-screen fixed left-0 top-0 transition-colors duration-300">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white rounded-sm opacity-90" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate">{studioName}</span>
        </div>
        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-500 uppercase tracking-[0.1em] pl-9">CRM</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 pb-2 pt-1">Navegación</p>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm group ${currentView === item.id
              ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
          >
            <item.icon
              size={17}
              className={`shrink-0 transition-colors ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
            />
            {item.label}
            {currentView === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}

        <div className="pt-4">
          <p className="section-label px-3 pb-2">Sistema</p>
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm group ${currentView === 'settings'
              ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
          >
            <Settings2
              size={17}
              className={`shrink-0 transition-colors ${currentView === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
            />
            Configuración
            {currentView === 'settings' && (
              <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-white/[0.05] space-y-2">
        <button
          onClick={() => setCurrentView('form')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 shadow-sm shadow-blue-600/20 active:scale-[0.98]"
        >
          <PlusCircle size={17} />
          Nuevo proyecto
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all text-sm font-medium group"
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark'
              ? <Sun size={16} className="text-amber-500" />
              : <Moon size={16} className="text-gray-500" />
            }
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </span>
          <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <div className={`w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${theme === 'dark' ? 'translate-x-3' : 'translate-x-0'}`}   />
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-semibold group active:scale-[0.98]"
        >
          <LogOut size={16} className="text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform duration-150" />
          Cerrar sesión
        </button>

        {/* Version badge */}
        <div className="px-1 pt-1">
          <p className="text-[10px] text-gray-300 dark:text-gray-600 font-medium text-center">v1.2.0 — CRM System</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
