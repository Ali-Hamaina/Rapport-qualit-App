const API_BASE = '/api';

export async function fetchInspections() {
  const res = await fetch(`${API_BASE}/inspections`);
  if (!res.ok) throw new Error('Failed to fetch inspections');
  return res.json();
}

export async function fetchInspection(id: string) {
  const res = await fetch(`${API_BASE}/inspections/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch inspection');
  return res.json();
}

export async function saveInspection(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save inspection');
  return res.json();
}

export async function updateInspection(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/inspections/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update inspection');
  return res.json();
}

export async function deleteInspection(id: string) {
  const res = await fetch(`${API_BASE}/inspections/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inspection');
  return res.json();
}

export async function uploadPhotos(inspectionId: string, files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }
  const res = await fetch(`${API_BASE}/inspections/${encodeURIComponent(inspectionId)}/photos`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload photos');
  const data = await res.json();
  return data.photos as string[];
}

export async function deletePhotos(inspectionId: string) {
  const res = await fetch(`${API_BASE}/inspections/${encodeURIComponent(inspectionId)}/photos`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete photos');
  return res.json();
}
