const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

// Backup configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const MONGODB_URI = process.env.MONGODB_URI;
const RETENTION_DAYS = 30;
const MONTHLY_RETENTION_MONTHS = 12;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a full database backup
 */
async function createBackup(type = 'daily') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `techbridge-${type}-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`Starting ${type} backup: ${backupName}`);

    // Use mongodump to create backup
    const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;
    
    await execPromise(command);

    // Compress the backup
    const archiveName = `${backupName}.tar.gz`;
    const archivePath = path.join(BACKUP_DIR, archiveName);
    
    if (process.platform === 'win32') {
      // Windows: use 7-zip if available, otherwise skip compression
      try {
        await execPromise(`7z a "${archivePath}" "${backupPath}"`);
      } catch (err) {
        console.log('Compression skipped (7-zip not found)');
      }
    } else {
      // Unix: use tar
      await execPromise(`tar -czf "${archivePath}" -C "${BACKUP_DIR}" "${backupName}"`);
    }

    // Remove uncompressed backup folder
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }

    console.log(`✅ Backup completed: ${archiveName}`);
    
    // Clean old backups
    await cleanOldBackups(type);

    return {
      success: true,
      backupName: archiveName,
      path: archivePath,
      size: fs.existsSync(archivePath) ? fs.statSync(archivePath).size : 0
    };

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean old backups based on retention policy
 */
async function cleanOldBackups(type) {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    
    const retentionMs = type === 'monthly' 
      ? MONTHLY_RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000
      : RETENTION_DAYS * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      if (file.startsWith(`techbridge-${type}-`)) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > retentionMs) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    });

  } catch (error) {
    console.error('Error cleaning old backups:', error.message);
  }
}

/**
 * Restore database from backup
 */
async function restoreBackup(backupName) {
  try {
    const archivePath = path.join(BACKUP_DIR, backupName);
    
    if (!fs.existsSync(archivePath)) {
      throw new Error('Backup file not found');
    }

    console.log(`Starting restore from: ${backupName}`);

    // Extract backup
    const extractPath = path.join(BACKUP_DIR, 'temp_restore');
    
    if (process.platform === 'win32') {
      await execPromise(`7z x "${archivePath}" -o"${extractPath}"`);
    } else {
      await execPromise(`tar -xzf "${archivePath}" -C "${BACKUP_DIR}"`);
    }

    // Restore using mongorestore
    const command = `mongorestore --uri="${MONGODB_URI}" --drop "${extractPath}"`;
    await execPromise(command);

    // Clean up extracted files
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }

    console.log(`✅ Restore completed successfully`);
    
    return {
      success: true,
      message: 'Database restored successfully'
    };

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List available backups
 */
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.startsWith('techbridge-') && file.endsWith('.tar.gz'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.mtime,
          type: file.includes('-daily-') ? 'daily' : file.includes('-monthly-') ? 'monthly' : 'manual'
        };
      })
      .sort((a, b) => b.created - a.created);

    return backups;

  } catch (error) {
    console.error('Error listing backups:', error.message);
    return [];
  }
}

/**
 * Schedule automatic backups
 */
function scheduleBackups() {
  // Daily backup at 2 AM
  const dailyBackupHour = 2;
  const now = new Date();
  const nextDailyBackup = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (now.getHours() >= dailyBackupHour ? 1 : 0),
    dailyBackupHour,
    0,
    0
  );
  
  const timeUntilDaily = nextDailyBackup - now;
  
  setTimeout(() => {
    createBackup('daily');
    // Repeat every 24 hours
    setInterval(() => createBackup('daily'), 24 * 60 * 60 * 1000);
  }, timeUntilDaily);

  console.log(`📅 Daily backup scheduled for ${nextDailyBackup.toLocaleString()}`);

  // Monthly backup on 1st of each month at 1 AM
  const checkMonthlyBackup = () => {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 1) {
      createBackup('monthly');
    }
  };

  // Check every hour
  setInterval(checkMonthlyBackup, 60 * 60 * 1000);
  console.log(`📅 Monthly backup scheduled for 1st of each month at 1:00 AM`);
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  scheduleBackups
};
