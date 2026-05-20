import React, { useState } from 'react';
import { Layout, Globe, ShoppingCart, Server, Globe2, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import CardSelector from '../components/CardSelector';
import ToggleSwitch from '../components/ToggleSwitch';
import { supabase } from '../lib/supabase';

const CreateProjectView = ({ setCurrentView, setShowSuccess }) => {
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('landing');
  const [pageCount, setPageCount] = useState(1);
  const [addons, setAddons] = useState({
    hosting: true,
    multilang: false,
    payments: false,
  });

  const projectTypes = [
    { id: 'landing', title: 'Landing Page', description: 'One-page site focusing on conversion', icon: Layout },
    { id: 'corporate', title: 'Web Corporativa', description: 'Multi-page site for business identity', icon: Globe },
    { id: 'ecommerce', title: 'E-commerce', description: 'Online store with product catalog', icon: ShoppingCart },
  ];

  const addonFeatures = [
    { id: 'hosting', label: 'Tiene Dominio/Hosting', description: 'Si no lo tienes, lo configuramos por ti', icon: Server },
    { id: 'multilang', label: 'Necesita Multi-idioma', description: 'Soporte para múltiples idiomas', icon: Globe2 },
    { id: 'payments', label: 'Pasarela de Pago', description: 'Integración con Stripe o PayPal', icon: CreditCard },
  ];

  const handleAddonChange = (id, value) => {
    setAddons(prev => ({ ...prev, [id]: value }));
  };

  const selectedType = projectTypes.find(t => t.id === projectType);

  const handleCreateProject = async () => {
    const creationDate = new Date();
    const deliveryDate = new Date(creationDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    
    // Aquí puedes ajustar los campos de acuerdo al esquema exacto de tu tabla 'proyectos'
    const newProject = {
      nombre_cliente: clientName || "Cliente sin especificar",
      tipo_proyecto: selectedType?.title,
      paginas: pageCount,
      tiene_dominio: addons.hosting,
      multi_idioma: addons.multilang,
      pasarela_pago: addons.payments,
      fecha_estimada: deliveryDate.toISOString().split('T')[0],
      estado: 'activo'
    };
    
    const { error } = await supabase
      .from('proyectos')
      .insert([newProject]);

    if (error) {
      console.error("Error guardando en Supabase:", error);
      alert("Hubo un error guardando el proyecto en Supabase.");
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
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

        {/* STEP 1 */}
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5" htmlFor="clientName">Nombre del Cliente</label>
              <input 
                id="clientName"
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-800/50 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm" 
                placeholder="Ej. Acme Corp..." 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Tipo de Proyecto</label>
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

        {/* STEP 2 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-1">
              <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-indigo-500/30">2</span>
              Estructura y Opciones
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-11 font-medium">Define la magnitud del proyecto y funcionalidades extra.</p>
          </div>

          <div className="ml-11 space-y-8">
            <div className="max-w-[300px]">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5" htmlFor="pageCount">Cantidad de Páginas estimadas</label>
              <input 
                id="pageCount"
                type="number" 
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-800/50 transition-all font-bold text-gray-900 dark:text-white shadow-sm" 
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Opciones Extra</label>
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
      </main>

      <aside className="w-full lg:w-[400px] flex-shrink-0 flex flex-col">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl dark:shadow-2xl sticky top-8">
          <div className="border-b border-dashed border-gray-200 dark:border-white/10 pb-5 mb-5">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Resumen del Proyecto</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{clientName ? `Cliente: ${clientName}` : 'Cliente no especificado'}</p>
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
            
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-dashed border-gray-200 dark:border-white/20 space-y-1">
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
