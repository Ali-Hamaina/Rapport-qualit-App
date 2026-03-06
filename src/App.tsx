import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar, Header } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CreateInspection } from './components/CreateInspection';
import { InspectionDetails } from './components/InspectionDetails';
import { InspectionsList } from './components/InspectionsList';
import { ViewInspection } from './components/ViewInspection';
import { ToastContainer } from './components/ui';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentView, selectedInspectionId, setSelectedInspectionId, setCurrentView, toast, sidebarCollapsed } = useApp();

  const handleSelectInspection = (id: string) => {
    setSelectedInspectionId(id);
    setCurrentView('view');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectInspection={handleSelectInspection} />;
      case 'inspections':
        return <InspectionsList />;
      case 'create':
        return <CreateInspection />;
      case 'edit':
        return <CreateInspection editId={selectedInspectionId} />;
      case 'view':
        return <ViewInspection id={selectedInspectionId || ''} />;
      case 'details':
        return <InspectionDetails id={selectedInspectionId || 'new'} />;
      default:
        return <Dashboard onSelectInspection={handleSelectInspection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Sidebar />
      
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedInspectionId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-slate-200 py-6 px-6 md:px-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
            <p>© 2026 CitrusQC Pro. Tous droits réservés.</p>
            <div className="flex gap-6">
              <button className="hover:text-primary transition-colors">Documentation</button>
              <button className="hover:text-primary transition-colors">Portail d'assistance</button>
              <button className="hover:text-primary transition-colors">Logs d'exportation</button>
            </div>
          </div>
        </footer>
      </div>
      
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
