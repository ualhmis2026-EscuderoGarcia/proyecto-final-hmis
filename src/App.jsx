import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import ProjectListView from './views/ProjectListView';
import CreateProjectView from './views/CreateProjectView';
import EditModal from './components/EditModal';
import ClientPortalView from './views/ClientPortalView';
import AdvancedStatsView from './views/AdvancedStatsView';
import SettingsView from './views/SettingsView';

// ── CRM Layout (internal, with Sidebar) ──────────────────
function CRMApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const fetchProjectsCallback = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0c111d] transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="ml-60 flex-1 p-8 min-h-screen">
        {/* Global success toast */}
        {showSuccess && (
          <div className="fixed top-5 right-5 z-50 bg-white dark:bg-[#161b27] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-semibold">Proyecto creado correctamente</span>
          </div>
        )}

        {['dashboard', 'history', 'trash'].includes(currentView) && (
          <ProjectListView
            key={`${currentView}-${refreshKey}`}
            viewType={currentView}
            onEdit={(proj) => setEditingProject(proj)}
          />
        )}

        {currentView === 'form' && (
          <CreateProjectView
            setCurrentView={setCurrentView}
            setShowSuccess={setShowSuccess}
          />
        )}
        
        {currentView === 'stats' && (
          <AdvancedStatsView />
        )}

        {currentView === 'settings' && (
          <SettingsView theme={theme} toggleTheme={toggleTheme} />
        )}
      </main>

      {editingProject && (
        <EditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          fetchProjects={fetchProjectsCallback}
        />
      )}
    </div>
  );
}

// ── Root: Router switchboard ──────────────────────────────
import ProjectLayout from './views/ProjectLayout';
import SplashScreen from './views/SplashScreen';
import LoginView from './views/LoginView';
import { supabase } from './lib/supabase';

function App() {
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [session, setSession] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {isSplashActive && (
        <SplashScreen onComplete={() => setIsSplashActive(false)} />
      )}

      {/* Renderizamos las rutas solo cuando la pantalla de carga se oculta y la auth ha cargado */}
      {!isSplashActive && authInitialized && (
        <Routes>
          {/* Public client portal - No requiere autenticación */}
          <Route path="/portal/:id" element={<ClientPortalView />} />

          {/* Internal project view - Protegido */}
          <Route 
            path="/proyecto/:id/*" 
            element={session ? <ProjectLayout /> : <LoginView />} 
          />

          {/* CRM app — Protegido */}
          <Route 
            path="/*" 
            element={session ? <CRMApp /> : <LoginView />} 
          />
        </Routes>
      )}
    </>
  );
}

export default App;
