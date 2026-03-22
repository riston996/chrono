import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // If using React Navigation
import { Ionicons } from '@expo/vector-icons';
// Note: Ensure AlarmService is correctly implemented in your services folder
import AlarmService from '../services/AlarmService'; 

const { width } = Dimensions.get('window');

// --- Interfaces ---
interface AlarmProps {
  time: string;
  condition: string;
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onSolve: () => void;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export interface AppTask {
  id: number;
  text: string;
  category: string;
  completed: number; // 0 or 1
  date: string;
}


const getWakeUpColor = (waketime: number | undefined) => {
  if (waketime === undefined) return '#1e293b'; // Empty/No data
  
  // Logic: 3am (dark green), 4am (blue), 5am (orange), 6am (dark orange), >6am (red)
  if (waketime <= 3) return '#064e3b'; // Dark Green
  if (waketime === 4) return '#3b82f6'; // Blue
  if (waketime === 5) return '#f59e0b'; // Orange
  if (waketime === 6) return '#d97706'; // Dark Orange
  return '#ef4444'; // Red (After 6)
};

// --- Sub-Components ---

const AlarmCard = ({ time, condition, active, icon, onSolve }: AlarmProps) => (
  <View style={[styles.alarmCard, active ? styles.activeAlarm : styles.inactiveAlarm]}>
    <View style={styles.alarmHeader}>
      <View>
        <Text style={[styles.alarmTime, !active && { color: '#64748b' }]}>{time}</Text>
        <View style={styles.badgeContainer}>
          <Ionicons name={icon} size={14} color={active ? "#00E5FF" : "#64748b"} />
          <Text style={[styles.badgeText, { color: active ? "#00E5FF" : "#64748b" }]}>
            {condition.toUpperCase()}
          </Text>
        </View>
      </View>
      {/* Visual Toggle Representation */}
      <View style={[styles.toggle, active ? styles.toggleOn : styles.toggleOff]}>
        <View style={[styles.toggleCircle, { alignSelf: active ? 'flex-end' : 'flex-start' }]} />
      </View>
    </View>

    {active && (
      <TouchableOpacity style={styles.solveButton} onPress={onSolve}>
        <Text style={styles.solveButtonText}>SOLVE TO STOP</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ConsistencyGrid = ({ entries }: { entries: any[] }) => {
  // We want to show a fixed grid (e.g., 98 squares). 
  // We fill the end of the array with our real data.
  const gridSlots = Array(98).fill(undefined);
  

  // Only run if entries exists and has length
  if (entries && entries.length > 0) {
    entries.forEach((entry, index) => {
      // Ensure we don't go out of bounds of our 98-square grid
      if (index < 98) {
        // 97 is the last index. This puts newest data at the bottom-right.
        gridSlots[97 - index] = entry.waketime;
      }
    });
  }

  return (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionLabel}>Wake-up Consistency (Last 90 Days)</Text>
      <View style={styles.githubGrid}>
        {gridSlots.map((waketime, i) => (
          <View key={i} style={[styles.gridSquare, { backgroundColor: getWakeUpColor(waketime) }]} />
        ))}
      </View>
      <View style={styles.gridFooter}>
        <Text style={styles.gridFooterText}>Late</Text>
        {[7, 6, 5, 4, 3].map(t => (
           <View key={t} style={[styles.miniSquare, { backgroundColor: getWakeUpColor(t) }]} />
        ))}
        <Text style={styles.gridFooterText}>Early</Text>
      </View>
      {/* Legend / Key Section */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Target:</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.miniSquare, { backgroundColor: getWakeUpColor(3) }]} />
            <Text style={styles.legendText}>3AM</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.miniSquare, { backgroundColor: getWakeUpColor(4) }]} />
            <Text style={styles.legendText}>4AM</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.miniSquare, { backgroundColor: getWakeUpColor(5) }]} />
            <Text style={styles.legendText}>5AM</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.miniSquare, { backgroundColor: getWakeUpColor(6) }]} />
            <Text style={styles.legendText}>6AM</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.miniSquare, { backgroundColor: getWakeUpColor(7) }]} />
            <Text style={styles.legendText}>7AM+</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// --- Main Screen ---

