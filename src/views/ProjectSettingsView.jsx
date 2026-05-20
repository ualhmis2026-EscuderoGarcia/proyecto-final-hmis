import React, { useState, useEffect } from 'react';
import { Save, Settings, Loader2, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';

const ProjectSettingsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    tipo_proyecto: '',
    paginas: 1,
    fecha_estimada: '',
    tiene_dominio: false,
    multi_idioma: false,
    pasarela_pago: false,
    url_web: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setFormData({
          nombre_cliente: data.nombre_cliente || '',
          tipo_proyecto: data.tipo_proyecto || '',
          paginas: data.paginas || 1,
          fecha_estimada: data.fecha_estimada || '',
          tiene_dominio: data.tiene_dominio || false,
          multi_idioma: data.multi_idioma || false,
          pasarela_pago: data.pasarela_pago || false,
          url_web: data.url_web || '',
        });
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    const updatePayload = {
      nombre_cliente: formData.nombre_cliente,
      tipo_proyecto: formData.tipo_proyecto,
      paginas: parseInt(formData.paginas) || 1,
      fecha_estimada: formData.fecha_estimada,
      tiene_dominio: formData.tiene_dominio,
      multi_idioma: formData.multi_idioma,
      pasarela_pago: formData.pasarela_pago,
      url_web: formData.url_web || null,
    };

    const { error } = await supabase
      .from('proyectos')
      .update(updatePayload)
      .eq('id', id);

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      console.error("Error completo de Supabase en el UPDATE:", error);
      setErrorMessage(error.message || error.details || "Error desconocido devuelto por Supabase");
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Configuración del Proyecto
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Actualiza los datos estructurales, fechas y características del cliente.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Vital */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Información Vital</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre del Cliente</label>
                  <input 
                    name="nombre_cliente"
                    type="text" 
                    required
                    value={formData.nombre_cliente}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Fecha Estimada de Entrega</label>
                  <input 
                    name="fecha_estimada"
                    type="date" 
                    value={formData.fecha_estimada}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipo de Proyecto</label>
                  <select 
                    name="tipo_proyecto"
                    value={formData.tipo_proyecto}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                  >
                    <option value="Landing Page">Landing Page</option>
                    <option value="Web Corporativa">Web Corporativa</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" />
                    URL de la Web (Producción o Staging)
                  </label>
                  <input 
                    name="url_web"
                    type="url" 
                    placeholder="https://ejemplo.com"
                    value={formData.url_web}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Características Extras */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Características Técnicas</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Número de Páginas</label>
                  <input 
                    name="paginas"
                    type="number" 
                    min="1"
                    required
                    value={formData.paginas}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-medium"
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

            {errorMessage && (
              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={18} /> {errorMessage}
                </span>
              </div>
            )}

            <div className={`pt-6 ${!errorMessage ? 'border-t border-gray-100 dark:border-white/10' : ''} flex items-center justify-between`}>
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
        </div>
      )}
    </div>
  );
};

export default ProjectSettingsView;
