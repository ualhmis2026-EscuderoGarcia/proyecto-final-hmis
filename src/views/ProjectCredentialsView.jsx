import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Key, Plus, Lock, Unlock, Eye, EyeOff, Copy, ExternalLink, Loader2 } from 'lucide-react';

const ProjectCredentialsView = () => {
  const { id } = useParams();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Security states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [unlockError, setUnlockError] = useState(false);
  const [checkingSecurity, setCheckingSecurity] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    servicio: '', url: '', usuario: '', password: '', notas: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = async () => {
    setCheckingSecurity(true);
    const { data, error } = await supabase
      .from('configuracion_seguridad')
      .select('clave_maestra')
      .limit(1)
      .maybeSingle();
    
    if (!error && data?.clave_maestra) {
      setHasMasterPassword(true);
      setIsUnlocked(false);
    } else {
      setHasMasterPassword(false);
      setIsUnlocked(true); // No password set, auto unlock
      fetchCredentials();
    }
    setCheckingSecurity(false);
  };

  const fetchCredentials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credenciales')
      .select('*')
      .eq('proyecto_id', id)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setCredentials(data || []);
    }
    setLoading(false);
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlockError(false);
    
    const { data, error } = await supabase
      .from('configuracion_seguridad')
      .select('clave_maestra')
      .limit(1)
      .maybeSingle();

    if (!error && data?.clave_maestra === masterPassword) {
      setIsUnlocked(true);
      fetchCredentials();
    } else {
      setUnlockError(true);
      // CSS handle animation by adding class conditionally
      setTimeout(() => setUnlockError(false), 800);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('credenciales')
      .insert({
        proyecto_id: id,
        ...formData
      });
    
    if (!error) {
      setShowForm(false);
      setFormData({ servicio: '', url: '', usuario: '', password: '', notas: '' });
      fetchCredentials();
    }
    setSaving(false);
  };

  if (checkingSecurity) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400"></div>
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-800 dark:text-white shadow-inner">
            <Lock size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Caja Fuerte Bloqueada</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 font-medium">Introduce la Contraseña Maestra para ver los accesos.</p>
          
          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div>
              <input 
                type="password"
                placeholder="Contraseña Maestra"
                value={masterPassword}
                onChange={e => setMasterPassword(e.target.value)}
                className={`w-full px-5 py-4 bg-white dark:bg-[#161b27] border rounded-xl focus:outline-none focus:ring-2 font-black text-center text-xl tracking-widest transition-all ${unlockError ? 'border-red-500 focus:ring-red-500 animate-shake' : 'border-gray-200 dark:border-white/10 focus:ring-slate-800 dark:focus:ring-white/30'}`}
                autoFocus
              />
              {unlockError && <p className="text-red-500 text-xs font-bold mt-2 text-center">Contraseña incorrecta</p>}
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 dark:text-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
              <Unlock size={18} /> Desbloquear
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Key size={28} className="text-blue-600 dark:text-blue-400" />
            Caja Fuerte
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestor de credenciales y accesos del proyecto.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all whitespace-nowrap"
        >
          {showForm ? 'Cancelar' : <><Plus size={18} /> Añadir Acceso</>}
        </button>
      </div>

      {!hasMasterPassword && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex gap-3">
          <Lock className="text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            No tienes configurada una Contraseña Maestra. Cualquiera con acceso al CRM puede ver estas contraseñas. Configúrala en los Ajustes generales de Seguridad.
          </p>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm mb-8 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><Key size={18}/> Nuevo Acceso</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Servicio (Ej. WordPress, Hostinger)</label>
              <input required type="text" value={formData.servicio} onChange={e => setFormData({...formData, servicio: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">URL (Opcional)</label>
              <input type="url" placeholder="https://" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Usuario / Email</label>
              <input required type="text" value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Contraseña</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Notas (Opcional)</label>
              <input type="text" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <button disabled={saving} type="submit" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Guardando...' : 'Guardar Acceso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-slate-900/30">
          <Key size={48} className="mb-4 opacity-30" />
          <p className="font-medium">No hay ninguna credencial guardada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {credentials.map(cred => (
            <CredentialCard key={cred.id} cred={cred} />
          ))}
        </div>
      )}
    </div>
  );
};

const CredentialCard = ({ cred }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0">
            <Key size={18} />
          </div>
          <div>
            {cred.url ? (
              <a href={cred.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {cred.servicio} <ExternalLink size={12} className="opacity-50" />
              </a>
            ) : (
              <h3 className="font-bold text-gray-900 dark:text-white">{cred.servicio}</h3>
            )}
            {cred.url && <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{cred.url}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Usuario */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Usuario</span>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-white/5">
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200 truncate pr-2">{cred.usuario}</span>
            <button onClick={() => handleCopy(cred.usuario, 'usuario')} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 relative p-1">
              {copiedField === 'usuario' ? <span className="absolute -top-7 -left-4 text-[10px] font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded shadow-lg whitespace-nowrap">¡Copiado!</span> : null}
              <Copy size={15} />
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Contraseña</span>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-white/5">
            <span className={`font-mono text-sm truncate pr-2 ${showPassword ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 tracking-widest mt-1'}`}>
              {showPassword ? cred.password : '••••••••'}
            </span>
            <div className="flex items-center gap-2.5 shrink-0">
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <div className="w-px h-4 bg-gray-200 dark:bg-white/10"></div>
              <button onClick={() => handleCopy(cred.password, 'password')} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative p-1">
                {copiedField === 'password' ? <span className="absolute -top-7 -left-4 text-[10px] font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded shadow-lg whitespace-nowrap">¡Copiado!</span> : null}
                <Copy size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {cred.notas && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-500/5 p-3 rounded-xl border border-amber-100 dark:border-amber-500/10 italic">
            <span className="font-bold text-amber-700 dark:text-amber-500 mr-1 not-italic">Nota:</span>
            {cred.notas}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectCredentialsView;