export default function MainScreen() {

  const [activeCategory, setActiveCategory] = useState('work');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todaysWakeTime, setTodaysWakeTime] = useState(5);
  const [sleepEntries, setSleepEntries] = useState<any[]>([]);
  const [dbTasks, setDbTasks] = useState<AppTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // To show/hide input

  // Fetch data from SQLite
  const loadSleepData = useCallback(async () => {
    try {
      const data = await AlarmService.getSleepEntries();
      setSleepEntries(data);
    } catch (error) {
      console.error("Failed to load sleep data", error);
    }
  }, []);

  // Load tasks from DB
  const loadTasks = async () => {
    const data = await AlarmService.getIncompleteTasks();
    setDbTasks(data);
  };

  React.useEffect(() => { loadTasks(); }, []);

  // Handler to add a task
  const handleAddTask = async (category: string) => {
    console.log(category,text)
    Alert.prompt("New Task", `Add to ${category}`, async (text) => {
      if (text) {
        await AlarmService.addTask(text, category);
        await loadTasks(); // Refresh list
      }
    });
  };

  const handleSaveTask = async (category: string) => {
  if (newTaskText.trim().length === 0) {
    setIsAddingTask(null);
    return;
  }

  try {
    await AlarmService.addTask(newTaskText, category);
    setNewTaskText(''); // Clear input
    setIsAddingTask(null); // Hide input
    await loadTasks(); // Refresh from DB
  } catch (error) {
    console.error("Failed to add task", error);
  }
};

  // Handler to toggle (and hide) task
  const handleToggleTask = async (id: number) => {
    await AlarmService.updateTaskStatus(id, true); // Mark as complete
    await loadTasks(); // Refresh (it will disappear because we only fetch completed = 0)
  };

  // Filtered lists for the UI
 

  // Load on mount
  React.useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  // 2. Logic to "fetch" the existing time for the selected date
React.useEffect(() => {
  const existingEntry = sleepEntries.find(e => e.date === selectedDate);
  if (existingEntry) {
    setTodaysWakeTime(existingEntry.waketime);
  } else {
    setTodaysWakeTime(5); // Default if no data exists for that day
  }
}, [selectedDate, sleepEntries]);

