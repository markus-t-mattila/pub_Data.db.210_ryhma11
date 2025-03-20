import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

export const getFile = async (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.filename);

  try {
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (!err) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            }
          });
        } else {
          console.error('Download error:', err);
        }
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};