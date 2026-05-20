import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';
import KanbanCard from '../components/KanbanCard';
import { supabase } from '../lib/supabase';

// ===========================================================
// WEBHOOK para notificar cuando un proyecto pasa a Desarrollo
// Cambia esta URL por la de tu Make / Discord webhook
// ===========================================================
const NOTIFICACION_WEBHOOK_URL = 'https://TU_WEBHOOK_URL_AQUI';

const notificarCambioEstado = async (proyecto) => {
  if (!NOTIFICACION_WEBHOOK_URL.startsWith('https://TU')) {
    try {
      await fetch(NOTIFICACION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'proyecto_en_desarrollo',
          cliente: proyecto.nombre_cliente,
          tipo: proyecto.tipo_proyecto,
          precio: proyecto.precio_total,
          mensaje: `🚀 El proyecto de "${proyecto.nombre_cliente}" ha entrado en desarrollo. ¡Material listo!`,
        }),
      });
      console.log('✅ Webhook de notificación disparado:', proyecto.nombre_cliente);
    } catch (err) {
      console.error('❌ Error disparando webhook de notificación:', err);
    }
  } else {
    console.log('ℹ️ Webhook de notificación no configurado. Setea NOTIFICACION_WEBHOOK_URL en KanbanView.jsx');
    console.log('📦 Proyecto que entró en desarrollo:', proyecto);
  }
};

// ── Columnas del tablero ──────────────────────────────────
const COLUMNAS = [
  {
    id: 'pendiente',
    titulo: '1. Pendiente de Material',
    emoji: '📋',
    colorHeader: 'bg-yellow-50 border-yellow-200',
    colorBadge: 'bg-yellow-100 text-yellow-700',
    colorDrop: 'bg-yellow-50/60',
  },
  {
    id: 'desarrollo',
    titulo: '2. En Desarrollo',
    emoji: '👨‍💻',
    colorHeader: 'bg-blue-50 border-blue-200',
    colorBadge: 'bg-blue-100 text-blue-700',
    colorDrop: 'bg-blue-50/60',
  },
  {
    id: 'revision',
    titulo: '3. En Revisión',
    emoji: '🔍',
    colorHeader: 'bg-purple-50 border-purple-200',
    colorBadge: 'bg-purple-100 text-purple-700',
    colorDrop: 'bg-purple-50/60',
  },
  {
    id: 'completado',
    titulo: '4. Completado',
    emoji: '✅',
    colorHeader: 'bg-green-50 border-green-200',
    colorBadge: 'bg-green-100 text-green-700',
    colorDrop: 'bg-green-50/60',
  },
];

const KanbanView = () => {
  const [columns, setColumns] = useState({ pendiente: [], desarrollo: [], revision: [], completado: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchKanbanProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('estado', 'activo')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando Kanban:', error);
    } else {
      const grouped = { pendiente: [], desarrollo: [], revision: [], completado: [] };
      (data || []).forEach(proj => {
        const col = proj.etapa_kanban || 'pendiente';
        if (grouped[col]) grouped[col].push(proj);
      });
      setColumns(grouped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchKanbanProjects();
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or same place
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    // Move card locally for instant UI feedback
    const sourceItems = Array.from(columns[sourceCol]);
    const destItems = sourceCol === destCol ? sourceItems : Array.from(columns[destCol]);
    const [movedProject] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedProject);

    setColumns(prev => ({
      ...prev,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    }));

    // Persist changes to Supabase
    const updates = { etapa_kanban: destCol };
    if (destCol === 'completado') {
      updates.estado = 'completado';
    }

    const { error } = await supabase
      .from('proyectos')
      .update(updates)
      .eq('id', draggableId);

    if (error) {
      console.error('Error actualizando etapa Kanban:', error);
      // Revert local state on failure
      fetchKanbanProjects();
    } else if (destCol === 'completado') {
      // Trigger celebration!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999
      });
      // Optionally remove from Kanban after a short delay since it's now 'completado'
      // and Kanban only shows 'activo'. But we already moved it in state.
      // Refreshing will remove it from 'activo'.
    }

    // Fire webhook notification when a card enters "desarrollo"
    if (destCol === 'desarrollo' && sourceCol !== 'desarrollo') {
      await notificarCambioEstado(movedProject);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 animate-pulse">
        {COLUMNAS.map(col => (
          <div key={col.id} className="flex-1 min-w-[280px] bg-gray-100 rounded-2xl h-64" />
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 px-1 animate-in slide-in-from-bottom-4 duration-500">
        {COLUMNAS.map(col => {
          const cards = columns[col.id] || [];
          return (
            <div key={col.id} className="flex-1 min-w-[300px] flex flex-col">
              {/* Column Header */}
              <div className={`border rounded-2xl px-5 py-4 mb-4 flex items-center justify-between shadow-sm dark:bg-slate-800/50 dark:border-white/10 backdrop-blur-sm ${col.colorHeader.replace('border-', 'border-').replace('bg-', 'bg-').split(' ')[0]} dark:!bg-transparent`}>
                <span className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="text-lg">{col.emoji}</span> {col.titulo}
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full shadow-inner dark:bg-white/10 dark:text-gray-300 ${col.colorBadge}`}>
                  {cards.length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[500px] rounded-3xl p-4 transition-all duration-300 border-2 border-dashed ${
                      snapshot.isDraggingOver
                        ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500 shadow-inner'
                        : `border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-slate-900/50 ${col.colorDrop}`
                    }`}
                  >
                    {cards.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center h-40 opacity-50">
                        <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">Sin proyectos aquí</p>
                      </div>
                    )}
                    {cards.map((proj, index) => (
                      <KanbanCard key={proj.id} proj={proj} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
