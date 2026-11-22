// Backup: one JSON file with the whole collection (photos included as data URIs).
// Phone: written to the cache and handed to the share sheet (save to iCloud Drive / Files).
// Web: downloaded as a file. Restore reads the same file back.
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

export const BACKUP_KIND = 'crown-backup';
export const BACKUP_VERSION = 1;

const fileName = () => {
  const d = new Date();
  return `crown-backup-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
};

export async function saveBackup(data: object): Promise<'shared' | 'downloaded'> {
  const json = JSON.stringify({ kind: BACKUP_KIND, version: BACKUP_VERSION, createdAt: new Date().toISOString(), data });
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return 'downloaded';
  }
  const f = new File(Paths.cache, fileName());
  if (f.exists) f.delete();
  f.create();
  f.write(json);
  await Sharing.shareAsync(f.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Crown backup' });
  return 'shared';
}

// Returns the saved data, or null if the user cancelled. Throws if the file is not a Crown backup.
export async function pickBackup(): Promise<Record<string, unknown> | null> {
  let text: string;
  if (Platform.OS === 'web') {
    const picked = await new Promise<globalThis.File | null>(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
    if (!picked) return null;
    text = await picked.text();
  } else {
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
    if (r.canceled || !r.assets?.length) return null;
    text = await new File(r.assets[0].uri).text();
  }
  const parsed = JSON.parse(text);
  if (parsed?.kind !== BACKUP_KIND || typeof parsed.data !== 'object' || !Array.isArray(parsed.data?.collection)) {
    throw new Error('not-a-backup');
  }
  return parsed.data as Record<string, unknown>;
}
