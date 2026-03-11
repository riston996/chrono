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
} from 'react-native';
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

// --- Mock Data Generators ---
const generateConsistencyData = () => {
  return Array.from({ length: 98 }, () => Math.floor(Math.random() * 4));
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

const ConsistencyGrid = () => {
  const data = generateConsistencyData();
  const getColor = (level: number) => {
    switch (level) {
      case 3: return '#10b981';
      case 2: return '#059669';
      case 1: return '#064e3b';
      default: return '#1e293b';
    }
  };

  return (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionLabel}>Wake-up Consistency (Last 90 Days)</Text>
      <View style={styles.githubGrid}>
        {data.map((level, i) => (
          <View key={i} style={[styles.gridSquare, { backgroundColor: getColor(level) }]} />
        ))}
      </View>
      <View style={styles.gridFooter}>
        <Text style={styles.gridFooterText}>Less</Text>
        {[0, 1, 2, 3].map(l => (
           <View key={l} style={[styles.miniSquare, { backgroundColor: getColor(l) }]} />
        ))}
        <Text style={styles.gridFooterText}>More</Text>
      </View>
    </View>
  );
};

// --- Main Screen ---

export default function MainScreen() {
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
        <Text style={styles.headerTitle}>Rise & Shine</Text>
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

        <ConsistencyGrid />

        <View style={styles.agendaContainer}>
          <View style={styles.agendaHeader}>
            <Text style={styles.sectionLabel}>Today's Objectives</Text>
            <TouchableOpacity><Text style={styles.addText}>+ Add Task</Text></TouchableOpacity>
          </View>
          
          {tasks.map(task => (
            <TouchableOpacity 
                key={task.id} 
                style={styles.taskItem} 
                onPress={() => toggleTask(task.id)}
            >
              <Ionicons 
                name={task.completed ? "checkbox" : "square-outline"} 
                size={22} 
                color={task.completed ? "#00E5FF" : "#64748b"} 
              />
              <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                {task.text}
              </Text>
            </TouchableOpacity>
          ))}
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
});