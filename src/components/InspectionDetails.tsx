import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  Plus,
  Trash2,
  Camera,
  Printer,
  CheckCircle2,
  X,
  Info,
  ArrowLeft,
  Beaker,
  ClipboardList,
  ImageIcon,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, CardHeader, Input, Button, Badge } from './ui';
import { DEFAULT_SAMPLE_SIZE } from '../constants';
import { Inspection, InspectionStatus, DefectEntry, SampleEntry } from '../types';
import { uploadPhotos } from '../api';

interface InspectionDetailsProps {
  id: string;
}

const seriousDefectsTemplate = [
  { id: '1', name: 'POURRITURE', units: 0, percentage: 0 },
  { id: '2', name: 'BLESSURE', units: 0, percentage: 0 },
  { id: '3', name: 'CERATITE', units: 0, percentage: 0 },
  { id: '4', name: 'Alternaria', units: 0, percentage: 0 },
];

const nonSeriousDefectsTemplate = [
  { id: '5', name: 'ACARIEN', units: 0, percentage: 0 },
  { id: '6', name: 'DEGAT D\'ESCARGOT', units: 0, percentage: 0 },
  { id: '7', name: 'FRUIT MOUS', units: 0, percentage: 0 },
  { id: '8', name: 'DEFAUT OMBILIC', units: 0, percentage: 0 },
  { id: '9', name: 'DEFAUT DE COLORATION', units: 0, percentage: 0 },
  { id: '10', name: 'OLEOCELLOSE', units: 0, percentage: 0 },
  { id: '11', name: 'MINEUSE', units: 0, percentage: 0 },
  { id: '12', name: 'AFFAISSEMENT', units: 0, percentage: 0 },
  { id: '13', name: 'GAUFRAGE', units: 0, percentage: 0 },
  { id: '14', name: 'MARBRURES', units: 0, percentage: 0 },
  { id: '15', name: 'PEDONCULE LONG', units: 0, percentage: 0 },
  { id: '16', name: 'FRUIT SANS CALICE', units: 0, percentage: 0 },
  { id: '17', name: 'FUMAGINE', units: 0, percentage: 0 },
  { id: '18', name: 'PEAU FINE', units: 0, percentage: 0 },
  { id: '19', name: 'BRUNISSEMENT', units: 0, percentage: 0 },
  { id: '20', name: 'FRUIT BOUFSSOUFLE', units: 0, percentage: 0 },
  { id: '21', name: 'PEAU RUGUEUSE', units: 0, percentage: 0 },
  { id: '22', name: 'THRIPS', units: 0, percentage: 0 },
  { id: '23', name: 'POU DE CALIFORNIE', units: 0, percentage: 0 },
  { id: '24', name: 'COUP DE SOLEIL', units: 0, percentage: 0 },
];

