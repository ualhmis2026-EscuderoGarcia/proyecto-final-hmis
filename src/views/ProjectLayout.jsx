import React, { useState, useEffect } from 'react';
import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, CheckSquare, History, Settings, ArrowLeft, ExternalLink, Map, Key, LogOut } from 'lucide-react';
import ProjectTasksView from './ProjectTasksView';
import ProjectHistoryView from './ProjectHistoryView';
import ProjectDashboardView from './ProjectDashboardView';
import ProjectSettingsView from './ProjectSettingsView';
import ProjectStructureView from './ProjectStructureView';
import ProjectCredentialsView from './ProjectCredentialsView';

const BaseView = ({ title }) => (
  <div className="animate-in fade-in zoom-in-95 duration-300">
    <h1 className="text-3xl font-black mb-6 text-gray-900 dark:text-white">{title}</h1>
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
      <p className="text-gray-500 dark:text-gray-400">Esta sección se implementará en los próximos pasos.</p>
    </div>
  </div>
);

const ProjectLayout = () => {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error al cerrar sesión:', err.message);
    }
  };


  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('proyectos')
        .select('nombre_cliente, url_web')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProject(data);
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const tabs = [
    { path: '', name: 'Dashboard Principal', icon: LayoutDashboard },
    { path: 'tareas', name: 'Tareas', icon: CheckSquare },
    { path: 'historial', name: 'Historial de Tareas', icon: History },
    { path: 'estructura', name: 'Estructura', icon: Map },
    { path: 'accesos', name: 'Accesos', icon: Key },
    { path: 'configuracion', name: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0c111d] transition-colors duration-300">
      {/* Menú Lateral Interno */}
      <aside className="w-72 bg-white dark:bg-[#161b27] border-r border-gray-200 dark:border-white/5 flex flex-col p-5 shadow-xl dark:shadow-2xl z-10 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 text-sm font-bold transition-colors mt-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Proyectos
        </Link>

        <div className="mb-8 px-2">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-extrabold mb-2">Proyecto</p>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">
            {loading ? 'Cargando...' : project?.nombre_cliente || 'Desconocido'}
          </h2>
          {project?.url_web && (
            <a
              href={project.url_web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={13} />
              Ver Web
            </a>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map((tab) => {
            const basePath = `/proyecto/${id}`;
            const currentPath = location.pathname;
            const targetPath = tab.path ? `${basePath}/${tab.path}` : basePath;
            // Para el dashboard (''), comprobamos exact match. Para los demás, startswith.
            const isActive = tab.path === '' ? currentPath === basePath : currentPath.startsWith(targetPath);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                to={targetPath}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                {tab.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group active:scale-[0.98]"
          >
            <LogOut size={20} className="text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform duration-150" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal Acoplado */}
      <main className="flex-1 p-10 min-h-screen overflow-y-auto w-full">
        <Routes>
          <Route index element={<ProjectDashboardView />} />
          <Route path="tareas" element={<ProjectTasksView />} />
          <Route path="historial" element={<ProjectHistoryView />} />
          <Route path="estructura" element={<ProjectStructureView />} />
          <Route path="accesos" element={<ProjectCredentialsView />} />
          <Route path="configuracion" element={<ProjectSettingsView />} />
        </Routes>
      </main>
    </div>
  );
};

export default ProjectLayout;
