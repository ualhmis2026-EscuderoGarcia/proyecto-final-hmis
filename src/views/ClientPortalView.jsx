import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CloudUpload, CheckCircle2, Image as ImageIcon, FileText, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Mapa etapa_kanban / estado -> progreso visual ─────────
const getProgress = (proyecto) => {
  if (proyecto.estado === 'completado') {
    return {
      pct: 100,
      fase: '¡Tu web está lista y publicada! 🚀',
      color: '#22c55e',
      trackColor: '#dcfce7',
      badge: 'bg-green-100 text-green-700',
      badgeLabel: 'Completado',
    };
  }
  const map = {
    pendiente: {
      pct: 25,
      fase: 'Fase 1: Esperando tu material (Textos / Fotos)',
      color: '#f59e0b',
      trackColor: '#fef3c7',
      badge: 'bg-yellow-100 text-yellow-700',
      badgeLabel: 'Pendiente de material',
    },
    desarrollo: {
      pct: 60,
      fase: 'Fase 2: Estamos programando tu web 👨‍💻',
      color: '#3b82f6',
      trackColor: '#dbeafe',
      badge: 'bg-blue-100 text-blue-700',
      badgeLabel: 'En desarrollo',
    },
    revision: {
      pct: 90,
      fase: 'Fase 3: Últimos retoques y revisión 🔍',
      color: '#8b5cf6',
      trackColor: '#ede9fe',
      badge: 'bg-purple-100 text-purple-700',
      badgeLabel: 'En revisión',
    },
  };
  return map[proyecto.etapa_kanban] || map['pendiente'];
};

