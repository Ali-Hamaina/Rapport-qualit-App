import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Package, 
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from '../types';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui';
import { APP_NAME, STATION_ID } from '../constants';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  
  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'create', label: 'Créer', icon: PlusCircle },
  
  ];

  const isActiveView = (itemId: View) => {
    if (itemId === 'inspections') return ['inspections', 'view', 'edit'].includes(currentView);
    if (itemId === 'create') return ['create', 'details'].includes(currentView);
    return currentView === itemId;
  };

  const handleNavClick = (id: View) => {
    setCurrentView(id);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 glass-sidebar z-50 flex flex-col transition-all duration-300",
        // Desktop: always visible
        "hidden md:flex",
        sidebarCollapsed ? "w-20" : "w-64",
        // Mobile: overlay slide-in
        mobileSidebarOpen && "!flex w-64"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className={cn("flex items-center gap-3 text-primary transition-all", sidebarCollapsed && !mobileSidebarOpen && "justify-center")}>
              <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Package className="size-6" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div>
                  <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{APP_NAME}</h2>
                  <p className="text-xs text-slate-500 font-medium">{STATION_ID}</p>
                </div>
              )}
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            >
              <X className="size-5 text-slate-600" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActiveView(item.id) 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-slate-600 hover:bg-primary/10 hover:text-primary"
                )}
                title={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
              >
                <item.icon className="size-5 shrink-0" />
                {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-semibold">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200">
          {sidebarCollapsed && !mobileSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-full p-3 hover:bg-slate-100 rounded-lg transition-colors mb-4"
              title="Développer la barre latérale"
            >
              <X className="size-5 text-slate-600 mx-auto" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC = () => {
  const { setCurrentView, setMobileSidebarOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header className="h-14 md:h-16 border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-3 md:px-8 flex items-center justify-between gap-2 md:gap-4">
      {/* Hamburger for mobile */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden shrink-0"
      >
        <Menu className="size-5 text-slate-600" />
      </button>

      <div className="flex items-center gap-4 flex-1 max-w-xl min-w-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all relative">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <Button
          onClick={() => setCurrentView('create')}
          icon={<Plus className="size-4" />}
          className="hidden sm:flex"
        >
          Nouvelle inspection
        </Button>
        
        <Button
          onClick={() => setCurrentView('create')}
          icon={<Plus className="size-4" />}
          className="flex sm:hidden px-3"
        />
      </div>
    </header>
  );
};
