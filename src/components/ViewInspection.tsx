import React from 'react';
import {
  ArrowLeft,
  Edit3,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Weight,
  Droplets,
  Ruler,
  User,
  MapPin,
  Calendar,
  Clock,
  Leaf,
  Package,
  ClipboardList,
  Beaker,
  Camera,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { Card, CardHeader, Badge, Button } from './ui';
import { Inspection } from '../types';
import { printInspectionReport } from './PrintReport';

interface ViewInspectionProps {
  id: string;
}

export const ViewInspection: React.FC<ViewInspectionProps> = ({ id }) => {
  const { inspections, setCurrentView, setSelectedInspectionId } = useApp();

  const inspection = inspections.find(i => i.id === id);

  if (!inspection) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <XCircle className="size-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Inspection introuvable</h2>
        <p className="text-slate-500 mb-6">L'inspection demandée n'existe pas ou a été supprimée.</p>
        <Button onClick={() => setCurrentView('inspections')}>
          Retour aux inspections
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setSelectedInspectionId(inspection.id);
    setCurrentView('edit');
  };

  const handlePrint = () => {
    printInspectionReport(inspection);
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Accepté') return 'success';
    if (status === 'Avertissement') return 'warning';
    return 'danger';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Accepté') return <CheckCircle2 className="size-5" />;
    if (status === 'Avertissement') return <AlertTriangle className="size-5" />;
    return <XCircle className="size-5" />;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const totalSeriousDefects = inspection.seriousDefects?.reduce((sum, d) => sum + d.units, 0) || 0;
  const totalSeriousPercentage = inspection.seriousDefects?.reduce((sum, d) => sum + d.percentage, 0) || 0;
  const totalNonSeriousDefects = inspection.nonSeriousDefects?.reduce((sum, d) => sum + d.units, 0) || 0;
  const totalNonSeriousPercentage = inspection.nonSeriousDefects?.reduce((sum, d) => sum + d.percentage, 0) || 0;
  const totalDefects = totalSeriousDefects + totalNonSeriousDefects;
  const totalPercentage = totalSeriousPercentage + totalNonSeriousPercentage;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => setCurrentView('inspections')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          Retour aux inspections
        </button>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Printer className="size-4" />} size="sm" onClick={handlePrint}>
            Imprimer
          </Button>
          <Button variant="primary" icon={<Edit3 className="size-4" />} size="sm" onClick={handleEdit}>
            Éditer
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <img
          src={inspection.image}
          alt={inspection.variety}
          className="w-full h-56 md:h-72 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Badge variant={getStatusVariant(inspection.status)} size="lg" className="mb-3">
                {getStatusIcon(inspection.status)}
                <span className="ml-1">{inspection.status}</span>
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                {inspection.commodity}
              </h1>
              <p className="text-white/80 text-sm">
                Lot #{inspection.id} &bull; {inspection.variety}
              </p>
            </div>
            {inspection.qualityScore !== undefined && (
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                <p className="text-xs text-white/70 uppercase font-bold tracking-wider">Score</p>
                <p className={cn(
                  "text-3xl font-black",
                  inspection.qualityScore >= 80 ? "text-emerald-400" :
                  inspection.qualityScore >= 60 ? "text-amber-400" : "text-red-400"
                )}>
                  {inspection.qualityScore}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== SECTION 1: Informations de base ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Section 1 : Informations de base</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <Card padding="none">
            <CardHeader title="Informations générales" icon={<Package className="size-5 text-primary" />} />
            <div className="px-6 pb-6 space-y-4">
              <InfoRow icon={<Package className="size-4" />} label="Commodity" value={inspection.commodity} />
              <InfoRow icon={<Leaf className="size-4" />} label="Variété" value={inspection.variety} />
              <InfoRow icon={<User className="size-4" />} label="Producteur" value={inspection.grower} />
              <InfoRow icon={<User className="size-4" />} label="Inspecteur" value={inspection.inspector} />
              {inspection.facility && (
                <InfoRow icon={<MapPin className="size-4" />} label="Établissement" value={inspection.facility} />
              )}
              {inspection.lotNumber && (
                <InfoRow icon={<Package className="size-4" />} label="Batch Number" value={inspection.lotNumber} />
              )}
              {inspection.batchNumber && (
                <InfoRow icon={<Package className="size-4" />} label="Batch Number" value={inspection.batchNumber} />
              )}
              {inspection.controlPointName && (
                <InfoRow icon={<MapPin className="size-4" />} label="Point de contrôle" value={inspection.controlPointName} />
              )}
            </div>
          </Card>

          {/* Dates & Quantities */}
          <Card padding="none">
            <CardHeader title="Dates et quantités" icon={<Calendar className="size-5 text-primary" />} />
            <div className="px-6 pb-6 space-y-4">
              <InfoRow icon={<Calendar className="size-4" />} label="Date d'inspection" value={formatDate(inspection.date)} />
              {inspection.packDate && (
                <InfoRow icon={<Calendar className="size-4" />} label="Date d'emballage" value={formatDate(inspection.packDate)} />
              )}
              {inspection.inspectionTime && (
                <InfoRow icon={<Clock className="size-4" />} label="Heure d'inspection" value={inspection.inspectionTime} />
              )}
              {inspection.sampleTime && (
                <InfoRow icon={<Clock className="size-4" />} label="Heure échantillon" value={inspection.sampleTime} />
              )}
              {inspection.sampleSize && (
                <InfoRow icon={<Ruler className="size-4" />} label="Taille échantillon" value={`${inspection.sampleSize} unités`} />
              )}
            </div>

            {/* Quality Score Bar */}
            {inspection.qualityScore !== undefined && (
              <div className="mx-6 mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score de qualité</p>
                  <span className={cn(
                    "text-lg font-black",
                    inspection.qualityScore >= 80 ? "text-emerald-600" :
                    inspection.qualityScore >= 60 ? "text-amber-600" : "text-red-600"
                  )}>
                    {inspection.qualityScore}/100
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      inspection.qualityScore >= 80 ? "bg-emerald-500" :
                      inspection.qualityScore >= 60 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${inspection.qualityScore}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ===== SECTION 2: Analyse des défauts ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Section 2 : Analyse des défauts</h2>
        </div>

        {/* Sample Size */}
        {inspection.inspectionSampleSize && (
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Taille de l'échantillon</h3>
                <p className="text-sm text-slate-500">Nombre total d'unités inspectées</p>
              </div>
              <span className="text-2xl font-black text-primary">{inspection.inspectionSampleSize}</span>
            </div>
          </Card>
        )}

        {/* Serious Defects */}
        {inspection.seriousDefects && inspection.seriousDefects.length > 0 && (
          <Card padding="none" className="overflow-hidden mb-6">
            <div className="bg-linear-to-r from-red-500/5 to-transparent p-6 border-b border-slate-100">
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
              <div className="space-y-3">
                {inspection.seriousDefects.map((defect) => (
                  <div key={defect.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 rounded-lg p-3">
                    <div className="col-span-6 font-semibold text-slate-900">{defect.name}</div>
                    <div className="col-span-3 text-center font-bold text-slate-700">{defect.units}</div>
                    <div className="col-span-3 text-right">
                      <Badge variant={defect.percentage > 10 ? 'danger' : defect.percentage > 5 ? 'warning' : 'success'}>
                        {defect.percentage.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center bg-red-50 rounded-lg p-4">
                <span className="font-bold text-slate-900">Total Serious Defects</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">{totalSeriousDefects}</span>
                  <Badge variant="danger" size="lg">{totalSeriousPercentage.toFixed(2)}%</Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Non-Serious Defects */}
        {inspection.nonSeriousDefects && inspection.nonSeriousDefects.length > 0 && (
          <Card padding="none" className="overflow-hidden mb-6">
            <div className="bg-linear-to-r from-amber-500/5 to-transparent p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="size-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Non-Serious Defects</h3>
                  <p className="text-xs text-slate-500">Défauts mineurs</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {inspection.nonSeriousDefects.map((defect) => (
                  <div key={defect.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 rounded-lg p-3">
                    <div className="col-span-6 font-semibold text-slate-900">{defect.name}</div>
                    <div className="col-span-3 text-center font-bold text-slate-700">{defect.units}</div>
                    <div className="col-span-3 text-right">
                      <Badge variant={defect.percentage > 10 ? 'danger' : defect.percentage > 5 ? 'warning' : 'success'}>
                        {defect.percentage.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center bg-amber-50 rounded-lg p-4">
                <span className="font-bold text-slate-900">Total Non-Serious Defects</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">{totalNonSeriousDefects}</span>
                  <Badge variant="warning" size="lg">{totalNonSeriousPercentage.toFixed(2)}%</Badge>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-slate-100 rounded-lg p-4">
                <span className="font-bold text-lg text-slate-900">Total Defects</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-slate-900">{totalDefects}</span>
                  <Badge variant={totalPercentage > 15 ? 'danger' : totalPercentage > 5 ? 'warning' : 'success'} size="lg">
                    {totalPercentage.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Samples */}
        {inspection.samples && inspection.samples.length > 0 && (
          <Card padding="none" className="overflow-hidden mb-6">
            <div className="bg-linear-to-r from-primary/5 to-transparent p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Beaker className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Échantillons</h3>
                  <p className="text-xs text-slate-500">{inspection.samples.length} échantillon(s)</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inspection.samples.map((sample, index) => (
                  <Card key={sample.id} className="bg-slate-50">
                    <h4 className="font-bold text-lg mb-4">{sample.name}</h4>
                    <div className="space-y-3">
                      {sample.boxWeight && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Box Weight (KG)</span>
                          <span className="font-semibold">{sample.boxWeight}</span>
                        </div>
                      )}
                      {sample.brix && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Brix</span>
                          <span className="font-semibold">{sample.brix}</span>
                        </div>
                      )}
                      {sample.ringSizes && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Ring Sizes</span>
                          <span className="font-semibold">{sample.ringSizes}</span>
                        </div>
                      )}
                      {sample.comments && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 mb-1">Commentaires</p>
                          <p className="text-sm text-slate-700 bg-white rounded-lg p-3">{sample.comments}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Photos */}
        {inspection.photos && inspection.photos.length > 0 && (
          <Card padding="none" className="overflow-hidden mb-6">
            <div className="bg-linear-to-r from-primary/5 to-transparent p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Photos d'inspection</h3>
                  <p className="text-xs text-slate-500">{inspection.photos.length} photo(s)</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {inspection.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Message if no Section 2 data */}
        {!inspection.seriousDefects && !inspection.nonSeriousDefects && !inspection.samples && (
          <Card className="text-center py-8">
            <ClipboardList className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune donnée d'analyse des défauts</p>
            <p className="text-sm text-slate-400 mt-1">L'analyse des défauts n'a pas encore été complétée pour cette inspection.</p>
          </Card>
        )}
      </div>

      {/* Status Summary */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={cn(
            "size-16 rounded-2xl flex items-center justify-center",
            inspection.status === 'Accepté' ? 'bg-emerald-50 text-emerald-600' :
            inspection.status === 'Avertissement' ? 'bg-amber-50 text-amber-600' :
            'bg-red-50 text-red-600'
          )}>
            {getStatusIcon(inspection.status)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              {inspection.status === 'Accepté' && 'Inspection validée - Qualité conforme'}
              {inspection.status === 'Avertissement' && 'Attention requise - Seuils limites atteints'}
              {inspection.status === 'Rejeté' && 'Inspection rejetée - Non conforme aux normes'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {inspection.status === 'Accepté' && 'Ce lot respecte les standards de qualité pour l\'exportation.'}
              {inspection.status === 'Avertissement' && 'Ce lot nécessite une vérification supplémentaire avant expédition.'}
              {inspection.status === 'Rejeté' && 'Ce lot ne peut pas être expédié dans son état actuel.'}
            </p>
          </div>
          <Button variant="outline" icon={<Edit3 className="size-4" />} onClick={handleEdit}>
            Modifier
          </Button>
        </div>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="secondary"
          onClick={() => setCurrentView('inspections')}
          icon={<ArrowLeft className="size-4" />}
        >
          Retour à la liste
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          icon={<Printer className="size-4" />}
        >
          Imprimer le rapport
        </Button>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-400 shrink-0">{icon}</div>
    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 truncate text-right">{value}</span>
    </div>
  </div>
);
