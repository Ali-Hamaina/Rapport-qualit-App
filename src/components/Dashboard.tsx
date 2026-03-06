import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Eye,
  Edit3,
  Filter,
  Trash2,
  Printer,
  Search,
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Inspection } from '../types';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { useInspections } from '../hooks/useInspections';
import { usePagination } from '../hooks/usePagination';
import { Card, CardHeader, Badge, Select, Pagination, InspectionCardSkeleton, StatCardSkeleton, Modal, Button } from './ui';
import { mockChartData } from '../data/mockData';
import { CITRUS_VARIETIES, INSPECTION_STATUS } from '../constants';
import { printInspectionReport } from './PrintReport';

interface DashboardProps {
  onSelectInspection: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectInspection }) => {
  const { inspections: allInspections, deleteInspection, setCurrentView, setSelectedInspectionId } = useApp();
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  
  const {
    inspections,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
  } = useInspections(allInspections);
  
  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
  } = usePagination<Inspection>(inspections);
  
  // Calculate stats
  const totalInspections = allInspections.length;
  const acceptedInspections = allInspections.filter(i => i.status === 'Accepté').length;
  const warningInspections = allInspections.filter(i => i.status === 'Avertissement').length;
  const rejectedInspections = allInspections.filter(i => i.status === 'Rejeté').length;
  const acceptanceRate = totalInspections > 0 ? Math.round((acceptedInspections / totalInspections) * 100) : 0;
  
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </>
        ) : (
          <>
            <StatCard 
              title="Total des inspections" 
              value={totalInspections.toString()} 
              trend="+12,5% ce mois-ci" 
              trendIcon={<TrendingUp className="size-4" />}
              color="primary"
            />
            <StatCard 
              title="Lots acceptés" 
              value={acceptedInspections.toString()} 
              trend={`Taux de qualité ${acceptanceRate}%`}
              trendIcon={<CheckCircle2 className="size-4" />}
              color="emerald"
            />
            <StatCard 
              title="État d'alerte" 
              value={warningInspections.toString()} 
              trend="Nécessite une attention" 
              trendIcon={<AlertTriangle className="size-4" />}
              color="amber"
            />
            <StatCard 
              title="Lots rejetés" 
              value={rejectedInspections.toString()} 
              trend="-2,4% vs semaine dernière" 
              trendIcon={<XCircle className="size-4" />}
              color="rose"
            />
          </>
        )}
      </div>

      {/* Chart Section */}
      <Card padding="lg">
        <CardHeader
          title="Tendance des défauts"
          subtitle="Analyse hebdomadaire de la qualité par variété"
          action={
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">Hebdomadaire</button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-50">Mensuel</button>
            </div>
          }
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f49d25" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f49d25" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                dy={10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="value1" stroke="#f49d25" strokeWidth={3} fillOpacity={1} fill="url(#colorValue1)" />
              <Area type="monotone" dataKey="value2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Inspections */}
      <div>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Inspections récentes</h2>
              <p className="text-sm text-slate-500 mt-1">
                Affichage de {paginatedItems.length} sur {inspections.length} inspection(s)
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par lot, variété, producteur, inspecteur..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Variety Select */}
            {/* <Select
              options={[
                { value: '', label: 'Toutes les variétés' },
                ...CITRUS_VARIETIES.map(v => ({ value: v, label: v }))
              ]}
              value={filters.variety || ''}
              onChange={(e) => updateFilters({ variety: e.target.value || undefined })}
              className="w-full"
            /> */}

            {/* Status Select */}
            {/* <Select
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: INSPECTION_STATUS.ACCEPTED, label: 'Accepté' },
                { value: INSPECTION_STATUS.WARNING, label: 'Avertissement' },
                { value: INSPECTION_STATUS.REJECTED, label: 'Rejeté' },
              ]}
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as any || undefined })}
              className="w-full"
            /> */}

            {/* Reset */}
            {(filters.variety || filters.status || searchQuery) && (
              <button
                onClick={() => { clearFilters(); setSearchQuery(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors whitespace-nowrap"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => <InspectionCardSkeleton key={i} />)}
            </>
          ) : paginatedItems.length > 0 ? (
            paginatedItems.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onSelect={onSelectInspection}
                onDelete={(id) => setDeleteModal({ open: true, id })}
                onEdit={(id) => { setSelectedInspectionId(id); setCurrentView('edit'); }}
                onPrint={(id) => {
                  const insp = allInspections.find(i => i.id === id);
                  if (insp) printInspectionReport(insp);
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 text-lg">Aucune inspection trouvée</p>
              <p className="text-slate-400 text-sm mt-2">Essayez d'ajuster vos filtres</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto size-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="size-7 text-red-500" />
          </div>
          <p className="text-slate-700 mb-1">Êtes-vous sûr de vouloir supprimer cette inspection ?</p>
          <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null })}>
              Annuler
            </Button>
            <Button variant="danger" onClick={() => { if (deleteModal.id) { deleteInspection(deleteModal.id); setDeleteModal({ open: false, id: null }); } }}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  trend: string; 
  trendIcon: React.ReactNode;
  color: string;
}> = ({ title, value, trend, trendIcon, color }) => {
  const colorClasses = {
    primary: "text-slate-900",
    emerald: "text-emerald-600",
    amber: "text-amber-500",
    rose: "text-rose-500"
  };

  const bgClasses = {
    primary: "bg-primary/5",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50"
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 size-24 rounded-full group-hover:scale-110 transition-transform", bgClasses[color as keyof typeof bgClasses])} />
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className={cn("text-3xl font-bold mt-1", colorClasses[color as keyof typeof colorClasses])}>{value}</h3>
      </div>
      <div className={cn("mt-4 flex items-center gap-2", 
        color === 'primary' ? "text-emerald-500" : 
        color === 'emerald' ? "text-emerald-500" :
        color === 'amber' ? "text-amber-500" : "text-rose-500"
      )}>
        {trendIcon}
        <span className="text-xs font-bold">{trend}</span>
      </div>
    </Card>
  );
};

const InspectionCard: React.FC<{
  inspection: Inspection;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (id: string) => void;
}> = ({ inspection, onSelect, onDelete, onEdit, onPrint }) => {
  const getStatusVariant = (status: string) => {
    if (status === 'Accepté') return 'success';
    if (status === 'Avertissement') return 'warning';
    return 'danger';
  };

  return (
    <Card
      padding="none"
      hover
      onClick={() => onSelect(inspection.id)}
      className="overflow-hidden group"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          src={inspection.image} 
          alt={inspection.variety}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <Badge variant={getStatusVariant(inspection.status)} size="sm">
            {inspection.status}
          </Badge>
        </div>
        {/* Delete button top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(inspection.id); }}
          className="absolute top-4 right-4 size-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="Supprimer"
        >
          <Trash2 className="size-4" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-white/90 backdrop-blur p-2 rounded-lg">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Variété</p>
            <p className="text-xs font-bold text-slate-800">{inspection.variety}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPrint(inspection.id);
              }}
              className="size-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
              title="Imprimer"
            >
              <Printer className="size-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(inspection.id);
              }}
              className="size-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
              title="Voir"
            >
              <Eye className="size-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(inspection.id);
              }}
              className="size-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
              title="Éditer"
            >
              <Edit3 className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-lg font-bold">{inspection.commodity}</h4>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Producteur</span>
            <span className="font-semibold truncate ml-2">{inspection.grower}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Inspecteur</span>
            <span className="font-semibold truncate ml-2">{inspection.inspector}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Date</span>
            <span className="font-semibold">{new Date(inspection.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
