import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Clock, CheckCircle, Briefcase, Activity, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdvancedStatsView = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const { data: projects, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (!error && projects) {
        setData(projects);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  const stats = useMemo(() => {
    if (!data.length) return null;
    
    // Core stats
    const activeProjects = data.filter(d => d.estado === 'activo').length;
    const completedProjects = data.filter(d => d.estado === 'completado').length;
    const totalValid = activeProjects + completedProjects;
    
    // Tasa de Finalización
    const completionRate = totalValid > 0 ? Math.round((completedProjects / totalValid) * 100) : 0;

    // Duración Media
    let totalDays = 0;
    let completedCountWithDates = 0;
    data.forEach(proj => {
      if (proj.estado === 'completado' && proj.created_at) {
        const created = new Date(proj.created_at);
        // Usamos updated_at, si no, caemos de vuelta a la misma fecha (0 días)
        const updated = new Date(proj.updated_at || proj.created_at);
        const diffTime = Math.abs(updated - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
        completedCountWithDates++;
      }
    });
    const avgDuration = completedCountWithDates > 0 ? `${Math.round(totalDays / completedCountWithDates)} días` : 'N/D';

    // Evolución de Proyectos (Monthly trend of project counts)
    const monthMap = {};
    data.forEach(proj => {
      if (proj.estado === 'descartado') return;
      const date = new Date(proj.created_at);
      const monthName = date.toLocaleString('es-ES', { month: 'short' });
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;
      
      if (!monthMap[key]) monthMap[key] = { name: key, count: 0 };
      monthMap[key].count += 1;
    });
    const trendData = Object.values(monthMap);

    // Demanda por Tipo de Proyecto
    const typeMap = {};
    data.forEach(proj => {
      if (proj.estado === 'descartado') return;
      const type = proj.tipo_proyecto || 'Otro';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    
    const maxVal = Math.max(...Object.values(typeMap), 1);
    const radarData = Object.keys(typeMap).map(key => ({
      subject: key,
      A: typeMap[key],
      fullMark: maxVal + 1
    }));

    // Estado del Pipeline (Donut chart basado en etapa_kanban)
    const stagesCount = { 'Pendiente': 0, 'En curso': 0, 'Revisión': 0, 'Completado': 0 };
    data.forEach(proj => {
      if (proj.estado === 'descartado') return;
      if (proj.estado === 'completado') {
        stagesCount['Completado']++;
      } else {
        const etapa = proj.etapa_kanban || 'Pendiente';
        if (stagesCount[etapa] !== undefined) {
          stagesCount[etapa]++;
        } else {
          stagesCount[etapa] = 1;
        }
      }
    });
    
    const kanbanColors = {
      'Pendiente': '#94a3b8',   // slate-400
      'En curso': '#3b82f6',    // blue-500
      'Revisión': '#f59e0b',    // amber-500
      'Completado': '#10b981'   // emerald-500
    };

    const pieData = Object.keys(stagesCount).map(key => ({
      name: key,
      value: stagesCount[key],
      color: kanbanColors[key] || '#8b5cf6'
    })).filter(d => d.value > 0);

    return {
      avgDuration,
      completionRate,
      activeProjects,
      trendData,
      radarData,
      pieData
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando estadísticas operativas...</p>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center mt-20 text-gray-400">Sin datos suficientes para generar estadísticas.</div>;

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Estadísticas Operativas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Análisis del rendimiento y estado del pipeline de proyectos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Duración Media</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                {stats.avgDuration}
              </h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
              <Clock size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Tasa de Finalización</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                {stats.completionRate}%
              </h3>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <CheckCircle size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
             <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Proyectos Activos</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                {stats.activeProjects}
              </h3>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Briefcase size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolution Over Time - Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            Evolución de Proyectos
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Proyectos Creados" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution - Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Estado del Pipeline</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {stats.pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart (Type Distribution) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-lg dark:shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Demanda por Tipo de Proyecto</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
              <PolarGrid stroke="#374151" opacity={0.3} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
              <Radar name="Total Proyectos" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
              <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdvancedStatsView;
