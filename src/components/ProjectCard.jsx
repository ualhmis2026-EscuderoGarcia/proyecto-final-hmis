import React, { useState } from 'react';
import { Calendar, Globe, Trash2, CheckCircle, RefreshCw, PenSquare, Trash, Link as LinkIcon, AlertTriangle, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { calculateDaysPassed } from '../lib/dateUtils';

const ProjectCard = ({ proj, fetchProjects, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const daysOpen = calculateDaysPassed(proj.created_at);
  const isStagnant = proj.estado === 'activo' && daysOpen > 30;

  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from('proyectos')
      .update({ estado: newStatus })
      .eq('id', proj.id);
    
    if (!error) {
      if (newStatus === 'completado') {
        confetti({ particleCount: 120, spread: 65, origin: { y: 0.6 }, zIndex: 9999 });
      }
      fetchProjects();
    }
  };

  const confirmDeleteProject = async () => {
    const { error } = await supabase.from('proyectos').delete().eq('id', proj.id);
    if (!error) {
      setShowDeleteModal(false);
      fetchProjects();
    }
  };

  const copyClientLink = () => {
    const url = `${window.location.origin}/portal/${proj.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const createdDate = new Date(proj.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  const deliveryDate = proj.fecha_estimada
    ? new Date(proj.fecha_estimada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className={`card group relative flex flex-col transition-all duration-200 hover:shadow-md ${
      isStagnant
        ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10'
        : 'hover:-translate-y-0.5'
    }`}>
      {/* Copy toast */}
      {copied && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-50">
          Enlace copiado
        </div>
      )}

      {/* Stagnant alert banner */}
      {isStagnant && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/40 rounded-t-2xl">
          <AlertTriangle size={13} className="text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-xs font-semibold text-red-700 dark:text-red-400">
            Sin actividad — {daysOpen} días abierto
          </span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
              {proj.nombre_cliente}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium truncate">
              {proj.tipo_proyecto}
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} className="shrink-0" />
            <span>Creado el {createdDate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={12} className="shrink-0" />
            <span>Entrega estimada: {deliveryDate}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.05]">
          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {proj.estado === 'activo' && (
              <>
                <button
                  onClick={() => updateStatus('completado')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  title="Marcar como completado"
                >
                  <CheckCircle size={15} />
                </button>
                <button
                  onClick={() => updateStatus('descartado')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Descartar"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            {proj.estado === 'completado' && (
              <>
                <button
                  onClick={() => updateStatus('activo')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  title="Reabrir"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                  title="Eliminar definitivamente"
                >
                  <Trash size={15} />
                </button>
              </>
            )}
            {proj.estado === 'descartado' && (
              <>
                <button
                  onClick={() => updateStatus('activo')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                  title="Restaurar"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                  title="Eliminar definitivamente"
                >
                  <Trash size={15} />
                </button>
              </>
            )}
          </div>

          {/* Client portal link */}
          <button
            onClick={copyClientLink}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-auto"
          >
            <Globe size={13} />
            Portal del cliente
          </button>
        </div>
        
        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-1">
          {/* Ver Web — only when url_web exists */}
          {proj.url_web && (
            <a
              href={proj.url_web}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <ExternalLink size={15} />
              Ver Web
            </a>
          )}
          {/* Acceder Button */}
          <Link 
            to={`/proyecto/${proj.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            Acceder al Proyecto
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-[#161b27] rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">¿Estás seguro?</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">
              Esta acción eliminará el proyecto y todos sus datos de forma permanente de la base de datos y no se puede deshacer.
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(false); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmDeleteProject(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Eliminar para siempre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