const handleSaveWakeUp = async () => {
  try {
    await AlarmService.addSleepEntry({
      date: selectedDate,
      waketime: todaysWakeTime,
      sleeptime: 0, 
    });
    
    const updatedData = await AlarmService.getSleepEntries();
    
    // --- MANUAL TABLE LOG ---
    // console.log(`\n==== DATABASE EXPORT: ${selectedDate} ====`);
    // if (updatedData.length === 0) {
    //   console.log("Table is empty.");
    // } else {
    //   updatedData.forEach((row, i) => {
    //     console.log(`[${i}] Date: ${row.date} | Wake: ${row.waketime}AM | ID: ${row.id}`);
    //   });
    // }
    // console.log(`==========================================\n`);

    setSleepEntries(updatedData);
    Alert.alert("Success", "Protocol updated.");
  } catch (error) {
    console.error("Failed to update wake-up time", error);
  }
};

 

  const activities = [
  // Work
  { id: '1', text: 'Review Q1 Sprint', category: 'work', completed: false },
  { id: '2', text: 'Client Onboarding Call', category: 'work', completed: true },
  { id: '3', text: 'Email Clean-up', category: 'work', completed: false },
  
  // Startup
  { id: '4', text: 'Pitch Deck V2 Edits', category: 'startup', completed: false },
  { id: '5', text: 'Founder Coffee @ 10am', category: 'startup', completed: false },
  { id: '6', text: 'AWS Architecture Review', category: 'startup', completed: true },

  // Family
  { id: '7', text: 'Buy Anniversary Gift', category: 'family', completed: false },
  { id: '8', text: 'Call Mom', category: 'family', completed: true },
  { id: '9', text: 'School Pickup @ 3pm', category: 'family', completed: false },

  // Personal
  { id: '10', text: 'Gym: Leg Day', category: 'personal', completed: false },
  { id: '11', text: 'Read 20 Pages', category: 'personal', completed: false },
  { id: '12', text: 'Meditation (10 min)', category: 'personal', completed: true },
];

  const categories = [
    { id: 'work', label: 'Work', color: '#4D96FF' },
    { id: 'startup', label: 'Startup', color: '#6BCB77' },
    { id: 'family', label: 'Family', color: '#FF6B6B' },
    { id: 'personal', label: 'Personal', color: '#FFD93D' },
  ];


  const filteredActivities = dbTasks.filter(t => t.category === activeCategory);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Deep Work Session (2 hours)', completed: true },
    { id: 2, text: 'Gym Workout (1 hour)', completed: false },
    { id: 3, text: 'Review Weekly Plan', completed: false },
  ]);

  const handleSolveStop = async () => {
    try {
      // Logic for AlarmService
      if (AlarmService?.stopAlarmSound) {
        await AlarmService.stopAlarmSound();
      }
      Alert.alert("Success", "Alarm deactivated. Time to conquer the day!");
    } catch (error) {
      console.error("Failed to stop alarm", error);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CHORNOS PROTOCOL</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionLabel}>Upcoming Alarms</Text>
        <View style={styles.alarmRow}>
          <AlarmCard 
            time="3:00 AM" 
            condition="3 Math Problems" 
            active={true} 
            icon="calculator"
            onSolve={handleSolveStop}
          />
          <AlarmCard 
            time="3:10 AM" 
            condition="100 Steps" 
            active={false} 
            icon="walk"
            onSolve={() => {}}
          />
        </View>

        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionLabel}>EDIT PROTOCOL LOG</Text>
            <Text style={styles.dateDisplay}>{selectedDate}</Text>
          </View>

          {/* Quick Date Switcher */}
          <View style={styles.datePickerRow}>
            {[0, 1, 2].map((offset) => {
              const d = new Date();
              d.setDate(d.getDate() - offset);
              const dStr = d.toISOString().split('T')[0];
              const label = offset === 0 ? "Today" : offset === 1 ? "Yesterday" : dStr.split('-').slice(1).join('/');
              
              return (
                <TouchableOpacity 
                  key={dStr}
                  style={[styles.dateTab, selectedDate === dStr && styles.activeDateTab]}
                  onPress={() => setSelectedDate(dStr)}
                >
                  <Text style={[styles.dateTabText, selectedDate === dStr && styles.activeDateTabText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.logControls}>
            <View style={styles.timePicker}>
              {[3, 4, 5, 6, 7].map((time) => (
                <TouchableOpacity 
                  key={time}
                  style={[
                    styles.timeButton, 
                    todaysWakeTime === time && { backgroundColor: getWakeUpColor(time), borderColor: 'transparent' }
                  ]}
                  onPress={() => setTodaysWakeTime(time)}
                >
                  <Text style={[styles.timeButtonText, todaysWakeTime === time && { color: '#fff' }]}>
                    {time < 7 ? `${time}AM` : '7+'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.saveLogButton} onPress={handleSaveWakeUp}>
              <Text style={styles.saveLogText}>UPDATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ConsistencyGrid entries={sleepEntries} />

        <View style={styles.agendaContainer}>
            <View style={styles.agendaHeader}>
              <Text style={styles.sectionLabel}>Morning's Objectives</Text>
                <TouchableOpacity onPress={() => setIsAddingTask('morning')}>
                  <Text style={styles.addText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Inline Input Field */}
            {isAddingTask === 'morning' && (
              <View style={styles.inlineInputContainer}>
                <TextInput
                  style={styles.inlineInput}
                  placeholder="What needs doing?"
                  placeholderTextColor="#64748b"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  autoFocus
                  onSubmitEditing={() => handleSaveTask('morning')}
                />
              </View>
            )}
            
            {dbTasks.filter(a => a.category === "morning").slice(0, 3).map(task => (
              <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskItem} 
                  onPress={() => handleToggleTask(task.id)}
              >
                <Ionicons name="square-outline" size={22} color="#64748b" />
                <Text style={styles.taskText}>{task.text}</Text>
              </TouchableOpacity>
            ))}
          </View>


         <View style={styles.mainContainer}>
            <View style={styles.grid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.quadrant,
                  { backgroundColor: cat.color + '15' },
                  activeCategory === cat.id ? { borderColor: cat.color } : { borderColor: 'transparent' }
                ]}
              >
                <Text style={[styles.quadrantLabel, { color: cat.color }]}>{cat.label}</Text>
                <Text style={{ fontSize: 10, color: cat.color }}>
                  {dbTasks.filter(a => a.category === cat.id).length} Active
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.todoContainer}>
            <View style={styles.todoHeader}>
              <Text style={styles.todosectionLabel}>{activeCategory.toUpperCase()} OBJECTIVES</Text>
              <TouchableOpacity onPress={() => setIsAddingTask(activeCategory)}>
                <Text style={[styles.todoaddText, { color: categories.find(c => c.id === activeCategory).color }]}>
                  + Add
                </Text>
              </TouchableOpacity>
            </View>

            {isAddingTask === activeCategory && (
              <View style={[styles.inlineInputContainer, { borderBottomColor: categories.find(c => c.id === activeCategory).color }]}>
                <TextInput
                  style={styles.todotaskText}
                  placeholder="Enter goal..."
                  placeholderTextColor="#64748b"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  autoFocus
                  onSubmitEditing={() => handleSaveTask(activeCategory)}
                />
              </View>
            )}
            
            {filteredActivities.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.taskItem} 
                onPress={() => handleToggleTask(item.id)}
              >
                <Ionicons name="square-outline" size={22} color={categories.find(c => c.id === activeCategory).color} />
                <Text style={styles.todotaskText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footerQuote}>
          <Text style={styles.quoteText}>
            "Discipline is choosing between what you want now and what you want most."
          </Text>
          <Text style={styles.quoteAuthor}>— Abraham Lincoln</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alarmCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
    padding: 16,
    height: 150,
    justifyContent: 'space-between',
  },
  activeAlarm: {
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  inactiveAlarm: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    opacity: 0.8,
  },
  alarmTime: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
  },
  toggle: {
    width: 34,
    height: 18,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#00E5FF' },
  toggleOff: { backgroundColor: '#334155' },
  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  solveButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  solveButtonText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '900',
  },
  gridContainer: {
    marginTop: 24,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  githubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridSquare: {
    width: (width - 100) / 14, // Fits roughly 14 squares across
    height: (width - 100) / 14,
    margin: 2,
    borderRadius: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  gridFooterText: {
    color: '#475569',
    fontSize: 10,
    marginHorizontal: 6,
  },
  miniSquare: {
    width: 10,
    height: 10,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  agendaContainer: {
    marginTop: 10,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addText: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  taskText: {
    color: '#e2e8f0',
    fontSize: 15,
    marginLeft: 12,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  footerQuote: {
    marginTop: 40,
    padding: 24,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    alignItems: 'center',
  },
  quoteText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  quoteAuthor: {
    color: '#00E5FF',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  mainContainer: { flex: 1, padding: 16, backgroundColor: '#0f172a' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quadrant: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  quadrantLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  todoContainer: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20 },
  todoHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  todosectionLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  todoaddText: { fontWeight: '600' },
  
  todotaskText: { color: '#f8fafc', marginLeft: 12, fontSize: 16 },
  legendContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  legendLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '600',
  },
  logSection: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10,
  },
  logControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timePicker: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeButtonText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  saveLogButton: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  saveLogText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 12,
    marginLeft: 5,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateDisplay: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dateTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  activeDateTab: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  dateTabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  activeDateTabText: {
    color: '#fff',
  },

  inlineInputContainer: {
  borderBottomWidth: 1,
  borderBottomColor: '#00E5FF',
  paddingVertical: 10,
  marginBottom: 10,
  },
  inlineInput: {
    color: '#e2e8f0',
    fontSize: 15,
    paddingLeft: 34, // Matches the icon alignment
  },
  // ... rest of your existing log styles ...
  
});