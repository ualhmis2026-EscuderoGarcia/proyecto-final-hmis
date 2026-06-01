import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EconomicSummary = () => {
  const [metrics, setMetrics] = useState({
    totalCobrado: 0,
    pendienteCobrar: 0,
    ingresosRecurrentes: 0,
    ingresosCompletados: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [{ data: projects }, { data: adsServices }] = await Promise.all([
        supabase
          .from('proyectos')
          .select('estado, web_price, amount_paid, payment_status, has_maintenance, maintenance_monthly_fee, maintenance_status'),
        supabase
          .from('project_services')
          .select('monthly_fee, status, enabled')
          .eq('type', 'google_ads')
          .eq('enabled', true)
          .eq('status', 'activo'),
      ]);

      let totalCobrado        = 0;
      let pendienteCobrar     = 0;
      let ingresosRecurrentes = 0;
      let ingresosCompletados = 0;

      projects?.forEach(p => {
        if (p.estado === 'descartado') return;

        const paid  = parseFloat(p.amount_paid)  || 0;
        const price = parseFloat(p.web_price)    || 0;

        totalCobrado += paid;

        if (p.payment_status !== 'cancelado') {
          pendienteCobrar += Math.max(price - paid, 0);
        }

        if (p.has_maintenance && p.maintenance_status === 'activo') {
          ingresosRecurrentes += parseFloat(p.maintenance_monthly_fee) || 0;
        }

        if (p.estado === 'completado') {
          ingresosCompletados += paid;
        }
      });

      // Fee mensual de gestión de Google Ads (NO el presupuesto del cliente)
      adsServices?.forEach(svc => {
        ingresosRecurrentes += parseFloat(svc.monthly_fee) || 0;
      });

      setMetrics({ totalCobrado, pendienteCobrar, ingresosRecurrentes, ingresosCompletados });
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 mb-8 animate-pulse">
        <div className="h-28 bg-gray-50 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const stats = [
    {
      label:       'Total Cobrado',
      value:       `${fmt(metrics.totalCobrado)} €`,
      icon:        DollarSign,
      gradient:    'from-emerald-400 to-emerald-600',
      shadow:      'shadow-emerald-500/30',
      bg:          'bg-emerald-50/50 dark:bg-emerald-500/5',
      border:      'border-emerald-100 dark:border-emerald-500/10',
      textColor:   'text-emerald-700 dark:text-emerald-400',
    },
    {
      label:       'Pendiente de Cobrar',
      value:       `${fmt(metrics.pendienteCobrar)} €`,
      icon:        Clock,
      gradient:    metrics.pendienteCobrar > 0 ? 'from-amber-400 to-amber-600' : 'from-gray-400 to-gray-600',
      shadow:      metrics.pendienteCobrar > 0 ? 'shadow-amber-500/30' : 'shadow-gray-500/30',
      bg:          metrics.pendienteCobrar > 0 ? 'bg-amber-50/50 dark:bg-amber-500/5' : 'bg-gray-50/50 dark:bg-slate-800/50',
      border:      metrics.pendienteCobrar > 0 ? 'border-amber-100 dark:border-amber-500/10' : 'border-gray-100 dark:border-white/5',
      textColor:   metrics.pendienteCobrar > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400',
    },
    {
      label:       'Ingresos Recurrentes / mes',
      value:       `${fmt(metrics.ingresosRecurrentes)} €`,
      icon:        TrendingUp,
      gradient:    'from-blue-400 to-blue-600',
      shadow:      'shadow-blue-500/30',
      bg:          'bg-blue-50/50 dark:bg-blue-500/5',
      border:      'border-blue-100 dark:border-blue-500/10',
      textColor:   'text-blue-700 dark:text-blue-400',
    },
    {
      label:       'Cobrado en Completados',
      value:       `${fmt(metrics.ingresosCompletados)} €`,
      icon:        Award,
      gradient:    'from-violet-400 to-violet-600',
      shadow:      'shadow-violet-500/30',
      bg:          'bg-violet-50/50 dark:bg-violet-500/5',
      border:      'border-violet-100 dark:border-violet-500/10',
      textColor:   'text-violet-700 dark:text-violet-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 mb-8 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

      <div className="flex items-center gap-2 mb-5 z-10 relative">
        <TrendingUp size={16} className="text-emerald-500" />
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Resumen Económico</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`p-4 rounded-2xl ${s.bg} border ${s.border} flex items-center gap-3 transition-transform hover:-translate-y-1 duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0 shadow-lg ${s.shadow}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold ${s.textColor} mb-0.5 leading-tight`}>{s.label}</p>
                <p className="text-lg font-black text-gray-900 dark:text-white leading-none truncate">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EconomicSummary;
