import React, { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProjectCard from '../components/ProjectCard';
import KanbanView from './KanbanView';
import OperationsSummary from '../components/OperationsSummary';

const ProjectListView = ({ viewType, onEdit }) => {
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Only dashboard has the Kanban toggle
  const [displayMode, setDisplayMode] = useState('list'); // 'list' | 'kanban'

  const statusMap = {
    'dashboard': 'activo',
    'history': 'completado',
    'trash': 'descartado'
  };

  const titleMap = {
    'dashboard': { title: 'Proyectos Activos', subtitle: 'Gestiona tus proyectos en curso.' },
    'history': { title: 'Historial', subtitle: 'Proyectos que ya han sido completados.' },
    'trash': { title: 'Papelera', subtitle: 'Proyectos descartados. Se pueden restaurar o eliminar definitivamente.' }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    const estado = statusMap[viewType] || 'activo';
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching from Supabase:', error);
    } else {
      setProjectsList(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    // Reset to list view when switching tabs
    if (viewType !== 'dashboard') setDisplayMode('list');
  }, [viewType]);

  const { title, subtitle } = titleMap[viewType] || titleMap['dashboard'];

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{subtitle}</p>
        </div>

        {/* View toggle — only visible on Dashboard */}
        {viewType === 'dashboard' && (
          <div className="flex items-center bg-gray-100 dark:bg-white/[0.04] p-1 rounded-lg gap-0.5 border border-gray-200 dark:border-white/[0.06]">
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                displayMode === 'list'
                  ? 'bg-white dark:bg-[#161b27] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <List size={14} />
              Lista
            </button>
            <button
              onClick={() => setDisplayMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                displayMode === 'kanban'
                  ? 'bg-white dark:bg-[#161b27] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
          </div>
        )}
      </div>

      {/* Operations Summary (Dashboard Only) */}
      {viewType === 'dashboard' && <OperationsSummary />}

      {/* Kanban view (dashboard only) */}
      {viewType === 'dashboard' && displayMode === 'kanban' ? (
        <KanbanView />
      ) : (
        // List / Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/[0.06] rounded-2xl animate-pulse" />
            ))
          ) : projectsList.map(proj => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              fetchProjects={fetchProjects}
              onEdit={onEdit}
            />
          ))}
          {!isLoading && projectsList.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No hay proyectos en esta sección todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectListView;
