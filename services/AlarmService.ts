import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';

/**
 * SOURCE OF TRUTH INTERFACES
 * Matched to data structures found in ProfileScreen.tsx
 */

export interface ProtocolItem {
  id?: number;
  title: string;
  time: string;
  icon: string;
  enabled: number; // 0 or 1 for SQLite compatibility
}

export interface LifeLogEntry {
  id?: number;
  date: string;
  text: string;
  happiness: number;
  deepWork: number;
}

const DB_NAME = 'chrono_db';
const db = SQLite.openDatabaseSync(DB_NAME);

/**
 * Database Initialization
 * Ensures persistence for the Discipline Protocol and Life Logs
 */
export const initDB = async (): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS protocols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        time TEXT NOT NULL,
        icon TEXT NOT NULL,
        enabled INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS life_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        happiness INTEGER NOT NULL,
        deepWork INTEGER NOT NULL
      );
    `);

    // Seed default protocol data if table is empty
    const count: any = await db.getFirstAsync('SELECT COUNT(*) as count FROM protocols');
    if (count.count === 0) {
      await db.runAsync(
        'INSERT INTO protocols (title, time, icon, enabled) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
        ['Brain Check (Cognitive)', '3:00 AM', 'calculator-outline', 1],
        ['Body Check (Physical)', '3:10 AM', 'fitness-outline', 1],
        ['Time to Sleep', '9:00 PM', 'moon-outline', 1]
      );
    }
  } catch (error) {
    console.error('Failed to initialize AlarmService Database:', error);
  }
};

/**
 * ALARM & AUDIO LOGIC
 * Manages the "Rise & Grind" high-fidelity alarm states
 */
let alarmSound: Audio.Sound | null = null;

export const playAlarmSound = async (uri?: string): Promise<void> => {
  try {
    if (alarmSound) {
      await alarmSound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      uri ? { uri } : require('../assets/alarm_default.mp3'),
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    alarmSound = sound;
  } catch (error) {
    console.error('Error playing alarm sound:', error);
  }
};

export const stopAlarmSound = async (): Promise<void> => {
  if (alarmSound) {
    await alarmSound.stopAsync();
    await alarmSound.unloadAsync();
    alarmSound = null;
  }
};

/**
 * PROTOCOL DATA MANAGEMENT
 * Synchronized with ProfileScreen's "Discipline Protocol" section
 */
export const getProtocols = async (): Promise<ProtocolItem[]> => {
  return await db.getAllAsync<ProtocolItem>('SELECT * FROM protocols ORDER BY time ASC');
};

export const toggleProtocol = async (id: number, enabled: boolean): Promise<void> => {
  await db.runAsync('UPDATE protocols SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
};

/**
 * LIFE LOG MANAGEMENT
 * Synchronized with ProfileScreen's "Life Log" activity feed
 */
export const getLifeLogs = async (): Promise<LifeLogEntry[]> => {
  return await db.getAllAsync<LifeLogEntry>('SELECT * FROM life_logs ORDER BY id DESC');
};

export const addLifeLog = async (entry: Omit<LifeLogEntry, 'id'>): Promise<void> => {
  await db.runAsync(
    'INSERT INTO life_logs (date, text, happiness, deepWork) VALUES (?, ?, ?, ?)',
    [entry.date, entry.text, entry.happiness, entry.deepWork]
  );
};

/**
 * SENSOR LOGIC (Body Check)
 * Uses Accelerometer for the "Physical" verification step
 */
export const startBodyCheckMonitoring = (onThresholdMet: () => void) => {
  Accelerometer.setUpdateInterval(100);
  const subscription = Accelerometer.addListener((data) => {
    const totalForce = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    if (totalForce > 2.5) { // Threshold for vigorous movement (shaking/walking)
      onThresholdMet();
    }
  });
  return subscription;
};

// Initialize on service load
initDB();

export default {
  playAlarmSound,
  stopAlarmSound,
  getProtocols,
  toggleProtocol,
  getLifeLogs,
  addLifeLog,
  startBodyCheckMonitoring
};