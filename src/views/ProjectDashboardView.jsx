import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2, ChevronRight, Activity, CalendarDays, MapPin, BarChart2, Briefcase, User, Mail, Phone, MessageCircle, Building2, Tag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const STATUS_COLORS = {
  activo:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  pausado:   'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-400',
  cancelado: 'bg-red-100    text-red-700    dark:bg-red-500/20    dark:text-red-400',
  pendiente: 'bg-blue-100   text-blue-700   dark:bg-blue-500/20   dark:text-blue-400',
};

const CAMPAIGN_LABELS = {
  search:          'Búsqueda',
  display:         'Display',
  shopping:        'Shopping',
  video:           'Video',
  performance_max: 'Performance Max',
};

const ProjectDashboardView = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectServices, setProjectServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const [{ data: projData }, { data: tasksData }, { data: svcData }] = await Promise.all([
        supabase.from('proyectos').select('*').eq('id', id).single(),
        supabase.from('tareas').select('*').eq('proyecto_id', id).order('created_at', { ascending: false }),
        supabase.from('project_services').select('*').eq('project_id', id).eq('enabled', true),
      ]);

      if (projData) setProject(projData);
      if (tasksData) setTasks(tasksData);
      if (svcData)   setProjectServices(svcData);

      setLoading(false);
    };

    fetchDashboardData();
  }, [id]);

  const completedTasks = tasks.filter(t => t.estado === 'completada').length;
  const totalTasks     = tasks.length;
  const pendingTasks   = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTasks  = tasks.filter(t => t.estado === 'pendiente');
  const highPriority = activeTasks.filter(t => t.prioridad === 'alta');
  const topTasks     = [...highPriority, ...activeTasks.filter(t => t.prioridad !== 'alta')].slice(0, 3);

  let timePercent = 0;
  let daysLeft    = 0;
  if (project?.created_at && project?.fecha_estimada) {
    const start     = new Date(project.created_at).getTime();
    const end       = new Date(project.fecha_estimada).getTime();
    const now       = Date.now();
    if (end > start) {
      timePercent = Math.min(Math.max(Math.round(((now - start) / (end - start)) * 100), 0), 100);
      daysLeft    = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    }
  }

  const pieData   = [
    { name: 'Completadas', value: completedTasks },
    { name: 'Pendientes',  value: pendingTasks },
  ];
  const COLORS      = ['#10b981', '#f1f5f9'];
  const DARK_COLORS = ['#10b981', '#1e293b'];
  const isDarkMode  = document.documentElement.classList.contains('dark');

  const gbService  = projectServices.find(s => s.type === 'google_business');
  const adsService = projectServices.find(s => s.type === 'google_ads');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
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

        {/* GRÁFICA DE PROGRESO */}
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
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={isDarkMode ? DARK_COLORS[index % 2] : COLORS[index % 2]} />
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

        {/* MEDIDOR DE TIEMPO */}
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
          <div className="relative pt-1 max-w-4xl mx-auto w-full">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-bold inline-block py-1 px-3 uppercase rounded-full text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400">
                Tiempo Consumido
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{timePercent}%</span>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-indigo-50 dark:bg-indigo-950/30">
              <div
                style={{ width: `${timePercent}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${timePercent > 90 ? 'bg-red-500' : timePercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
              <span>Inicio: {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'Aún no iniciado'}</span>
              <span>Entrega: {project?.fecha_estimada ? new Date(project.fecha_estimada).toLocaleDateString() : 'Sin estimar'}</span>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DEL CLIENTE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-violet-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Información del Cliente</h3>
          </div>

          {project?.client_contact_name || project?.client_company || project?.client_email || project?.client_phone ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.client_contact_name && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl shrink-0">
                    <User size={15} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Contacto</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_contact_name}</p>
                  </div>
                </div>
              )}
              {project.client_company && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl shrink-0">
                    <Building2 size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Empresa</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_company}</p>
                  </div>
                </div>
              )}
              {project.client_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl shrink-0">
                    <Mail size={15} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                    <a href={`mailto:${project.client_email}`} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{project.client_email}</a>
                  </div>
                </div>
              )}
              {project.client_phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl shrink-0">
                    <Phone size={15} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Teléfono</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_phone}</p>
                  </div>
                </div>
              )}
              {project.client_whatsapp && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl shrink-0">
                    <MessageCircle size={15} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_whatsapp}</p>
                  </div>
                </div>
              )}
              {project.client_address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl shrink-0">
                    <MapPin size={15} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Dirección</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_address}</p>
                  </div>
                </div>
              )}
              {project.client_sector && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl shrink-0">
                    <Tag size={15} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Sector</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_sector}</p>
                  </div>
                </div>
              )}
              {project.client_tax_id && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl shrink-0">
                    <Tag size={15} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">NIF/CIF</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.client_tax_id}</p>
                  </div>
                </div>
              )}
              {project.client_notes && (
                <div className="md:col-span-2 lg:col-span-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Notas internas</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">{project.client_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <User size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin información de contacto registrada</p>
              <p className="text-sm mt-1">Puedes añadirla desde Configuración del Proyecto.</p>
            </div>
          )}
        </div>

        {/* SERVICIOS ADICIONALES */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase size={18} className="text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Servicios Contratados</h3>
          </div>

          {gbService || adsService ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {gbService && (
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                      <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">Google Business Profile</h4>
                      {gbService.status && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${STATUS_COLORS[gbService.status] || 'bg-gray-100 text-gray-600'}`}>
                          {gbService.status.charAt(0).toUpperCase() + gbService.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {gbService.price != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Precio</span>
                        <span className="font-bold text-gray-900 dark:text-white">{gbService.price}€/mes</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Ficha previa del cliente</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {gbService.client_has_existing_profile ? 'Sí' : 'No'}
                      </span>
                    </div>
                    {gbService.profile_url && (
                      <a
                        href={gbService.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline block truncate mt-1"
                      >
                        Ver ficha →
                      </a>
                    )}
                    {gbService.notes && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                        {gbService.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {adsService && (
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                      <BarChart2 size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">Google Ads</h4>
                      {adsService.status && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${STATUS_COLORS[adsService.status] || 'bg-gray-100 text-gray-600'}`}>
                          {adsService.status.charAt(0).toUpperCase() + adsService.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {adsService.monthly_budget != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Presupuesto cliente</span>
                        <span className="font-bold text-gray-900 dark:text-white">{adsService.monthly_budget}€/mes</span>
                      </div>
                    )}
                    {adsService.monthly_fee != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Fee gestión</span>
                        <span className="font-bold text-gray-900 dark:text-white">{adsService.monthly_fee}€/mes</span>
                      </div>
                    )}
                    {adsService.campaign_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Tipo de campaña</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {CAMPAIGN_LABELS[adsService.campaign_type] || adsService.campaign_type}
                        </span>
                      </div>
                    )}
                    {adsService.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Fecha inicio</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {new Date(adsService.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {adsService.notes && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                        {adsService.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin servicios adicionales contratados</p>
              <p className="text-sm mt-1">Puedes añadirlos desde Configuración del Proyecto.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProjectDashboardView;
