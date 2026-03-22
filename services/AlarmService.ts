import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';

/**
 * imported SQLite from expo-sqlite, download audio from expo-av, accelerometer for the steps. 
 * Matched to data structures found in ProfileScreen.tsx
 */

export interface ProtocolItem {
  id?: number;
  title: string;
  time: string;
  icon: string;
  enabled: number; // 0 or 1 for SQLite compatibility
}

//ProtocolItem interface [id, title, time, icon, enabled) defining the type of the export ]
export interface LifeLogEntry {
  id?: number;
  date: string;
  text: string;
  happiness: number;
  deepWork: number;
}

export interface SleepEntry {
  id?: number;
  date: string;
  waketime: number;
  sleeptime: number;
}

export interface AppTask {
  id: number;
  text: string;
  category: string;
  completed: number; // 0 or 1
  date: string;
}

//lifelogentry is similar item with type id, date, text, happiness, deepwork 

const DB_NAME = 'chrono_db';
const db = SQLite.openDatabaseSync(DB_NAME);

// database name is called chrono_db, db is initallised sqlite.opendatabasesync it check the database in the mobile and then syncs, 

/**
 * Database Initialization
 * Ensures persistence for the Discipline Protocol and Life Logs
 */


// below is initialise the databse 


//explain what is journal_mode ? two table are initalised called protocols and life_logs protocls has 4 colums, idm title, time, icon this creates a list of items
// life_logs shows a history of your logs behaviour etc 

// async file is provided 