// ── Upload Zone Component (Staged) ───────────────────────
const UploadZone = ({ title, icon: Icon, onAdd, disabled }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) fileInputRef.current.click();
  };

  const handleChange = (e) => {
    if (e.target.files) {
      // Basic support for multiple in one go if they want, but prompt asked for 'adding more'
      Array.from(e.target.files).forEach(file => onAdd(file));
      e.target.value = ''; // Reset to allow same file again if deleted
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300 cursor-pointer group
        ${disabled ? 'bg-gray-100 dark:bg-slate-800/50 border-gray-200 dark:border-white/5 cursor-not-allowed opacity-60' : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-500/10 hover:-translate-y-1'}`}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleChange}
        multiple
        accept={title.toLowerCase() === 'logo' ? 'image/*' : 'image/*,application/pdf'} 
      />
      
      <div className="flex flex-col items-center">
        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${disabled ? 'bg-gray-200 dark:bg-slate-700' : 'bg-white dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 shadow-md border border-gray-100 dark:border-white/5'}`}>
          <Icon size={28} className={disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'} />
        </div>
        
        <h4 className="font-black text-sm mb-1 text-gray-900 dark:text-white uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Arrastra aquí o haz clic</p>
      </div>
    </div>
  );
};

// ── Circular Progress SVG ─────────────────────────────────
const CircularProgress = ({ pct, color, trackColor }) => {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        {/* Track */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      {/* Percentage label */}
      <span
        className="absolute text-3xl font-extrabold"
        style={{ color }}
      >
        {pct}%
      </span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────
const ClientPortalView = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // States for Inverted Onboarding (Cola de subida)
  const [stagingFiles, setStagingFiles] = useState([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProyecto(data);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [id]);

  const handleAddToStaging = (type, file) => {
    setStagingFiles(prev => [...prev, { file, type, id: Math.random().toString(36).substr(2, 9) }]);
    setBatchSuccess(false);
  };

  const handleRemoveFile = (uid) => {
    setStagingFiles(prev => prev.filter(f => f.id !== uid));
  };

  const handleConfirmAndSend = async () => {
    if (stagingFiles.length === 0) return;
    
    setIsBatchUploading(true);
    setUploadProgress(10);

    try {
      // Send each file
      const uploadPromises = stagingFiles.map(async (staged, index) => {
        const formData = new FormData();
        formData.append('file', staged.file);
        formData.append('type', staged.type);
        formData.append('client_name', proyecto.nombre_cliente);
        formData.append('project_id', proyecto.id);
        formData.append('folder_id_drive', proyecto.folder_id_drive || '');

        const response = await fetch('https://hook.eu1.make.com/2i39mu81pnbhzk97uvikqheegjy3b3st', {
          method: 'POST',
          body: formData,
        });

        // Simple progress increment
        setUploadProgress(prev => Math.min(prev + (90 / stagingFiles.length), 95));

        return response.ok;
      });

      const results = await Promise.all(uploadPromises);
      
      if (results.every(res => res)) {
        // Success celebration
        setUploadProgress(100);
        setBatchSuccess(true);
        setStagingFiles([]);
        
        // Update stage in Supabase
        if (proyecto.etapa_kanban === 'pendiente') {
          await supabase
            .from('proyectos')
            .update({ etapa_kanban: 'desarrollo' })
            .eq('id', id);
          
          setProyecto(prev => ({ ...prev, etapa_kanban: 'desarrollo' }));
        }
      } else {
        alert('Algunos archivos no se pudieron subir. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Batch upload error:', error);
      alert('Error de conexión al subir los archivos.');
    } finally {
      setIsBatchUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase text-sm">Cargando tu proyecto...</p>
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-3">Proyecto no encontrado</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Este enlace no corresponde a ningún proyecto activo. 
            Por favor, contacta con tu agencia para obtener el enlace correcto.
          </p>
        </div>
      </div>
    );
  }

  const progress = getProgress(proyecto);
  const fechaEntrega = proyecto.fecha_estimada
    ? new Date(proyecto.fecha_estimada).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Por definir';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/40 dark:from-[#0B1120] dark:to-[#111827] flex items-start justify-center p-6 pt-16">
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            Portal del Cliente
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Hola, {proyecto.nombre_cliente.split(' ')[0]} <span className="animate-pulse inline-block">👋</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Aquí puedes ver el estado actualizado de tu proyecto en tiempo real.</p>
        </div>

        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-blue-900/5 border border-gray-100 dark:border-white/10 p-8 pt-10 mb-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
          <div className="flex flex-col items-center text-center z-10 relative">
            <CircularProgress pct={progress.pct} color={progress.color} trackColor={progress.trackColor} />
            
            <span className={`mt-8 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm ${progress.badge} dark:bg-opacity-20`}>
              {progress.badgeLabel}
            </span>

            <h2 className="mt-5 text-2xl font-black text-gray-900 dark:text-white px-4 leading-snug tracking-tight">
              {progress.fase}
            </h2>

            {/* Progress Steps */}
            <div className="w-full mt-10 flex justify-between items-center relative">
              <div className="absolute left-0 right-0 top-3.5 h-1 bg-gray-200 dark:bg-slate-700 rounded-full">
                <div
                  className="h-full transition-all duration-1000 rounded-full shadow-lg shadow-current"
                  style={{ width: `${progress.pct}%`, backgroundColor: progress.color }}
                />
              </div>
              {[
                { label: 'Material', active: progress.pct >= 25 },
                { label: 'Desarrollo', active: progress.pct >= 60 },
                { label: 'Revisión', active: progress.pct >= 90 },
                { label: '¡Publicado!', active: progress.pct >= 100 },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-xs font-black transition-all duration-500 shadow-sm ${
                      step.active
                        ? 'text-white border-transparent'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500'
                    }`}
                    style={step.active ? { backgroundColor: progress.color, borderColor: progress.color, boxShadow: `0 4px 14px 0 ${progress.color}60` } : {}}
                  >
                    {step.active ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-2.5 font-bold uppercase tracking-widest ${step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Details Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg dark:shadow-blue-900/5 p-7 mb-6 backdrop-blur-sm">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">Detalles del Proyecto</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100 dark:border-white/10">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tipo de web</span>
              <span className="font-bold text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">{proyecto.tipo_proyecto}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100 dark:border-white/10">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Inversión</span>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-xl">{proyecto.precio_total}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Entrega estimada</span>
              <span className="font-bold text-gray-900 dark:text-white text-sm text-right max-w-[200px]">{fechaEntrega}</span>
            </div>
          </div>
        </div>

        {/* Inverted Onboarding: Upload Material Section */}
        {proyecto.estado === 'activo' && proyecto.etapa_kanban === 'pendiente' && (
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-blue-500/20 shadow-xl dark:shadow-blue-900/10 overflow-hidden mb-6 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 px-7 flex items-center gap-4">
              <CloudUpload className="text-blue-100" size={28} />
              <h3 className="text-white font-black text-lg tracking-tight">Material del Proyecto</h3>
            </div>
            <div className="p-7">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-7 font-medium leading-relaxed">
                Ayúdanos a empezar cuanto antes subiendo tu logo y fotos del negocio. 
                Se guardarán de forma segura en tu carpeta asignada.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <UploadZone 
                  title="Logo de tu marca" 
                  icon={ImageIcon} 
                  onAdd={(file) => handleAddToStaging('logo', file)}
                  disabled={isBatchUploading || batchSuccess}
                />
                <UploadZone 
                  title="Imágenes o PDF" 
                  icon={FileText} 
                  onAdd={(file) => handleAddToStaging('photos', file)}
                  disabled={isBatchUploading || batchSuccess}
                />
              </div>

              {/* Preview List */}
              {stagingFiles.length > 0 && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Archivos en espera ({stagingFiles.length})</h4>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden shadow-inner">
                    {stagingFiles.map((staged) => (
                      <div key={staged.id} className="flex items-center justify-between p-4 group hover:bg-white dark:hover:bg-slate-800 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                            {staged.type === 'logo' ? <ImageIcon size={20} className="text-blue-500" /> : <FileText size={20} className="text-purple-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-[220px]">{staged.file.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{staged.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveFile(staged.id)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleConfirmAndSend}
                    disabled={isBatchUploading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isBatchUploading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Enviando... {Math.round(uploadProgress)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send size={18} />
                        <span>Confirmar y Enviar</span>
                      </div>
                    )}
                  </button>
                  
                  {isBatchUploading && (
                    <div className="w-full mt-3 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {batchSuccess && (
                <div className="mt-8 p-6 bg-green-50/50 dark:bg-emerald-500/10 rounded-3xl border border-green-100 dark:border-emerald-500/20 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-500">
                  <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 dark:from-emerald-500 dark:to-emerald-700 rounded-full shadow-lg shadow-green-500/30 text-white">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-green-900 dark:text-emerald-400 font-black text-xl mb-1">¡Material recibido!</h4>
                    <p className="text-sm text-green-800 dark:text-emerald-500/80 font-bold opacity-80">
                      Nos ponemos a trabajar de inmediato.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 pb-10 flex items-center justify-center gap-2">
          Ante cualquier duda, contáctanos por WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default ClientPortalView;
