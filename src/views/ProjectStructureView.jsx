import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Map, FileText, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const buildTree = (data, parentId = null) => {
  return data
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map(item => ({
      ...item,
      children: buildTree(data, item.id)
    }));
};

const TreeNode = ({ node, level, onAddChild, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`flex flex-col mt-3 ${level > 0 ? 'ml-8' : ''}`}>
      <div 
        className="group relative flex items-center bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
           {hasChildren ? (
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 transition-colors"
             >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
             </button>
           ) : (
             <div className="w-5 flex justify-center text-gray-400">
               <FileText size={16} />
             </div>
           )}
           <span className="font-bold text-gray-900 dark:text-white truncate">
             {node.nombre}
           </span>
        </div>

        {/* Actions - visible on hover */}
        <div className={`flex items-center gap-1.5 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => onAddChild(node.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Añadir Subpágina"
          >
            <Plus size={14} /> Subpágina
          </button>
          <button 
            onClick={() => onEdit(node)}
            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onDelete(node.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Borrar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Render children */}
      {isExpanded && hasChildren && (
        <div className="relative border-l-2 border-gray-200 dark:border-white/10 ml-[23px] pl-2 mt-1">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectStructureView = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: estData, error } = await supabase
      .from('estructura_web')
      .select('*')
      .eq('proyecto_id', id);
    
    if (error) {
      console.error('Error fetching structure:', error);
    } else {
      setData(estData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddRoot = async () => {
    const name = window.prompt('Nombre de la página principal:');
    if (!name?.trim()) return;

    const { error } = await supabase
      .from('estructura_web')
      .insert({ proyecto_id: id, nombre: name.trim(), parent_id: null, orden: data.length });
    
    if (!error) fetchData();
  };

  const handleAddChild = async (parentId) => {
    const name = window.prompt('Nombre de la subpágina:');
    if (!name?.trim()) return;

    const siblings = data.filter(d => d.parent_id === parentId);

    const { error } = await supabase
      .from('estructura_web')
      .insert({ proyecto_id: id, nombre: name.trim(), parent_id: parentId, orden: siblings.length });
    
    if (!error) fetchData();
  };

  const handleEdit = async (node) => {
    const newName = window.prompt('Nuevo nombre:', node.nombre);
    if (!newName?.trim() || newName === node.nombre) return;

    const { error } = await supabase
      .from('estructura_web')
      .update({ nombre: newName.trim() })
      .eq('id', node.id);

    if (!error) fetchData();
  };

  const handleDelete = async (nodeId) => {
    if (!window.confirm('¿Seguro que quieres borrar esta página? (Se borrarán también las subpáginas)')) return;

    const { error } = await supabase
      .from('estructura_web')
      .delete()
      .eq('id', nodeId);

    if (!error) fetchData();
  };

  const tree = buildTree(data);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Map size={28} className="text-blue-600 dark:text-blue-400" />
            Mapa del Sitio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Estructura de páginas y navegación del proyecto.</p>
        </div>
        <button
          onClick={handleAddRoot}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Añadir Página Principal
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
            <Map size={48} className="mb-4 opacity-50" />
            <p className="font-medium">No hay ninguna página creada.</p>
            <button 
              onClick={handleAddRoot}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Crea la primera página
            </button>
          </div>
        ) : (
          <div className="pl-2">
            {tree.map(node => (
              <TreeNode 
                key={node.id} 
                node={node} 
                level={0} 
                onAddChild={handleAddChild}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectStructureView;
