import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

const OperationsSummary = () => {
  const [metrics, setMetrics] = useState({
    activos: 0,
    completados: 0,
    enRiesgo: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperationsData = async () => {
      setIsLoading(true);
      const { data: projects, error } = await supabase
        .from('proyectos')
        .select('estado, fecha_estimada');

      if (error) {
        console.error('Error fetching operations data:', error);
      } else {
        let activos = 0;
        let completados = 0;
        let enRiesgo = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        projects?.forEach(p => {
          if (p.estado === 'completado') {
            completados++;
          } else if (p.estado !== 'descartado') {
            activos++;
            
            if (p.fecha_estimada) {
              const estimateDate = new Date(p.fecha_estimada);
              if (estimateDate < today) {
                enRiesgo++;
              }
            }
          }
        });

        setMetrics({ activos, completados, enRiesgo });
      }
      setIsLoading(false);
    };

    fetchOperationsData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 mb-8 animate-pulse">
        <div className="h-32 bg-gray-50 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 mb-8 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
      
      {/* Title Section */}
      <div className="hidden lg:flex flex-col justify-center border-r border-gray-100 dark:border-white/5 pr-8 h-24 z-10 w-1/4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1.5 font-bold">
          <Activity size={16} />
          <span>Estado de Operaciones</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
          Métricas operativas del volumen de trabajo actual.
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full z-10">
        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
            <Briefcase size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-0.5">Proyectos Activos</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{metrics.activos}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-green-50/50 dark:bg-emerald-500/5 border border-green-100 dark:border-emerald-500/10 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/30">
            <CheckCircle size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-emerald-400 mb-0.5">Completados</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{metrics.completados}</h3>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 ${metrics.enRiesgo > 0 ? 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10' : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-white/5'}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${metrics.enRiesgo > 0 ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30' : 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/30'}`}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className={`text-sm font-bold mb-0.5 ${metrics.enRiesgo > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>En Riesgo</p>
            <h3 className={`text-3xl font-black leading-none ${metrics.enRiesgo > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{metrics.enRiesgo}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsSummary;