export const initDB = async (): Promise<void> => {
  // await db.execAsync('DROP TABLE IF EXISTS sleep_entry;');
  // await db.execAsync('DROP TABLE IF EXISTS tasks;');
  // console.log("Tasks table dropped successfully.");
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
      CREATE TABLE IF NOT EXISTS sleep_entry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        waketime INTEGER NOT NULL, 
        sleeptime INTEGER NOT NULL 
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 1,
        date TEXT NOT NULL
      );
    `);


 

    // Seed default protocol data if table is empty
    const count: any = await db.getFirstAsync('SELECT COUNT(*) as count FROM protocols');
    // it says if any previous data is there else it initallies the data 
    if (count.count === 0) {
      await db.runAsync(
      'INSERT INTO protocols (title, time, icon, enabled) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        'Brain Check (Cognitive)', '3:00 AM', 'calculator-outline', 1,
        'Body Check (Physical)', '3:10 AM', 'fitness-outline', 1,
        'Time to Sleep', '9:00 PM', 'moon-outline', 1
      ]
    );
    }

    await seedTasks();

    // 2. Seed Sleep Data (March 1st to March 20th)
    const sleepCount: any = await db.getFirstAsync('SELECT COUNT(*) as count FROM sleep_entry');
    if (sleepCount.count === 0) {
      for (let i = 1; i <= 20; i++) {
        const day = i < 10 ? `0${i}` : `${i}`;
        const dateString = `2026-03-${day}`;
        
        // Using 420 (7:00 AM) and 720 (12:00 PM - noon?) 
        // Note: If you meant 12:00 AM (Midnight), use 0.
        await db.runAsync(
          'INSERT INTO sleep_entry (date, waketime, sleeptime) VALUES (?, ?, ?)',
          [dateString, 420, 720] 
        );
      }
      console.log('Seeded March sleep data successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize AlarmService Database:', error);
  }
};

/**
 * ALARM & AUDIO LOGIC
 * Manages the "Rise & Grind" high-fidelity alarm states
 */

// logic to run the alarm so far we have initailes only the databse 


let alarmSound: Audio.Sound | null = null;

// above we are getting the alarm sound from the app 

export const playAlarmSound = async (uri?: string): Promise<void> => {
  try {
    if (alarmSound) {
      await alarmSound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      uri ? { uri } : require('../assets/alarm/paino1.mp3'),
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    alarmSound = sound;
  } catch (error) {
    console.error('Error playing alarm sound:', error);
  }
};

// stop alarm 

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

// Fetch only incomplete tasks for today
export const getIncompleteTasks = async (): Promise<AppTask[]> => {
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync<AppTask>(
    'SELECT * FROM tasks WHERE completed = 0 AND date = ?', 
    [today]
  );
};

/**
 * LIFE LOG MANAGEMENT
 * Synchronized with ProfileScreen's "Life Log" activity feed
 */

// get life log from the table 

export const getLifeLogs = async (): Promise<LifeLogEntry[]> => {
  return await db.getAllAsync<LifeLogEntry>('SELECT * FROM life_logs ORDER BY id DESC');
};


// add life log message from the table 

export const addLifeLog = async (entry: Omit<LifeLogEntry, 'id'>): Promise<void> => {
  await db.runAsync(
    'INSERT INTO life_logs (date, text, happiness, deepWork) VALUES (?, ?, ?, ?)',
    [entry.date, entry.text, entry.happiness, entry.deepWork]
  );
};

/**
  Sleep Entry table
 */

// Get all sleep entries from the table
export const getSleepEntries = async (): Promise<SleepEntry[]> => {
  return await db.getAllAsync<SleepEntry>('SELECT * FROM sleep_entry ORDER BY date DESC');
};

export const  addSleepEntry = async (entry: Omit<SleepEntry, 'id'>): Promise<void> => {
  await db.runAsync(
    // This will Update if the date exists, or Insert if it doesn't
    'INSERT OR REPLACE INTO sleep_entry (date, waketime, sleeptime) VALUES (?, ?, ?)',
    [entry.date, entry.waketime, entry.sleeptime]
  );
};

// Delete a sleep entry (Useful for logging errors)
export const deleteSleepEntry = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM sleep_entry WHERE id = ?', [id]);
};

/**
 * SENSOR LOGIC (Body Check)
 * Uses Accelerometer for the "Physical" verification step
 */


// accelerator offing the alarm 

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
export const initializeService = async () => {
  await initDB();
};

export const updateTaskStatus = async (id: number, completed: boolean) => {
  await db.runAsync(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id]
  );
};

// Add a new task
export const addTask = async (text: string, category: string): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    'INSERT INTO tasks (text, category, completed, date) VALUES (?, ?, 0, ?)',
    [text, category, today]
  );
};

export const seedTasks = async (): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if tasks already exist
  const count: any = await db.getFirstAsync('SELECT COUNT(*) as count FROM tasks');
  
  if (count.count === 0) {
    console.log("Seeding initial task data...");
    const initialTasks = [
      // Work
      { text: 'Review Q1 Sprint Data', cat: 'work' },
      { text: 'Sync with Design Team', cat: 'work' },
      // Startup
      { text: 'Finalize Pitch Deck V3', cat: 'startup' },
      { text: 'Submit AWS Credits App', cat: 'startup' },
      // Family
      { text: 'Plan Sunday Dinner', cat: 'family' },
      { text: 'Buy Anniversary Flowers', cat: 'family' },
      // Personal
      { text: 'Gym: 5km Run', cat: 'personal' },
      { text: 'Read 10 Pages of "Deep Work"', cat: 'personal' },
       { text: 'Read 10 Pages of "Deep Work"', cat: 'morning' },
    ];

    for (const task of initialTasks) {
      await db.runAsync(
        'INSERT INTO tasks (text, category, completed, date) VALUES (?, ?, 0, ?)',
        [task.text, task.cat, today]
      );
    }
    console.log("Tasks seeded successfully.");
  }
};




export default {
  playAlarmSound,
  stopAlarmSound,
  getProtocols,
  toggleProtocol,
  getLifeLogs,
  addTask,
  addLifeLog,
  updateTaskStatus,
  getSleepEntries, // Added
  addSleepEntry,   // Added
  deleteSleepEntry,
  startBodyCheckMonitoring,
  initializeService,
  getIncompleteTasks
};