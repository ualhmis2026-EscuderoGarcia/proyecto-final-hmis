import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Layout, Flame } from 'lucide-react';
import { calculateDaysPassed } from '../lib/dateUtils';

const KanbanCard = ({ proj, index }) => {
  const daysOpen = calculateDaysPassed(proj.created_at);
  const isStagnant = daysOpen > 30;

  return (
    <Draggable draggableId={proj.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`border rounded-2xl p-5 mb-4 cursor-grab select-none transition-all duration-300 ${
            snapshot.isDragging
              ? 'shadow-2xl scale-105 rotate-2 border-blue-400 ring-4 ring-blue-500/20 bg-white dark:bg-slate-800 z-50'
              : isStagnant 
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-md hover:-translate-y-1' 
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1.5 w-full">
              <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight flex items-center gap-2">
                {proj.nombre_cliente}
                {isStagnant && <Flame size={16} className="text-red-500 animate-pulse drop-shadow-md" />}
              </h4>
              {isStagnant && (
                <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-md w-fit">
                  ¡Lleva {daysOpen} días estancado!
                </span>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-2 text-xs mb-2.5 font-medium ${isStagnant ? 'text-red-500 dark:text-red-400/70' : 'text-gray-500 dark:text-gray-400'}`}>
            <Layout size={14} className={snapshot.isDragging ? 'text-blue-500' : ''} />
            <span className="truncate">{proj.tipo_proyecto}</span>
          </div>

          <div className={`flex items-center gap-2 text-xs font-medium ${isStagnant ? 'text-red-500 dark:text-red-400/70' : 'text-gray-500 dark:text-gray-400'}`}>
            <Calendar size={14} className={snapshot.isDragging ? 'text-blue-500' : ''} />
            <span>Entrega: {new Date(proj.fecha_estimada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
