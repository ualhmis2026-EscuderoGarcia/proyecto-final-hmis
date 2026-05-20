import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const AGENCY_DOMAIN = import.meta.env.VITE_AGENCY_DOMAIN || '@usuario.com';
  // Ensure the domain starts with '@'
  const domainSuffix = AGENCY_DOMAIN.startsWith('@') ? AGENCY_DOMAIN : `@${AGENCY_DOMAIN}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Form email from username and domain
    const email = `${username}${domainSuffix}`;

    if (isRegisterMode) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error(signUpError);
        setError(signUpError.message || 'Error al registrar el usuario.');
        setIsLoading(false);
      } else {
        setSuccessMessage('¡Usuario registrado correctamente! Ya puedes iniciar sesión con tu cuenta.');
        setIsRegisterMode(false);
        setIsLoading(false);
        setPassword('');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error(signInError);
        setError('Usuario o contraseña incorrectos.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in duration-300">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {isRegisterMode ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
          </h2>
          <p className="text-sm text-indigo-200/80 font-medium">
            {isRegisterMode ? 'Regístrate para empezar a gestionar tus proyectos' : 'Ingresa a tu espacio de trabajo seguro'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-medium text-center backdrop-blur-md animate-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm font-medium text-center backdrop-blur-md animate-in slide-in-from-top-1 duration-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Usuario */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-100/90 ml-1">Usuario</label>
            <div className="relative flex items-center bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
              <input
                type="text"
                required
                className="w-full bg-transparent text-white px-4 py-3.5 text-sm font-medium outline-none placeholder:text-white/30"
                placeholder="Ej. carlos"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <span className="pr-4 text-sm font-medium text-white/40 select-none pointer-events-none">
                {domainSuffix}
              </span>
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-100/90 ml-1">Contraseña</label>
            <div className="relative flex items-center bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-transparent text-white px-4 py-3.5 text-sm font-medium outline-none placeholder:text-white/30"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 text-white/40 hover:text-white/80 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Opciones extra (solo al iniciar sesión) */}
          {!isRegisterMode && (
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-slate-900/50 group-hover:border-white/40 transition-colors">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <svg className="w-3 h-3 text-blue-400 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-indigo-100/70 group-hover:text-indigo-100 transition-colors">
                  Recordar sesión
                </span>
              </label>
              
              <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          {/* Botón Login / Registro */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-500 py-3.5 px-4 rounded-xl shadow-inner transition-all group-active:scale-[0.98]">
              {isLoading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <span className="text-sm font-bold text-white tracking-wide">
                  {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
                </span>
              )}
            </div>
          </button>
        </form>

        {/* Alternar entre login y registro */}
        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setSuccessMessage('');
            }}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isRegisterMode 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate gratis'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

