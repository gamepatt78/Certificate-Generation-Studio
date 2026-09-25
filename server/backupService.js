import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logAction } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../database');
const backupsDir = path.join(dbDir, 'backups');

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

/**
 * Creates a database backup file
 * @returns {Promise<string>} Path to the created backup file
 */
export const runBackup = async () => {
  const dbPath = path.join(dbDir, 'database.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.log('Database file does not exist yet. Skipping backup.');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const backupFileName = `database_backup_${today}.sqlite`;
  const backupPath = path.join(backupsDir, backupFileName);

  // Copy database file
  fs.copyFileSync(dbPath, backupPath);

  // Clean up backups older than 30 copies
  cleanOldBackups();

  await logAction('AUTO_BACKUP', `Successfully backed up database to backups/${backupFileName}`);
  console.log(`Database backup saved: backups/${backupFileName}`);
  return backupPath;
};

/**
 * Retains only the 30 most recent backups
 */
const cleanOldBackups = () => {
  try {
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.startsWith('database_backup_') && file.endsWith('.sqlite'))
      .map(file => ({
        name: file,
        path: path.join(backupsDir, file),
        time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // newest first

    const maxBackups = 30;
    if (files.length > maxBackups) {
      const toDelete = files.slice(maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
};

/**
 * Initializes the automated backup service.
 * Checks daily. If no backup exists for today, creates one.
 */
export const initBackupService = () => {
  // 1. Check if backup is needed immediately on start
  const checkAndBackup = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const backupFileName = `database_backup_${today}.sqlite`;
      const backupPath = path.join(backupsDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        console.log('Daily backup not found for today. Initiating backup...');
        await runBackup();
      }
    } catch (error) {
      console.error('Failed to run daily startup backup:', error);
    }
  };

  // Run initial check after db initializes
  setTimeout(checkAndBackup, 5000);

  // 2. Schedule to check every 12 hours
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(checkAndBackup, TWELVE_HOURS);
};
