import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

export const jsonToCsv = (json, headerColumns) => {
  const replacer = (value) => (value === null ? '' : value);
  const header = headerColumns.join(',');

  const rows = json.map(row =>
    Object.values(row)
      .map(value => replacer(value))
      .join(',')
  );

  return [header, ...rows].join('\r\n');
};

export const createFileWithContent = async (stringContent, extension = 'txt') => {
  if (!extension.startsWith('.')) extension = `.${extension}`;

  const id = Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString().replace(/[:T]/g, '_').split('.')[0];
  const filename = `EXPORT_${id}_${timestamp}${extension}`;
  const filePath = path.join(DATA_DIR, filename);

  await fs.mkdir(DATA_DIR, { recursive: true });

  const utf8Content = '\uFEFF' + stringContent;

  await fs.writeFile(filePath, utf8Content, 'utf8');

  return filename;
};