import React, { useState, useEffect } from 'react';
import { Palette, Building2, ChevronRight, Save, RotateCcw, Sun, Moon, Check, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEFAULT_BUSINESS = {
  studioName: 'Proyectos CRM',
  email: '',
  whatsapp: '',
  portalTagline: 'Aquí puedes ver el estado actualizado de tu proyecto en tiempo real.',
};

const ACCENT_COLORS = [
  { id: 'blue', label: 'Azul', class: 'bg-blue-600', hex: '#2563eb' },
  { id: 'indigo', label: 'Índigo', class: 'bg-indigo-600', hex: '#4f46e5' },
  { id: 'violet', label: 'Violeta', class: 'bg-violet-600', hex: '#7c3aed' },
  { id: 'emerald', label: 'Esmeralda', class: 'bg-emerald-600', hex: '#059669' },
];

// ── Sub-section: Appearance ────────────────────────────────
const AppearanceSection = ({ theme, toggleTheme }) => {
  const [accent, setAccent] = useState(
    () => localStorage.getItem('crm_accent') || 'blue'
  );

  const saveAccent = (id) => {
    setAccent(id);
    localStorage.setItem('crm_accent', id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tema de la interfaz</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Elige entre modo claro y modo oscuro.</p>
        <div className="flex gap-3">
          {[
            { id: 'light', label: 'Claro', Icon: Sun },
            { id: 'dark', label: 'Oscuro', Icon: Moon },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => theme !== id && toggleTheme()}
              className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 font-medium text-sm
                ${theme === id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                }`}
            >
              <Icon size={22} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Color de acento</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Color principal para botones y elementos activos. (Próximamente aplicación dinámica)</p>
        <div className="flex gap-3 flex-wrap">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => saveAccent(c.id)}
              title={c.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium
                ${accent === c.id
                  ? 'border-gray-900 dark:border-white scale-105 shadow-md'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'
                }`}
            >
              <span className={`w-4 h-4 rounded-full ${c.class} shadow-sm`} />
              {c.label}
              {accent === c.id && <Check size={14} className="text-gray-700 dark:text-gray-200" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Sub-section: Business Profile ─────────────────────────
const BusinessSection = () => {
  const [biz, setBiz] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_business')) || DEFAULT_BUSINESS;
    } catch { return DEFAULT_BUSINESS; }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem('crm_business', JSON.stringify(biz));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key, val) => setBiz(p => ({ ...p, [key]: val }));

  const fields = [
    { key: 'studioName', label: 'Nombre del estudio / agencia', placeholder: 'Ej. Agencia Pixel', type: 'text' },
    { key: 'email', label: 'Email de contacto', placeholder: 'hola@tuagencia.com', type: 'email' },
    { key: 'whatsapp', label: 'Número de WhatsApp', placeholder: '+34 600 000 000', type: 'tel' },
    { key: 'portalTagline', label: 'Texto de bienvenida en el portal del cliente', placeholder: 'Aquí puedes ver el estado de tu proyecto...', type: 'text' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Información del negocio</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Estos datos aparecen en el portal del cliente y en los PDFs de presupuesto generados.
        </p>
        <div className="space-y-4">
          {fields.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
              <input
                type={type}
                className="input-field"
                placeholder={placeholder}
                value={biz[key] || ''}
                onChange={e => update(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 leading-relaxed">
          <strong>Nota:</strong> Estos datos se almacenan localmente en este navegador. El nombre del estudio
          se muestra en la cabecera del sidebar y en los PDFs exportados.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} className="btn-primary flex items-center gap-2">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

// ── Sub-section: Security ────────────────────────────────
const SecuritySection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkCurrent();
  }, []);

  const checkCurrent = async () => {
    const { data } = await supabase.from('configuracion_seguridad').select('*').limit(1).maybeSingle();
    if (data?.clave_maestra) {
      setHasPassword(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const { data: config } = await supabase.from('configuracion_seguridad').select('*').limit(1).maybeSingle();

    if (hasPassword && config?.clave_maestra !== currentPassword) {
      setMessage({ text: 'La contraseña actual es incorrecta', type: 'error' });
      setSaving(false);
      return;
    }

    if (config) {
      await supabase.from('configuracion_seguridad').update({ clave_maestra: newPassword }).eq('id', config.id);
    } else {
      await supabase.from('configuracion_seguridad').insert({ clave_maestra: newPassword });
    }

    setMessage({ text: 'Clave maestra guardada correctamente', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setHasPassword(true);
    setSaving(false);
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Shield size={16} /> Seguridad de la Agencia</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Configura una Contraseña Maestra para proteger la "Caja Fuerte" (accesos y credenciales) de todos los proyectos.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          {hasPassword && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Contraseña Maestra Actual</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nueva Contraseña Maestra</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button disabled={saving} type="submit" className="btn-primary flex items-center gap-2">
              {saving ? 'Guardando...' : 'Guardar Clave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Settings View ─────────────────────────────────────
const SECTIONS = [
  { id: 'appearance', label: 'Apariencia', description: 'Tema visual y color de acento', Icon: Palette },
  { id: 'business', label: 'Negocio', description: 'Datos de tu agencia y portal del cliente', Icon: Building2 },
  { id: 'security', label: 'Seguridad', description: 'Clave maestra y accesos', Icon: Shield },
];

const SettingsView = ({ theme, toggleTheme }) => {
  const [activeSection, setActiveSection] = useState('appearance');

  const active = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza el comportamiento y la identidad visual del CRM.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, description, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group
                  ${activeSection === id
                    ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20'
                    : 'hover:bg-gray-100 dark:hover:bg-white/[0.04] border border-transparent'
                  }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg transition-colors ${activeSection === id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-white/10'}`}>
                  <Icon size={15} />
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${activeSection === id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              {active && <active.Icon size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{active?.label}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{active?.description}</p>
            </div>
          </div>

          {/* Dynamic content */}
          {activeSection === 'appearance' && <AppearanceSection theme={theme} toggleTheme={toggleTheme} />}
          {activeSection === 'business' && <BusinessSection />}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
