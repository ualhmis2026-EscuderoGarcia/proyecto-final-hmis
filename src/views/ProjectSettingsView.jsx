import React, { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, Globe, MapPin, BarChart2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';

const SERVICE_STATUSES = [
  { value: 'activo',    label: 'Activo' },
  { value: 'pausado',   label: 'Pausado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'pendiente', label: 'Pendiente' },
];

const CAMPAIGN_TYPES = [
  { value: 'search',          label: 'Búsqueda' },
  { value: 'display',         label: 'Display' },
  { value: 'shopping',        label: 'Shopping' },
  { value: 'video',           label: 'Video' },
  { value: 'performance_max', label: 'Performance Max' },
];

const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium";
const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2";

const ProjectSettingsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Datos del proyecto
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    tipo_proyecto:  '',
    paginas:        1,
    fecha_estimada: '',
    tiene_dominio:  false,
    multi_idioma:   false,
    pasarela_pago:  false,
    url_web:        '',
  });

  // Información detallada del cliente
  const [clientInfo, setClientInfo] = useState({
    client_contact_name: '',
    client_company:      '',
    client_email:        '',
    client_phone:        '',
    client_whatsapp:     '',
    client_address:      '',
    client_sector:       '',
    client_tax_id:       '',
    client_notes:        '',
  });

  const handleClientInfo = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  // Servicio Google Business
  const [gbEnabled, setGbEnabled] = useState(false);
  const [gbData, setGbData] = useState({
    status:                      'activo',
    price:                       '',
    client_has_existing_profile: false,
    profile_url:                 '',
    notes:                       '',
  });

  // Servicio Google Ads
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsData, setAdsData] = useState({
    status:         'activo',
    monthly_budget: '',
    monthly_fee:    '',
    campaign_type:  'search',
    start_date:     '',
    notes:          '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);

      const [{ data, error }, { data: svcData }] = await Promise.all([
        supabase.from('proyectos').select('*').eq('id', id).single(),
        supabase.from('project_services').select('*').eq('project_id', id),
      ]);

      if (!error && data) {
        setFormData({
          nombre_cliente: data.nombre_cliente || '',
          tipo_proyecto:  data.tipo_proyecto  || '',
          paginas:        data.paginas        || 1,
          fecha_estimada: data.fecha_estimada || '',
          tiene_dominio:  data.tiene_dominio  || false,
          multi_idioma:   data.multi_idioma   || false,
          pasarela_pago:  data.pasarela_pago  || false,
          url_web:        data.url_web        || '',
        });
        setClientInfo({
          client_contact_name: data.client_contact_name || '',
          client_company:      data.client_company      || '',
          client_email:        data.client_email        || '',
          client_phone:        data.client_phone        || '',
          client_whatsapp:     data.client_whatsapp     || '',
          client_address:      data.client_address      || '',
          client_sector:       data.client_sector       || '',
          client_tax_id:       data.client_tax_id       || '',
          client_notes:        data.client_notes        || '',
        });
      }

      if (svcData) {
        const gb  = svcData.find(s => s.type === 'google_business');
        const ads = svcData.find(s => s.type === 'google_ads');

        setGbEnabled(gb?.enabled ?? false);
        setGbData({
          status:                      gb?.status                      || 'activo',
          price:                       gb?.price  != null              ? String(gb.price) : '',
          client_has_existing_profile: gb?.client_has_existing_profile ?? false,
          profile_url:                 gb?.profile_url                 || '',
          notes:                       gb?.notes                       || '',
        });

        setAdsEnabled(ads?.enabled ?? false);
        setAdsData({
          status:         ads?.status          || 'activo',
          monthly_budget: ads?.monthly_budget  != null ? String(ads.monthly_budget) : '',
          monthly_fee:    ads?.monthly_fee     != null ? String(ads.monthly_fee)    : '',
          campaign_type:  ads?.campaign_type   || 'search',
          start_date:     ads?.start_date      || '',
          notes:          ads?.notes           || '',
        });
      }

      setLoading(false);
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    // Validaciones de información del cliente
    if (clientInfo.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.client_email)) {
      setErrorMessage('El email del cliente no tiene un formato válido.');
      setSaving(false);
      return;
    }
    if (clientInfo.client_phone && !/^[\d\s+\-()]+$/.test(clientInfo.client_phone)) {
      setErrorMessage('El teléfono no tiene un formato válido.');
      setSaving(false);
      return;
    }
    if (clientInfo.client_whatsapp && !/^[\d\s+\-()]+$/.test(clientInfo.client_whatsapp)) {
      setErrorMessage('El WhatsApp no tiene un formato válido.');
      setSaving(false);
      return;
    }

    // Validaciones de servicios
    if (gbEnabled && gbData.profile_url) {
      try { new URL(gbData.profile_url); } catch {
        setErrorMessage('La URL de la ficha de Google Business no es válida.');
        setSaving(false);
        return;
      }
    }
    if (gbEnabled && gbData.price !== '' && parseFloat(gbData.price) < 0) {
      setErrorMessage('El precio del servicio no puede ser negativo.');
      setSaving(false);
      return;
    }
    if (adsEnabled && adsData.monthly_budget !== '' && parseFloat(adsData.monthly_budget) < 0) {
      setErrorMessage('El presupuesto mensual no puede ser negativo.');
      setSaving(false);
      return;
    }
    if (adsEnabled && adsData.monthly_fee !== '' && parseFloat(adsData.monthly_fee) < 0) {
      setErrorMessage('El fee de gestión no puede ser negativo.');
      setSaving(false);
      return;
    }

    // Guardar proyecto
    const { error: projError } = await supabase
      .from('proyectos')
      .update({
        nombre_cliente: formData.nombre_cliente,
        tipo_proyecto:  formData.tipo_proyecto,
        paginas:        parseInt(formData.paginas) || 1,
        fecha_estimada: formData.fecha_estimada,
        tiene_dominio:  formData.tiene_dominio,
        multi_idioma:   formData.multi_idioma,
        pasarela_pago:  formData.pasarela_pago,
        url_web:        formData.url_web || null,
        client_contact_name: clientInfo.client_contact_name || null,
        client_company:      clientInfo.client_company      || null,
        client_email:        clientInfo.client_email        || null,
        client_phone:        clientInfo.client_phone        || null,
        client_whatsapp:     clientInfo.client_whatsapp     || null,
        client_address:      clientInfo.client_address      || null,
        client_sector:       clientInfo.client_sector       || null,
        client_tax_id:       clientInfo.client_tax_id       || null,
        client_notes:        clientInfo.client_notes        || null,
      })
      .eq('id', id);

    if (projError) {
      console.error('Error completo de Supabase en el UPDATE:', projError);
      setErrorMessage(projError.message || projError.details || 'Error desconocido devuelto por Supabase');
      setSaving(false);
      return;
    }

    // Upsert de servicios adicionales (onConflict por project_id + type)
    const serviceUpserts = [
      {
        project_id:                  id,
        type:                        'google_business',
        enabled:                     gbEnabled,
        status:                      gbData.status,
        price:                       gbData.price !== ''         ? parseFloat(gbData.price)         : null,
        client_has_existing_profile: gbData.client_has_existing_profile,
        profile_url:                 gbData.profile_url          || null,
        notes:                       gbData.notes                || null,
        updated_at:                  new Date().toISOString(),
      },
      {
        project_id:     id,
        type:           'google_ads',
        enabled:        adsEnabled,
        status:         adsData.status,
        monthly_budget: adsData.monthly_budget !== '' ? parseFloat(adsData.monthly_budget) : null,
        monthly_fee:    adsData.monthly_fee    !== '' ? parseFloat(adsData.monthly_fee)    : null,
        campaign_type:  adsData.campaign_type  || null,
        start_date:     adsData.start_date     || null,
        notes:          adsData.notes          || null,
        updated_at:     new Date().toISOString(),
      },
    ];

    const { error: svcError } = await supabase
      .from('project_services')
      .upsert(serviceUpserts, { onConflict: 'project_id,type' });

    if (svcError) {
      console.error('Error guardando servicios adicionales:', svcError);
      setErrorMessage('Error al guardar los servicios adicionales: ' + (svcError.message || 'Error desconocido'));
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Configuración del Proyecto
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Actualiza los datos estructurales, fechas, características y servicios del cliente.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          {/* DATOS DEL PROYECTO */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Información Vital</h3>

                <div>
                  <label className={labelClass}>Nombre del Cliente</label>
                  <input
                    name="nombre_cliente" type="text" required
                    value={formData.nombre_cliente} onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Fecha Estimada de Entrega</label>
                  <input
                    name="fecha_estimada" type="date"
                    value={formData.fecha_estimada} onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tipo de Proyecto</label>
                  <select
                    name="tipo_proyecto"
                    value={formData.tipo_proyecto} onChange={handleChange}
                    className={inputClass + ' cursor-pointer'}
                  >
                    <option value="Landing Page">Landing Page</option>
                    <option value="Web Corporativa">Web Corporativa</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass + ' flex items-center gap-2'}>
                    <Globe size={14} className="text-blue-500" />
                    URL de la Web (Producción o Staging)
                  </label>
                  <input
                    name="url_web" type="url" placeholder="https://ejemplo.com"
                    value={formData.url_web} onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Características Técnicas</h3>

                <div>
                  <label className={labelClass}>Número de Páginas</label>
                  <input
                    name="paginas" type="number" min="1" required
                    value={formData.paginas} onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="tiene_dominio" checked={formData.tiene_dominio} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Dominio y Hosting Configurado</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="multi_idioma" checked={formData.multi_idioma} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Sistema Multi-idioma Incluido</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="pasarela_pago" checked={formData.pasarela_pago} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Integración Pasarela de Pago</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL CLIENTE */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2 mb-6 flex items-center gap-2">
              <User size={18} className="text-violet-500" /> Información del Cliente
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contacto principal</label>
                  <input
                    name="client_contact_name" type="text"
                    placeholder="Nombre y apellidos"
                    value={clientInfo.client_contact_name} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Empresa o negocio</label>
                  <input
                    name="client_company" type="text"
                    placeholder="Nombre comercial o razón social"
                    value={clientInfo.client_company} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    name="client_email" type="email"
                    placeholder="cliente@empresa.com"
                    value={clientInfo.client_email} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input
                    name="client_phone" type="tel"
                    placeholder="+34 600 000 000"
                    value={clientInfo.client_phone} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>WhatsApp</label>
                  <input
                    name="client_whatsapp" type="tel"
                    placeholder="+34 600 000 000"
                    value={clientInfo.client_whatsapp} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dirección o zona</label>
                  <input
                    name="client_address" type="text"
                    placeholder="Ciudad, provincia o dirección"
                    value={clientInfo.client_address} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sector del negocio</label>
                  <input
                    name="client_sector" type="text"
                    placeholder="Ej. Restauración, Retail, Legal..."
                    value={clientInfo.client_sector} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>NIF / CIF <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input
                    name="client_tax_id" type="text"
                    placeholder="Ej. B12345678"
                    value={clientInfo.client_tax_id} onChange={handleClientInfo}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Notas internas del cliente</label>
                <textarea
                  name="client_notes" rows={3}
                  placeholder="Observaciones privadas sobre el cliente..."
                  value={clientInfo.client_notes} onChange={handleClientInfo}
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>
          </div>

          {/* SERVICIOS ADICIONALES */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2 mb-6">
              Servicios Adicionales
            </h3>

            <div className="space-y-4">

              {/* Google Business Profile */}
              <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                      <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Ficha de Google Business Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestión y optimización de la ficha de negocio en Google</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center ml-4 shrink-0">
                    <input
                      type="checkbox" className="sr-only peer"
                      checked={gbEnabled}
                      onChange={(e) => setGbEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>

                {gbEnabled && (
                  <div className="p-5 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Estado del servicio</label>
                        <select
                          className={inputClass + ' cursor-pointer'}
                          value={gbData.status}
                          onChange={(e) => setGbData(prev => ({ ...prev, status: e.target.value }))}
                        >
                          {SERVICE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Precio del servicio (€/mes)</label>
                        <input
                          type="number" min="0" step="0.01" placeholder="0.00"
                          className={inputClass}
                          value={gbData.price}
                          onChange={(e) => setGbData(prev => ({ ...prev, price: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>URL de la ficha de Google</label>
                      <input
                        type="url" placeholder="https://maps.google.com/..."
                        className={inputClass}
                        value={gbData.profile_url}
                        onChange={(e) => setGbData(prev => ({ ...prev, profile_url: e.target.value }))}
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={gbData.client_has_existing_profile}
                        onChange={(e) => setGbData(prev => ({ ...prev, client_has_existing_profile: e.target.checked }))}
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">El cliente ya tiene ficha creada</span>
                    </label>
                    <div>
                      <label className={labelClass}>Notas internas</label>
                      <textarea
                        rows={3} placeholder="Notas opcionales..."
                        className={inputClass + ' resize-none'}
                        value={gbData.notes}
                        onChange={(e) => setGbData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Google Ads */}
              <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                      <BarChart2 size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Campañas de Google Ads</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestión de campañas publicitarias en Google</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center ml-4 shrink-0">
                    <input
                      type="checkbox" className="sr-only peer"
                      checked={adsEnabled}
                      onChange={(e) => setAdsEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>

                {adsEnabled && (
                  <div className="p-5 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Estado del servicio</label>
                        <select
                          className={inputClass + ' cursor-pointer'}
                          value={adsData.status}
                          onChange={(e) => setAdsData(prev => ({ ...prev, status: e.target.value }))}
                        >
                          {SERVICE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Tipo de campaña</label>
                        <select
                          className={inputClass + ' cursor-pointer'}
                          value={adsData.campaign_type}
                          onChange={(e) => setAdsData(prev => ({ ...prev, campaign_type: e.target.value }))}
                        >
                          {CAMPAIGN_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Presupuesto mensual del cliente (€)</label>
                        <input
                          type="number" min="0" step="0.01" placeholder="0.00"
                          className={inputClass}
                          value={adsData.monthly_budget}
                          onChange={(e) => setAdsData(prev => ({ ...prev, monthly_budget: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Fee mensual de gestión (€)</label>
                        <input
                          type="number" min="0" step="0.01" placeholder="0.00"
                          className={inputClass}
                          value={adsData.monthly_fee}
                          onChange={(e) => setAdsData(prev => ({ ...prev, monthly_fee: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Fecha de inicio</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={adsData.start_date}
                        onChange={(e) => setAdsData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Notas internas</label>
                      <textarea
                        rows={3} placeholder="Notas opcionales..."
                        className={inputClass + ' resize-none'}
                        value={adsData.notes}
                        onChange={(e) => setAdsData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* MENSAJES Y BOTÓN */}
          {errorMessage && (
            <div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /> {errorMessage}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {success && (
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-lg animate-in fade-in duration-300">
                ¡Cambios guardados correctamente!
              </span>
            )}
            {!success && <div></div>}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:shadow transition-all"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
};

export default ProjectSettingsView;
