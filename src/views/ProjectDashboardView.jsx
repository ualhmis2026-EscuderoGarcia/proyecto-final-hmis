import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const ProjectDashboardView = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Fetch project details
      const { data: projData } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single();
      
      // Fetch all tasks for this project
      const { data: tasksData } = await supabase
        .from('tareas')
        .select('*')
        .eq('proyecto_id', id)
        .order('created_at', { ascending: false });

      if (projData) setProject(projData);
      if (tasksData) setTasks(tasksData);
      
      setLoading(false);
    };

    fetchDashboardData();
  }, [id]);

  // Calculations
  const completedTasks = tasks.filter(t => t.estado === 'completada').length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Widget 1: Tareas Prioritarias
  // Filtramos las 'Alta', si no hay suficientes cogemos las recientes hasta completar 3.
  const activeTasks = tasks.filter(t => t.estado === 'pendiente');
  const highPriority = activeTasks.filter(t => t.prioridad === 'alta');
  const topTasks = [...highPriority, ...activeTasks.filter(t => t.prioridad !== 'alta')].slice(0, 3);

  // Widget 2: Medidor de Tiempo
  let timePercent = 0;
  let daysLeft = 0;
  if (project?.created_at && project?.fecha_estimada) {
    const start = new Date(project.created_at).getTime();
    const end = new Date(project.fecha_estimada).getTime();
    const now = new Date().getTime();
    
    if (end > start) {
      const totalTime = end - start;
      const passedTime = now - start;
      timePercent = Math.round((passedTime / totalTime) * 100);
      timePercent = Math.min(Math.max(timePercent, 0), 100);
      daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    }
  }

  const pieData = [
    { name: 'Completadas', value: completedTasks },
    { name: 'Pendientes', value: pendingTasks }
  ];
  const COLORS = ['#10b981', '#f1f5f9']; // Emerald for complete, Gray for pending
  const DARK_COLORS = ['#10b981', '#1e293b']; 

  // Dark mode detector simple pass
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (loading) {
     return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
           <Activity size={28} className="text-blue-600 dark:text-blue-400" /> Dashboard Gerencial
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Resumen visual de progreso, tiempo y siguientes pasos urgentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICA DE PROGRESO DE TAREAS */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative">
          <div className="w-full text-left mb-2">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white pb-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> Avance del Proyecto
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">División tareas completadas sobre el total</p>
          </div>
          
          <div className="relative w-full h-64 mt-4">
            {totalTasks > 0 ? (
              <div className="w-full h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={isDarkMode ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400 font-medium bg-gray-50 dark:bg-slate-800/50 rounded-2xl w-full">
                  Sin tareas creadas todavía
               </div>
            )}
            
            {/* Center Label inside Donut */}
            {totalTasks > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{progressPercent}%</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Completado</span>
              </div>
            )}
          </div>
        </div>

        {/* WIDGET TAREAS PRIORITARIAS */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-blue-600/20 text-white flex flex-col relative overflow-hidden">
           {/* Decoración Fondo */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>

           <div className="w-full text-left mb-6 relative z-10">
             <h3 className="text-xl font-bold text-white pb-1 flex items-center gap-2">
                <AlertCircle size={20} /> Urgente Hoy
             </h3>
             <p className="text-sm text-blue-100 font-medium opacity-90">Tareas con máxima prioridad o recientes</p>
          </div>

          <div className="flex-1 space-y-3 relative z-10">
             {topTasks.length === 0 ? (
                <div className="bg-white/10 rounded-2xl p-6 text-center h-full flex items-center justify-center flex-col gap-2 border border-white/10">
                   <CheckCircle2 size={32} className="text-emerald-400 opacity-80" />
                   <p className="font-bold text-lg">Todo al día</p>
                   <p className="text-sm text-blue-100 opacity-80">No hay tareas pendientes en la cola.</p>
                </div>
             ) : (
                topTasks.map((t, idx) => (
                  <Link 
                    key={idx} 
                    to={`/proyecto/${id}/tareas`}
                    className="bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-2xl p-4 flex items-center justify-between group"
                  >
                     <div>
                       <h4 className="font-bold line-clamp-1">{t.titulo}</h4>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block ${t.prioridad === 'alta' ? 'bg-red-500/30 text-red-100 border border-red-400/30' : 'bg-white/10 text-blue-100'}`}>
                         Prioridad {t.prioridad}
                       </span>
                     </div>
                     <div className="shrink-0 group-hover:translate-x-1 transition-transform">
                        <ChevronRight size={18} className="opacity-70" />
                     </div>
                  </Link>
                ))
             )}
          </div>
        </div>

        {/* MEDIDOR DE TIEMPO (Colspan Full si hace falta o alineado) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-500" /> Tiempos del Proyecto
             </h3>
             <div className="text-right">
                <span className={`text-sm font-black px-3 py-1 rounded-lg ${daysLeft < 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : daysLeft < 5 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                   {daysLeft < 0 ? `Retraso de ${Math.abs(daysLeft)} días` : `${daysLeft} días restantes`}
                </span>
             </div>
           </div>

           {/* ProgressBar Style */}
           <div className="relative pt-1 max-w-4xl mx-auto w-full">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold inline-block py-1 px-3 uppercase rounded-full text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400">
                    Tiempo Consumido
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {timePercent}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-indigo-50 dark:bg-indigo-950/30">
                <div style={{ width: `${timePercent}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${timePercent > 90 ? 'bg-red-500' : timePercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              </div>
              
              {/* Fechas labels */}
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
                 <span>Inicio: {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'Aún no iniciado'}</span>
                 <span>Entrega: {project?.fecha_estimada ? new Date(project.fecha_estimada).toLocaleDateString() : 'Sin estimar'}</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDashboardView;
