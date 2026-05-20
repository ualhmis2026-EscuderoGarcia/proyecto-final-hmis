import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

const ProjectHistoryView = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('proyecto_id', id)
        .eq('estado', 'completada')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTasks(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [id]);

  const getPriorityConfig = (pri) => {
    switch (pri) {
      case 'alta': return { color: 'text-red-500', icon: AlertCircle, label: 'Alta' };
      case 'media': return { color: 'text-amber-500', icon: Clock, label: 'Media' };
      case 'baja': return { color: 'text-emerald-500', icon: CheckCircle2, label: 'Baja' };
      default: return { color: 'text-gray-400', icon: Clock, label: 'Normal' };
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Historial de Tareas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Registro cronológico de todas las tareas ya finalizadas.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
          <History size={48} className="mx-auto text-gray-300 dark:text-white/10 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no hay historial</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">No has completado ninguna tarea en este proyecto todavía.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {tasks.map(task => {
              const priority = getPriorityConfig(task.prioridad);
              const PriorityIcon = priority.icon;
              
              const dateObj = new Date(task.created_at);
              const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <li key={task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-full shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-through opacity-80 decoration-2 decoration-gray-300 dark:decoration-gray-600">
                        {task.titulo}
                      </h3>
                      {task.descripcion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.descripcion}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:ml-auto ml-12 text-sm font-medium shrink-0">
                    <div className={`flex items-center gap-1.5 ${priority.color}`}>
                      <PriorityIcon size={14} />
                      {priority.label}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-right">
                      {formattedDate}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectHistoryView;
