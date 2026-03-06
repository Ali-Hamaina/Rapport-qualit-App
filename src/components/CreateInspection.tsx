import React, { useState, useEffect } from 'react';
import {
  Info,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { Input, Select, Button, Card, CardHeader, Badge } from './ui';
import { CITRUS_COMMODITIES, CITRUS_VARIETIES, INSPECTION_STATUS } from '../constants';
import { Inspection, InspectionStatus } from '../types';

interface FormData {
  commodityName: string;
  controlPointName: string;
  inspectedBy: string;
  facility: string;
  packDate: string;
  grower: string;
  variety: string;
  receiveDate: string;
  inspectionTime: string;
  sampleTime: string;
  status: string;
  sampleSize: string;
  lotNumber: string;
}

interface CreateInspectionProps {
  editId?: string | null;
}

export const CreateInspection: React.FC<CreateInspectionProps> = ({ editId }) => {
  const {
    inspections,
    setCurrentView,
    setSelectedInspectionId,
    addInspection,
    updateInspection,
    toast,
  } = useApp();

  const isEditMode = !!editId;
  const existingInspection = isEditMode ? inspections.find(i => i.id === editId) : null;

  const [formData, setFormData] = useState<FormData>({
    commodityName: '',
    controlPointName: '',
    inspectedBy: '',
    facility: '',
    packDate: '',
    grower: '',
    variety: '',
    receiveDate: '',
    inspectionTime: '',
    sampleTime: '',
    status: '',
    sampleSize: '',
    lotNumber: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Load existing inspection data for edit mode
  useEffect(() => {
    if (isEditMode && existingInspection) {
      setFormData({
        commodityName: existingInspection.commodity || '',
        controlPointName: existingInspection.controlPointName || '',
        inspectedBy: existingInspection.inspector || '',
        facility: existingInspection.facility || '',
        packDate: existingInspection.packDate || '',
        grower: existingInspection.grower || '',
        variety: existingInspection.variety || '',
        receiveDate: existingInspection.date || '',
        inspectionTime: existingInspection.inspectionTime || '',
        sampleTime: existingInspection.sampleTime || '',
        status: existingInspection.status || '',
        sampleSize: existingInspection.sampleSize?.toString() || '',
        lotNumber: existingInspection.lotNumber || '',
      });
    }
  }, [isEditMode, existingInspection]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.commodityName) newErrors.commodityName = 'Requis';
    if (!formData.inspectedBy) newErrors.inspectedBy = 'Requis';
    if (!formData.grower) newErrors.grower = 'Requis';
    if (!formData.variety) newErrors.variety = 'Requis';
    if (!formData.receiveDate) newErrors.receiveDate = 'Requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildInspectionFromForm = (): Partial<Inspection> => {
    return {
      variety: formData.variety,
      commodity: formData.commodityName,
      grower: formData.grower,
      inspector: formData.inspectedBy,
      date: formData.receiveDate,
      status: (formData.status || 'Accepté') as InspectionStatus,
      facility: formData.facility,
      sampleSize: formData.sampleSize ? parseInt(formData.sampleSize) : 100,
      lotNumber: formData.lotNumber,
      controlPointName: formData.controlPointName,
      packDate: formData.packDate,
      inspectionTime: formData.inspectionTime,
      sampleTime: formData.sampleTime,
    };
  };

  const handleCompleteOtherInfo = () => {
    if (!validateForm()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    localStorage.setItem('inspectionBasicInfo', JSON.stringify(formData));
    setSelectedInspectionId(isEditMode ? editId! : 'new');
    setCurrentView('details');
    toast.success('Passez à la section 2 : Analyse des défauts');
  };

  const handleSaveInspection = () => {
    if (!validateForm()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const data = buildInspectionFromForm();

    if (isEditMode && editId) {
      updateInspection(editId, data);
      setCurrentView('inspections');
    } else {
      const newInspection: Inspection = {
        id: Date.now().toString(),
        image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=800',
        qualityScore: 85,
        ...data,
      } as Inspection;
      addInspection(newInspection);
      setCurrentView('inspections');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back button */}
      <button
        onClick={() => setCurrentView(isEditMode ? 'inspections' : 'dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        {isEditMode ? 'Retour aux inspections' : 'Retour au tableau de bord'}
      </button>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isEditMode ? (
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Edit3 className="size-5 text-blue-600" />
              </div>
            ) : (
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {isEditMode ? 'Modifier l\'inspection' : 'Nouvelle inspection'}
            </h2>
          </div>
          <p className="text-slate-500 text-sm md:text-base ml-13">
            {isEditMode
              ? `Modification de l'inspection #${editId}`
              : 'Saisissez les détails du lot et effectuez l\'analyse qualité'
            }
          </p>
        </div>
        {isEditMode && existingInspection && (
          <Badge variant={
            existingInspection.status === 'Accepté' ? 'success' :
            existingInspection.status === 'Avertissement' ? 'warning' : 'danger'
          } size="lg">
            {existingInspection.status}
          </Badge>
        )}
      </div>

      {/* Form Card */}
      <Card padding="none" className="overflow-hidden">
        <div className="bg-linear-to-r from-primary/5 to-transparent p-6 md:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Section 1 : {isEditMode ? 'Modifier les informations' : 'Informations de base'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Modifiez les informations ci-dessous' : 'Détails généraux de l\'inspection'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <Input
            label="Commodity Name"
            required
            placeholder="ex: CLEMENTINE"
            value={formData.commodityName}
            onChange={(e) => handleChange('commodityName', e.target.value)}
            error={errors.commodityName}
          />

          <Input
            label="Control Point Name"
            value={formData.controlPointName}
            onChange={(e) => handleChange('controlPointName', e.target.value)}
            placeholder="ex: Point de contrôle A"
          />

          <Input
            label="Inspected By"
            required
            value={formData.inspectedBy}
            onChange={(e) => handleChange('inspectedBy', e.target.value)}
            placeholder="Nom de l'inspecteur"
            error={errors.inspectedBy}
          />

          <Input
            label="Facility"
            value={formData.facility}
            onChange={(e) => handleChange('facility', e.target.value)}
            placeholder="ex: Station Alpha - Baie 4"
          />

          <Input
            label="Pack Date"
            type="date"
            value={formData.packDate}
            onChange={(e) => handleChange('packDate', e.target.value)}
          />

          <Input
            label="Grower"
            required
            value={formData.grower}
            onChange={(e) => handleChange('grower', e.target.value)}
            placeholder="Nom du producteur"
            error={errors.grower}
          />

          <Input
            label="Variety"
            required
            placeholder="ex: Code 1 - BRUNO"
            value={formData.variety}
            onChange={(e) => handleChange('variety', e.target.value)}
            error={errors.variety}
          />

          <Input
            label="Receive Date"
            type="date"
            required
            value={formData.receiveDate}
            onChange={(e) => handleChange('receiveDate', e.target.value)}
            error={errors.receiveDate}
          />

          <Input
            label="Inspection Time"
            type="datetime-local"
            value={formData.inspectionTime}
            onChange={(e) => handleChange('inspectionTime', e.target.value)}
          />

          <Input
            label="Sample Time"
            type="datetime-local"
            value={formData.sampleTime}
            onChange={(e) => handleChange('sampleTime', e.target.value)}
          />

          {/* Additional fields for edit mode */}
          {isEditMode && (
            <>
              <Select
                label="Statut"
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: INSPECTION_STATUS.ACCEPTED, label: 'Accepté' },
                  { value: INSPECTION_STATUS.WARNING, label: 'Avertissement' },
                  { value: INSPECTION_STATUS.REJECTED, label: 'Rejeté' },
                ]}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />

              <Input
                label="N° de Lot"
                value={formData.lotNumber}
                onChange={(e) => handleChange('lotNumber', e.target.value)}
                placeholder="ex: V-OR-2023-X92"
              />

              <Input
                label="Taille échantillon"
                type="number"
                value={formData.sampleSize}
                onChange={(e) => handleChange('sampleSize', e.target.value)}
                placeholder="100"
                min="1"
              />
            </>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 md:p-8 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentView(isEditMode ? 'inspections' : 'dashboard')}
            icon={<ArrowLeft className="size-4" />}
          >
            Annuler
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={handleSaveInspection}
              icon={<Save className="size-4" />}
            >
              {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer'}
            </Button>

            <Button
              variant="primary"
              onClick={handleCompleteOtherInfo}
              icon={<ArrowRight className="size-4" />}
              iconPosition="right"
            >
              Compléter l'analyse
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
