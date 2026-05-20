import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EditModal = ({ project, onClose, fetchProjects }) => {
  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState(0);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setClientName(project.nombre_cliente);
      setPrice(project.precio_total);
      setEstimatedDate(project.fecha_estimada);
    }
  }, [project]);

  if (!project) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from('proyectos')
      .update({
        nombre_cliente: clientName,
        precio_total: price,
        fecha_estimada: estimatedDate
      })
      .eq('id', project.id);
      
    setIsLoading(false);
    if (!error) {
      fetchProjects();
      onClose();
    } else {
      alert("Error al actualizar el proyecto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl dark:shadow-blue-900/10 border border-gray-100 dark:border-white/10 transform transition-all animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-xl">✍️</span>
            Editar Proyecto
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre del Cliente</label>
            <input 
              type="text" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800/50 shadow-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Precio Total (€)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-black text-gray-900 dark:text-white bg-white dark:bg-slate-800/50 shadow-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Fecha Estimada de Entrega</label>
            <input 
              type="date" 
              value={estimatedDate} 
              onChange={e => setEstimatedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800/50 shadow-sm" 
              required
            />
          </div>
          
          <div className="pt-4 mt-6 border-t border-gray-100 dark:border-white/10 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-500/50 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-500/30">
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
