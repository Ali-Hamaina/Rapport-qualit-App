import React, { useState } from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  Search,
  Plus,
  ClipboardCheck,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { useInspections } from '../hooks/useInspections';
import { usePagination } from '../hooks/usePagination';
import { Card, Badge, Select, Button, Pagination, Modal, InspectionCardSkeleton } from './ui';
import { CITRUS_VARIETIES, INSPECTION_STATUS } from '../constants';
import { Inspection } from '../types';
import { printInspectionReport } from './PrintReport';

export const InspectionsList: React.FC = () => {
  const {
    inspections: allInspections,
    deleteInspection,
    setCurrentView,
    setSelectedInspectionId,
    toast,
  } = useApp();

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
  } = usePagination<Inspection>(inspections, 12);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const handleView = (id: string) => {
    setSelectedInspectionId(id);
    setCurrentView('view');
  };

  const handleEdit = (id: string) => {
    setSelectedInspectionId(id);
    setCurrentView('edit');
  };

  const handlePrint = (id: string) => {
    const inspection = allInspections.find(i => i.id === id);
    if (inspection) printInspectionReport(inspection);
  };

  const handleDelete = async () => {
    if (deleteModal.id) {
      await deleteInspection(deleteModal.id);
      setDeleteModal({ open: false, id: null });
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Accepté') return 'success';
    if (status === 'Avertissement') return 'warning';
    return 'danger';
  };

  const totalCount = allInspections.length;
  const acceptedCount = allInspections.filter(i => i.status === 'Accepté').length;
  const warningCount = allInspections.filter(i => i.status === 'Avertissement').length;
  const rejectedCount = allInspections.filter(i => i.status === 'Rejeté').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Inspections
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez toutes vos inspections de qualité
          </p>
        </div>
        <Button
          onClick={() => setCurrentView('create')}
          icon={<Plus className="size-4" />}
        >
          Nouvelle inspection
        </Button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="size-4 md:size-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Total</p>
            <p className="text-base md:text-lg font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <div className="size-2.5 md:size-3 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Accepté</p>
            <p className="text-base md:text-lg font-bold text-emerald-600">{acceptedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <div className="size-2.5 md:size-3 rounded-full bg-amber-500" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Alerte</p>
            <p className="text-base md:text-lg font-bold text-amber-600">{warningCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-red-50 flex items-center justify-center">
            <div className="size-2.5 md:size-3 rounded-full bg-red-500" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Rejeté</p>
            <p className="text-base md:text-lg font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filters / Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center">

  {/* Search */}
  <div className="relative md:col-span-2 lg:col-span-2">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Rechercher par lot, variété, producteur..."
      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
    />
  </div>

  {/* Variety Filter */}
  {/* <Select
    options={[
      { value: '', label: 'Toutes les variétés' },
      ...CITRUS_VARIETIES.map(v => ({ value: v, label: v })),
    ]}
    value={filters.variety || ''}
    onChange={(e) => updateFilters({ variety: e.target.value || undefined })}
    className="w-full"
  /> */}

  {/* Status Filter */}
  {/* <Select
    options={[
      { value: '', label: 'Tous les statuts' },
      { value: INSPECTION_STATUS.ACCEPTED, label: 'Accepté' },
      { value: INSPECTION_STATUS.WARNING, label: 'Avertissement' },
      { value: INSPECTION_STATUS.REJECTED, label: 'Rejeté' },
    ]}
    value={filters.status || ''}
    onChange={(e) =>
      updateFilters({
        status: (e.target.value as Inspection['status']) || undefined,
      })
    }
    className="w-full"
  /> */}

  {/* Reset Button */}
  {(filters.variety || filters.status || searchQuery) && (
    <button
      onClick={() => {
        clearFilters()
        setSearchQuery('')
      }}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors whitespace-nowrap"
    >
      Réinitialiser
    </button>
  )}

</div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        {inspections.length} inspection(s) trouvée(s)
      </p>

      {/* Inspection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((inspection) => (
            <InspectionListCard
              key={inspection.id}
              inspection={inspection}
              onView={handleView}
              onEdit={handleEdit}
              onPrint={handlePrint}
              onDelete={(id) => setDeleteModal({ open: true, id })}
              getStatusVariant={getStatusVariant}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <ClipboardCheck className="size-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg font-medium">Aucune inspection trouvée</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Ajustez vos filtres ou créez une nouvelle inspection</p>
            <Button onClick={() => setCurrentView('create')} icon={<Plus className="size-4" />}>
              Créer une inspection
            </Button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      )}

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
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Inspection Card with View / Edit / Print / Delete actions
const InspectionListCard: React.FC<{
  inspection: Inspection;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusVariant: (status: string) => 'success' | 'warning' | 'danger';
}> = ({ inspection, onView, onEdit, onPrint, onDelete, getStatusVariant }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      {/* Image */}
      <div className="h-36 overflow-hidden relative">
        <img
          src={inspection.image}
          alt={inspection.variety}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={getStatusVariant(inspection.status)} size="sm">
            {inspection.status}
          </Badge>
        </div>
        {/* Delete button top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(inspection.id); }}
          className="absolute top-3 right-3 size-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="Supprimer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-bold text-slate-900 leading-tight">{inspection.commodity}</h4>
          <span className="text-xs font-mono text-slate-400 shrink-0">#{inspection.id}</span>
        </div>
        <p className="text-sm text-slate-500 mb-1">{inspection.variety}</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Producteur</span>
            <span className="font-semibold text-slate-700 truncate ml-2 max-w-32">{inspection.grower}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Inspecteur</span>
            <span className="font-semibold text-slate-700 truncate ml-2 max-w-32">{inspection.inspector}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Date</span>
            <span className="font-semibold text-slate-700">
              {new Date(inspection.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
        <button
          onClick={() => onView(inspection.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
        >
          <Eye className="size-3.5" />
          Voir
        </button>
        <button
          onClick={() => onEdit(inspection.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <Edit3 className="size-3.5" />
          Éditer
        </button>
        <button
          onClick={() => onPrint(inspection.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
        >
          <Printer className="size-3.5" />
          Imprimer
        </button>
      </div>
    </div>
  );
};
