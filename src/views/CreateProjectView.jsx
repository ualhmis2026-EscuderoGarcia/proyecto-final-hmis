import React, { useState } from 'react';
import { Layout, Globe, ShoppingCart, Server, Globe2, CreditCard, ChevronRight, ArrowLeft, MapPin, BarChart2, User } from 'lucide-react';
import CardSelector from '../components/CardSelector';
import ToggleSwitch from '../components/ToggleSwitch';
import { supabase } from '../lib/supabase';

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

const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-800/50 transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm";
const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2";

const CreateProjectView = ({ setCurrentView, setShowSuccess, session }) => {
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('landing');
  const [pageCount, setPageCount] = useState(1);
  const [addons, setAddons] = useState({ hosting: true, multilang: false, payments: false });

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

  const handleClientInfo = (field, value) => setClientInfo(prev => ({ ...prev, [field]: value }));

  // Servicios adicionales
  const [gbEnabled, setGbEnabled] = useState(false);
  const [gbData, setGbData] = useState({
    status: 'activo',
    price: '',
    client_has_existing_profile: false,
    profile_url: '',
    notes: '',
  });

  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsData, setAdsData] = useState({
    status: 'activo',
    monthly_budget: '',
    monthly_fee: '',
    campaign_type: 'search',
    start_date: '',
    notes: '',
  });

  const projectTypes = [
    { id: 'landing',   title: 'Landing Page',    description: 'One-page site focusing on conversion',     icon: Layout },
    { id: 'corporate', title: 'Web Corporativa',  description: 'Multi-page site for business identity',    icon: Globe },
    { id: 'ecommerce', title: 'E-commerce',       description: 'Online store with product catalog',        icon: ShoppingCart },
  ];

  const addonFeatures = [
    { id: 'hosting',  label: 'Tiene Dominio/Hosting',  description: 'Si no lo tienes, lo configuramos por ti', icon: Server },
    { id: 'multilang',label: 'Necesita Multi-idioma',  description: 'Soporte para múltiples idiomas',           icon: Globe2 },
    { id: 'payments', label: 'Pasarela de Pago',       description: 'Integración con Stripe o PayPal',          icon: CreditCard },
  ];

  const selectedType = projectTypes.find(t => t.id === projectType);

  const handleAddonChange = (id, value) => setAddons(prev => ({ ...prev, [id]: value }));

  const handleCreateProject = async () => {
    // Validación email del cliente
    if (clientInfo.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.client_email)) {
      alert('El email del cliente no tiene un formato válido.');
      return;
    }
    // Validación teléfono
    if (clientInfo.client_phone && !/^[\d\s+\-()]+$/.test(clientInfo.client_phone)) {
      alert('El teléfono no tiene un formato válido. Usa solo números, espacios, +, - o paréntesis.');
      return;
    }
    // Validación WhatsApp
    if (clientInfo.client_whatsapp && !/^[\d\s+\-()]+$/.test(clientInfo.client_whatsapp)) {
      alert('El WhatsApp no tiene un formato válido. Usa solo números, espacios, +, - o paréntesis.');
      return;
    }

    // Validaciones de servicios
    if (gbEnabled && gbData.profile_url) {
      try { new URL(gbData.profile_url); } catch {
        alert('La URL de la ficha de Google Business no es válida.');
        return;
      }
    }
    if (gbEnabled && gbData.price !== '' && parseFloat(gbData.price) < 0) {
      alert('El precio del servicio no puede ser negativo.');
      return;
    }
    if (adsEnabled && adsData.monthly_budget !== '' && parseFloat(adsData.monthly_budget) < 0) {
      alert('El presupuesto mensual no puede ser negativo.');
      return;
    }
    if (adsEnabled && adsData.monthly_fee !== '' && parseFloat(adsData.monthly_fee) < 0) {
      alert('El fee de gestión no puede ser negativo.');
      return;
    }

    const deliveryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const newProject = {
      nombre_cliente: clientName.trim() || 'Proyecto sin especificar',
      tipo_proyecto:  selectedType?.title,
      paginas:        pageCount,
      tiene_dominio:  addons.hosting,
      multi_idioma:   addons.multilang,
      pasarela_pago:  addons.payments,
      fecha_estimada: deliveryDate.toISOString().split('T')[0],
      estado:         'activo',
      user_id:        session?.user?.id,
      client_contact_name: clientInfo.client_contact_name || null,
      client_company:      clientInfo.client_company      || null,
      client_email:        clientInfo.client_email        || null,
      client_phone:        clientInfo.client_phone        || null,
      client_whatsapp:     clientInfo.client_whatsapp     || null,
      client_address:      clientInfo.client_address      || null,
      client_sector:       clientInfo.client_sector       || null,
      client_tax_id:       clientInfo.client_tax_id       || null,
      client_notes:        clientInfo.client_notes        || null,
    };

    const { data: projectData, error } = await supabase
      .from('proyectos')
      .insert([newProject])
      .select('id')
      .single();

    if (error) {
      console.error('Error guardando en Supabase:', error);
      alert('Hubo un error guardando el proyecto en Supabase.');
      return;
    }

    // Guardar servicios adicionales habilitados
    const serviceInserts = [];

    if (gbEnabled) {
      serviceInserts.push({
        project_id:                  projectData.id,
        type:                        'google_business',
        enabled:                     true,
        status:                      gbData.status,
        price:                       gbData.price !== '' ? parseFloat(gbData.price) : null,
        client_has_existing_profile: gbData.client_has_existing_profile,
        profile_url:                 gbData.profile_url || null,
        notes:                       gbData.notes || null,
      });
    }

    if (adsEnabled) {
      serviceInserts.push({
        project_id:     projectData.id,
        type:           'google_ads',
        enabled:        true,
        status:         adsData.status,
        monthly_budget: adsData.monthly_budget !== '' ? parseFloat(adsData.monthly_budget) : null,
        monthly_fee:    adsData.monthly_fee    !== '' ? parseFloat(adsData.monthly_fee)    : null,
        campaign_type:  adsData.campaign_type  || null,
        start_date:     adsData.start_date     || null,
        notes:          adsData.notes          || null,
      });
    }

    if (serviceInserts.length > 0) {
      const { error: svcErr } = await supabase.from('project_services').insert(serviceInserts);
      if (svcErr) console.error('Error guardando servicios:', svcErr);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    setCurrentView('dashboard');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
      <main className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl dark:shadow-2xl h-fit">
        <button
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm font-bold transition-colors group"
          onClick={() => setCurrentView('dashboard')}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Dashboard
        </button>
        <h1 className="text-4xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">Registrar Nuevo Proyecto</h1>

        {/* PASO 1 */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-1">
              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-blue-500/30">1</span>
              Información Básica
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-11 font-medium">Datos del cliente y tipo principal de proyecto.</p>
          </div>
          <div className="ml-11 space-y-6">
            <div>
              <label className={labelClass} htmlFor="clientName">Nombre del Cliente / Proyecto</label>
              <input
                id="clientName"
                type="text"
                className={inputClass + ' font-bold'}
                placeholder="Ej. Acme Corp..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Tipo de Proyecto</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectTypes.map((type) => (
                  <CardSelector
                    key={type.id}
                    id={type.id}
                    title={type.title}
                    description={type.description}
                    icon={type.icon}
                    selected={projectType === type.id}
                    onClick={setProjectType}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-200 dark:bg-white/10 w-full my-8"></div>

        {/* PASO 2 — Información del Cliente */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-1">
              <span className="bg-gradient-to-br from-violet-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-violet-500/30">2</span>
              Información del Cliente
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-11 font-medium">Datos de contacto y perfil del cliente. Todos los campos son opcionales.</p>
          </div>

          <div className="ml-11 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contacto principal</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Nombre y apellidos"
                  value={clientInfo.client_contact_name}
                  onChange={(e) => handleClientInfo('client_contact_name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Empresa o negocio</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Nombre comercial o razón social"
                  value={clientInfo.client_company}
                  onChange={(e) => handleClientInfo('client_company', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="cliente@empresa.com"
                  value={clientInfo.client_email}
                  onChange={(e) => handleClientInfo('client_email', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+34 600 000 000"
                  value={clientInfo.client_phone}
                  onChange={(e) => handleClientInfo('client_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+34 600 000 000"
                  value={clientInfo.client_whatsapp}
                  onChange={(e) => handleClientInfo('client_whatsapp', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Dirección o zona</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ciudad, provincia o dirección"
                  value={clientInfo.client_address}
                  onChange={(e) => handleClientInfo('client_address', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sector del negocio</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej. Restauración, Retail, Legal..."
                  value={clientInfo.client_sector}
                  onChange={(e) => handleClientInfo('client_sector', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>NIF / CIF <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej. B12345678"
                  value={clientInfo.client_tax_id}
                  onChange={(e) => handleClientInfo('client_tax_id', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notas internas del cliente</label>
              <textarea
                rows={3}
                className={inputClass + ' resize-none'}
                placeholder="Observaciones privadas sobre el cliente..."
                value={clientInfo.client_notes}
                onChange={(e) => handleClientInfo('client_notes', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-200 dark:bg-white/10 w-full my-8"></div>

        {/* PASO 3 */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-1">
              <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-indigo-500/30">3</span>
              Estructura y Opciones
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-11 font-medium">Define la magnitud del proyecto y funcionalidades extra.</p>
          </div>
          <div className="ml-11 space-y-8">
            <div className="max-w-[300px]">
              <label className={labelClass} htmlFor="pageCount">Cantidad de Páginas estimadas</label>
              <input
                id="pageCount"
                type="number"
                min="1"
                className={inputClass + ' font-bold'}
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className={labelClass}>Opciones Extra</label>
              <div className="space-y-3">
                {addonFeatures.map((feature) => (
                  <ToggleSwitch
                    key={feature.id}
                    id={feature.id}
                    label={feature.label}
                    description={feature.description}
                    icon={feature.icon}
                    checked={addons[feature.id]}
                    onChange={handleAddonChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-200 dark:bg-white/10 w-full my-8"></div>

        {/* PASO 4 — Servicios Adicionales */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-1">
              <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-emerald-500/30">4</span>
              Servicios Adicionales
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-11 font-medium">Servicios complementarios de marketing digital para este cliente.</p>
          </div>

          <div className="ml-11 space-y-4">

            {/* Google Business Profile */}
            <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 bg-white dark:bg-slate-800/50">
                <ToggleSwitch
                  id="googleBusiness"
                  label="Ficha de Google Business Profile"
                  description="Gestión y optimización de la ficha de negocio en Google"
                  icon={MapPin}
                  checked={gbEnabled}
                  onChange={(_, value) => setGbEnabled(value)}
                />
              </div>

              {gbEnabled && (
                <div className="p-5 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-white/10 space-y-4">
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
                      rows={3} placeholder="Notas opcionales sobre este servicio..."
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
              <div className="p-4 bg-white dark:bg-slate-800/50">
                <ToggleSwitch
                  id="googleAds"
                  label="Campañas de Google Ads"
                  description="Gestión de campañas publicitarias en Google"
                  icon={BarChart2}
                  checked={adsEnabled}
                  onChange={(_, value) => setAdsEnabled(value)}
                />
              </div>

              {adsEnabled && (
                <div className="p-5 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-white/10 space-y-4">
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
                      rows={3} placeholder="Notas opcionales sobre este servicio..."
                      className={inputClass + ' resize-none'}
                      value={adsData.notes}
                      onChange={(e) => setAdsData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      {/* SIDEBAR RESUMEN */}
      <aside className="w-full lg:w-[400px] flex-shrink-0 flex flex-col">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl dark:shadow-2xl sticky top-8">
          <div className="border-b border-dashed border-gray-200 dark:border-white/10 pb-5 mb-5">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Resumen del Proyecto</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              {clientName ? `Cliente: ${clientName}` : 'Cliente no especificado'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-gray-600 dark:text-gray-400">Tipo</span>
              <span className="font-black text-gray-900 dark:text-white">{selectedType?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-gray-600 dark:text-gray-400">Páginas</span>
              <span className="font-black text-gray-900 dark:text-white">{pageCount}</span>
            </div>

            {(clientInfo.client_company || clientInfo.client_email || clientInfo.client_phone) && (
              <div className="pt-5 mt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-extrabold mb-4 flex items-center gap-1.5">
                  <User size={10} /> Info Cliente
                </p>
                {clientInfo.client_company && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Empresa</span>
                    <span className="font-bold text-gray-900 dark:text-white truncate ml-4 max-w-[140px]">{clientInfo.client_company}</span>
                  </div>
                )}
                {clientInfo.client_email && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
                    <span className="font-bold text-gray-900 dark:text-white truncate ml-4 max-w-[140px]">{clientInfo.client_email}</span>
                  </div>
                )}
                {clientInfo.client_phone && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Teléfono</span>
                    <span className="font-bold text-gray-900 dark:text-white">{clientInfo.client_phone}</span>
                  </div>
                )}
              </div>
            )}

            {(addons.hosting || addons.payments || addons.multilang) && (
              <div className="pt-5 mt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-extrabold mb-4">Opciones Extra</p>
                {addons.hosting && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Dominio / Hosting</span>
                    <span className="font-bold text-gray-900 dark:text-white">Sí</span>
                  </div>
                )}
                {addons.payments && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Pasarela de Pago</span>
                    <span className="font-bold text-gray-900 dark:text-white">Sí</span>
                  </div>
                )}
                {addons.multilang && (
                  <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <span>Multi-idioma</span>
                    <span>Sí</span>
                  </div>
                )}
              </div>
            )}

            {(gbEnabled || adsEnabled) && (
              <div className="pt-5 mt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-extrabold mb-4">Servicios Adicionales</p>
                {gbEnabled && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Google Business</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Incluido</span>
                  </div>
                )}
                {adsEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Google Ads</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Incluido</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 mt-6 border-t border-dashed border-gray-200 dark:border-white/20">
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Estado Inicial</span>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-xl">Activo</span>
            </div>
          </div>

          <button
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            onClick={handleCreateProject}
          >
            Guardar Proyecto <ChevronRight size={20} />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CreateProjectView;
