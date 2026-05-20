import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

const ProjectTasksView = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [acciones, setAcciones] = useState('');
  const [prioridad, setPrioridad] = useState('media');

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('proyecto_id', id)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitulo(task.titulo || '');
      setDescripcion(task.descripcion || '');
      setAcciones(task.acciones || '');
      setPrioridad(task.prioridad || 'media');
    } else {
      setEditingTask(null);
      setTitulo('');
      setDescripcion('');
      setAcciones('');
      setPrioridad('media');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const taskData = {
      proyecto_id: id,
      titulo,
      descripcion,
      acciones,
      prioridad,
      estado: 'pendiente'
    };

    if (editingTask) {
      const { error } = await supabase
        .from('tareas')
        .update(taskData)
        .eq('id', editingTask.id);
      
      if (!error) {
        fetchTasks();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from('tareas')
        .insert([taskData]);
      
      if (!error) {
        fetchTasks();
        closeModal();
      }
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
      const { error } = await supabase.from('tareas').delete().eq('id', taskId);
      if (!error) fetchTasks();
    }
  };

  const handleComplete = async (taskId) => {
    const { error } = await supabase
      .from('tareas')
      .update({ estado: 'completada' })
      .eq('id', taskId);
    
    if (!error) fetchTasks();
  };

  const getPriorityConfig = (pri) => {
    switch (pri) {
      case 'alta': return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900/50', label: 'Alta Prioridad', icon: AlertCircle };
      case 'media': return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/50', label: 'Media Prioridad', icon: Clock };
      case 'baja': return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', label: 'Baja Prioridad', icon: CheckCircle };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Normal', icon: Clock };
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Tareas Activas</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestiona y completa las tareas pendientes de este proyecto.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow"
        >
          <Plus size={18} /> Añadir Tarea
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
          <CheckSquare size={48} className="mx-auto text-gray-300 dark:text-white/10 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay tareas pendientes</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">Todas las tareas están completadas o no has creado ninguna todavía.</p>
          <button onClick={() => openModal()} className="text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors">
            Crear primera tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map(task => {
            const priority = getPriorityConfig(task.prioridad);
            const PriorityIcon = priority.icon;
            
            return (
              <div key={task.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${priority.bg.split(' ')[0]}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${priority.bg} ${priority.color} ${priority.border}`}>
                    <PriorityIcon size={12} /> {priority.label}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-2">{task.titulo}</h3>
                
                {task.descripcion && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{task.descripcion}</p>
                )}
                
                {task.acciones && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-4 flex-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pasos de acción:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line text-xs font-medium">{task.acciones}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-white/5">
                  <div className="flex gap-2 text-gray-400">
                    <button onClick={() => openModal(task)} className="p-1.5 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleComplete(task.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle size={16} /> Completar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Título</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  placeholder="Ej. Rediseñar cabecera"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  placeholder="Pequeño resumen..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Acciones a realizar</label>
                <textarea 
                  rows="3"
                  value={acciones}
                  onChange={e => setAcciones(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white resize-none"
                  placeholder="- Paso 1...&#10;- Paso 2..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
                <select 
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Se importa globalmente los íconos CheckSquare
import { CheckSquare } from 'lucide-react';

export default ProjectTasksView;
