import type { ExportEnvelope, Profile } from '@/domain/types';
import { exportEnvelopeSchema } from '@/domain/schema';

export function buildEnvelope(profiles: Profile[]): ExportEnvelope {
  return {
    version: 1,
    exportedAt: Date.now(),
    profiles,
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Parse and validate JSON text into a typed export envelope. */
export function parseEnvelope(text: string): ExportEnvelope {
  const raw = JSON.parse(text);
  return exportEnvelopeSchema.parse(raw);
}

/** Read a File as UTF-8 text. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsText(file);
  });
}

export function filenameForProfile(p: Profile): string {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'profile';
  const date = new Date().toISOString().slice(0, 10);
  return `crimson-ledger-${slug}-${date}.json`;
}

export function filenameForAll(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `crimson-ledger-all-${date}.json`;
}