export const InspectionDetails: React.FC<InspectionDetailsProps> = ({ id }) => {
  const { toast, setCurrentView, inspections, addInspection, updateInspection } = useApp();
  const isEditMode = id !== 'new';
  const existingInspection = isEditMode ? inspections.find(i => i.id === id) : null;
  
  const [sampleSize, setSampleSize] = useState(DEFAULT_SAMPLE_SIZE);
  const [seriousDefects, setSeriousDefects] = useState<DefectEntry[]>(seriousDefectsTemplate);
  const [nonSeriousDefects, setNonSeriousDefects] = useState<DefectEntry[]>(nonSeriousDefectsTemplate);
  const [samples, setSamples] = useState<SampleEntry[]>([
    { id: '1', name: 'Sample 1', boxWeight: '', brix: '', ringSizes: '', comments: '' }
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [pendingInspectionId, setPendingInspectionId] = useState<string>('');
  const [newDefectName, setNewDefectName] = useState('');
  const [showAddDefect, setShowAddDefect] = useState(false);

  // Load existing data
  useEffect(() => {
    if (isEditMode && existingInspection) {
      if (existingInspection.inspectionSampleSize) setSampleSize(existingInspection.inspectionSampleSize);
      if (existingInspection.seriousDefects?.length) setSeriousDefects(existingInspection.seriousDefects);
      if (existingInspection.nonSeriousDefects?.length) setNonSeriousDefects(existingInspection.nonSeriousDefects);
      if (existingInspection.samples?.length) setSamples(existingInspection.samples);
      if (existingInspection.photos?.length) setPhotos(existingInspection.photos);
    }
  }, [id]);

  const calculatePercentage = (units: number) => {
    return sampleSize > 0 ? (units / sampleSize) * 100 : 0;
  };

  const handleDefectChange = (
    defectId: string,
    value: number,
    isSerious: boolean
  ) => {
    const updater = (defects: DefectEntry[]) =>
      defects.map(d =>
        d.id === defectId
          ? { ...d, units: value, percentage: calculatePercentage(value) }
          : d
      );

    if (isSerious) {
      setSeriousDefects(updater);
    } else {
      setNonSeriousDefects(updater);
    }
  };

  const handleSampleSizeChange = (newSize: number) => {
    setSampleSize(newSize);
    // Recalculate all percentages
    const recalculate = (defects: DefectEntry[]) =>
      defects.map(d => ({ ...d, percentage: (d.units / newSize) * 100 }));
    
    setSeriousDefects(recalculate);
    setNonSeriousDefects(recalculate);
  };

  const addCustomDefect = () => {
    if (!newDefectName.trim()) return;
    
    const newDefect: DefectEntry = {
      id: Date.now().toString(),
      name: newDefectName.toUpperCase(),
      units: 0,
      percentage: 0,
    };
    
    setNonSeriousDefects(prev => [...prev, newDefect]);
    setNewDefectName('');
    setShowAddDefect(false);
    toast.success('Défaut personnalisé ajouté');
  };

  const removeCustomDefect = (defectId: string) => {
    setNonSeriousDefects(prev => prev.filter(d => d.id !== defectId));
    toast.success('Défaut supprimé');
  };

  const addSample = () => {
    const newSample: SampleEntry = {
      id: Date.now().toString(),
      name: `Sample ${samples.length + 1}`,
      boxWeight: '',
      brix: '',
      ringSizes: '',
      comments: '',
    };
    setSamples(prev => [...prev, newSample]);
    toast.success('Échantillon ajouté');
  };

  const removeSample = (sampleId: string) => {
    if (samples.length === 1) {
      toast.warning('Vous devez avoir au moins un échantillon');
      return;
    }
    setSamples(prev => prev.filter(s => s.id !== sampleId));
    toast.success('Échantillon supprimé');
  };

  const updateSample = (sampleId: string, field: keyof SampleEntry, value: string) => {
    setSamples(prev =>
      prev.map(s => (s.id === sampleId ? { ...s, [field]: value } : s))
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray: File[] = Array.from(files);
      // Determine the inspection ID (existing or future)
      const inspectionId = isEditMode && existingInspection ? existingInspection.id : (pendingInspectionId || Date.now().toString());
      if (!isEditMode) setPendingInspectionId(inspectionId);
      
      try {
        const paths = await uploadPhotos(inspectionId, fileArray);
        setPhotos(prev => [...prev, ...paths]);
        toast.success(`${files.length} photo(s) ajoutée(s)`);
      } catch {
        // Fallback to base64 if server is not available
        fileArray.forEach((file: File) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotos(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
        toast.success(`${files.length} photo(s) ajoutée(s) (local)`);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const totalSeriousDefects = seriousDefects.reduce((sum, d) => sum + d.units, 0);
  const totalSeriousPercentage = seriousDefects.reduce((sum, d) => sum + d.percentage, 0);
  const totalNonSeriousDefects = nonSeriousDefects.reduce((sum, d) => sum + d.units, 0);
  const totalNonSeriousPercentage = nonSeriousDefects.reduce((sum, d) => sum + d.percentage, 0);
  const totalDefects = totalSeriousDefects + totalNonSeriousDefects;
  const totalPercentage = totalSeriousPercentage + totalNonSeriousPercentage;

  const handleSaveInspection = () => {
    const section2Data: Partial<Inspection> = {
      inspectionSampleSize: sampleSize,
      seriousDefects,
      nonSeriousDefects,
      samples,
      photos,
    };

    if (isEditMode && existingInspection) {
      updateInspection(id, section2Data);
      setCurrentView('inspections');
    } else {
      // New inspection: combine basic info from localStorage + section 2
      const basicInfoStr = localStorage.getItem('inspectionBasicInfo');
      const basicInfo = basicInfoStr ? JSON.parse(basicInfoStr) : {};
      const newInspection: Inspection = {
        id: pendingInspectionId || Date.now().toString(),
        variety: basicInfo.variety || '',
        commodity: basicInfo.commodityName || '',
        grower: basicInfo.grower || '',
        inspector: basicInfo.inspectedBy || '',
        date: basicInfo.receiveDate || new Date().toISOString().split('T')[0],
        status: (basicInfo.status || 'Accepté') as InspectionStatus,
        image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=800',
        qualityScore: 85,
        sampleSize: basicInfo.sampleSize ? parseInt(basicInfo.sampleSize) : 100,
        lotNumber: basicInfo.lotNumber || '',
        facility: basicInfo.facility || '',
        controlPointName: basicInfo.controlPointName || '',
        packDate: basicInfo.packDate || '',
        inspectionTime: basicInfo.inspectionTime || '',
        sampleTime: basicInfo.sampleTime || '',
        ...section2Data,
      };
      addInspection(newInspection);
      localStorage.removeItem('inspectionBasicInfo');
      setCurrentView('inspections');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 md:pb-20">
      {/* Back button */}
      <button
        onClick={() => setCurrentView(isEditMode ? 'inspections' : 'create')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        {isEditMode ? 'Retour aux inspections' : 'Retour à la section 1'}
      </button>

      {/* Page Header - same style as Section 1 */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Section 2 : Analyse des défauts
            </h2>
          </div>
          <p className="text-slate-500 text-sm md:text-base ml-13">
            Analyse détaillée des défauts critiques et graves
          </p>
        </div>
      </div>

      {/* Sample Size - styled like Section 1 form card */}
      <Card padding="none" className="overflow-hidden mb-6 md:mb-8">
        <div className="bg-linear-to-r from-primary/5 to-transparent p-4 md:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900">Taille de l'échantillon</h3>
              <p className="text-xs text-slate-500">Nombre total d'unités inspectées</p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <Input
            label="Sample Size"
            type="number"
            value={sampleSize.toString()}
            onChange={(e) => handleSampleSizeChange(parseInt(e.target.value) || 0)}
            className="w-48"
            min="1"
          />
        </div>
      </Card>

      {/* Serious Defects - styled like Section 1 form card */}
      <Card padding="none" className="overflow-hidden mb-6 md:mb-8">
        <div className="bg-linear-to-r from-red-500/5 to-transparent p-4 md:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Serious Defects</h3>
              <p className="text-xs text-slate-500">Défauts critiques et graves</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {seriousDefects.map((defect) => (
              <DefectRow
                key={defect.id}
                defect={defect}
                sampleSize={sampleSize}
                onChange={(value) => handleDefectChange(defect.id, value, true)}
              />
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-red-50 rounded-lg p-3 md:p-4">
            <span className="font-bold text-slate-900 text-sm md:text-base">Total Serious Defects</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">{totalSeriousDefects}</span>
              <Badge variant="danger" size="lg">
                {totalSeriousPercentage.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Non-Serious Defects - styled like Section 1 form card */}
      <Card padding="none" className="overflow-hidden mb-6 md:mb-8">
        <div className="bg-linear-to-r from-amber-500/5 to-transparent p-4 md:p-8 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="size-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Non-Serious Defects</h3>
                <p className="text-xs text-slate-500">Défauts mineurs</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDefect(true)}
              icon={<Plus className="size-4" />}
            >
              Ajouter défaut
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {nonSeriousDefects.map((defect) => (
              <DefectRow
                key={defect.id}
                defect={defect}
                sampleSize={sampleSize}
                onChange={(value) => handleDefectChange(defect.id, value, false)}
                onRemove={
                  parseInt(defect.id) > 24
                    ? () => removeCustomDefect(defect.id)
                    : undefined
                }
              />
            ))}
          </div>
          
          {showAddDefect && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg flex gap-2">
              <Input
                placeholder="Nom du défaut personnalisé"
                value={newDefectName}
                onChange={(e) => setNewDefectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomDefect()}
              />
              <Button onClick={addCustomDefect} size="sm">
                Ajouter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddDefect(false);
                  setNewDefectName('');
                }}
              >
                Annuler
              </Button>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-amber-50 rounded-lg p-3 md:p-4">
            <span className="font-bold text-slate-900 text-sm md:text-base">Total Non-Serious Defects</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">{totalNonSeriousDefects}</span>
              <Badge variant="warning" size="lg">
                {totalNonSeriousPercentage.toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-100 rounded-lg p-3 md:p-4">
            <span className="font-bold text-base md:text-lg text-slate-900">Total Defects</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-slate-900">{totalDefects}</span>
              <Badge variant={totalPercentage > 15 ? 'danger' : totalPercentage > 5 ? 'warning' : 'success'} size="lg">
                {totalPercentage.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Samples Section - styled like Section 1 form card */}
      <Card padding="none" className="overflow-hidden mb-6 md:mb-8">
        <div className="bg-linear-to-r from-primary/5 to-transparent p-4 md:p-8 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Beaker className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Échantillons</h3>
                <p className="text-xs text-slate-500">Détails des échantillons individuels</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={addSample}
              icon={<Plus className="size-4" />}
            >
              Ajouter échantillon
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {samples.map((sample, index) => (
              <SampleCard
                key={sample.id}
                sample={sample}
                index={index}
                onUpdate={updateSample}
                onRemove={removeSample}
                canRemove={samples.length > 1}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Photos Section - styled like Section 1 form card */}
      <Card padding="none" className="overflow-hidden mb-6 md:mb-8">
        <div className="bg-linear-to-r from-primary/5 to-transparent p-4 md:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Photos d'inspection</h3>
              <p className="text-xs text-slate-500">Ajoutez des photos pour documenter l'inspection</p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <label className="col-span-2 aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors cursor-pointer p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Camera className="size-8 text-slate-400 mb-2" />
              <p className="text-xs font-medium text-slate-600 text-center">
                Ajouter ou déposer des images
              </p>
            </label>
            
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          variant="secondary"
          icon={<Printer className="size-5" />}
          className="w-full sm:w-auto"
        >
          Imprimer l'étiquette
        </Button>
        <Button
          variant="primary"
          icon={<CheckCircle2 className="size-5" />}
          onClick={handleSaveInspection}
          className="w-full sm:w-auto"
        >
          Soumettre le rapport final
        </Button>
      </div>
    </div>
  );
};

// Sub-components
const DefectRow: React.FC<{
  defect: DefectEntry;
  sampleSize: number;
  onChange: (value: number) => void;
  onRemove?: () => void;
}> = ({ defect, sampleSize, onChange, onRemove }) => {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 items-start sm:items-center bg-slate-50 rounded-lg p-3">
      <div className="sm:col-span-5 font-semibold text-slate-900 text-sm">
        {defect.name}
      </div>
      <div className="flex items-center gap-3 sm:contents w-full">
        <div className="flex-1 sm:col-span-3">
          <Input
            type="number"
            value={defect.units.toString()}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min="0"
            className="text-center"
          />
        </div>
        <div className="sm:col-span-3 text-right">
          <Badge variant={defect.percentage > 10 ? 'danger' : defect.percentage > 5 ? 'warning' : 'success'}>
            {defect.percentage.toFixed(2)}%
          </Badge>
        </div>
        {onRemove && (
          <div className="sm:col-span-1">
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SampleCard: React.FC<{
  sample: SampleEntry;
  index: number;
  onUpdate: (id: string, field: keyof SampleEntry, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}> = ({ sample, index, onUpdate, onRemove, canRemove }) => {
  return (
    <Card className="relative">
      {canRemove && (
        <button
          onClick={() => onRemove(sample.id)}
          className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      )}
      <h4 className="font-bold text-lg mb-4">{sample.name}</h4>
      <div className="space-y-4">
        <Input
          label="Box Weight (KG)"
          value={sample.boxWeight}
          onChange={(e) => onUpdate(sample.id, 'boxWeight', e.target.value)}
          placeholder="ex: 11,150"
        />
        <Input
          label="Brix"
          value={sample.brix}
          onChange={(e) => onUpdate(sample.id, 'brix', e.target.value)}
          placeholder="ex: 10,1"
        />
        <Input
          label="Ring Sizes"
          value={sample.ringSizes}
          onChange={(e) => onUpdate(sample.id, 'ringSizes', e.target.value)}
          placeholder="ex: 54-64"
        />
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Comments
          </label>
          <textarea
            value={sample.comments}
            onChange={(e) => onUpdate(sample.id, 'comments', e.target.value)}
            placeholder="Ajouter des commentaires..."
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
        </div>
      </div>
    </Card>
  );
};
