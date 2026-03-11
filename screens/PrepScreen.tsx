import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- Mock Sleep Data (3 Months) ---
const generateSleepData = () => {
  return Array.from({ length: 98 }, () => Math.floor(Math.random() * 5));
};

export default function PrepScreen() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Journal Today's Thoughts", icon: "pencil-outline", completed: false },
    { id: 2, text: "Set the Workspace for Tomorrow", icon: "desktop-outline", completed: false },
    { id: 3, text: "Ensure Goals are Written", icon: "star-outline", completed: false },
    { id: 4, text: "Read Your Book", icon: "book-outline", completed: false },
  ]);

  const sleepData = useMemo(() => generateSleepData(), []);
  const allTasksDone = tasks.every(t => t.completed);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Color mapping for Sleep Recovery History
  const getSleepColor = (level: number) => {
    const colors = ['#1e293b', '#1e3a8a', '#1d4ed8', '#2563eb', '#60a5fa'];
    return colors[level];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Header & Status */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The Prep</Text>
          <View style={styles.windowBadge}>
            <Text style={styles.windowText}>8:00 PM – 9:00 PM Routine Window</Text>
          </View>
        </View>

        {/* 2. Nightly Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nightly Routine Checklist</Text>
          {tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={styles.taskLeft}>
                <Ionicons name={task.icon as any} size={20} color={task.completed ? "#94a3b8" : "#93c5fd"} />
                <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                  {task.text}
                </Text>
              </View>
              {task.completed && <Ionicons name="checkmark-circle" size={20} color="#60a5fa" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Sleep Recovery History (Blue Heatmap) */}
        <View style={styles.gridContainer}>
          <Text style={styles.sectionLabel}>Sleep Recovery History</Text>
          <View style={styles.githubGrid}>
            {sleepData.map((level, i) => (
              <View 
                key={i} 
                style={[styles.gridSquare, { backgroundColor: getSleepColor(level) }]} 
              />
            ))}
          </View>
          <View style={styles.gridFooter}>
            <Text style={styles.gridFooterText}>Lighter Blue (4-5 hrs)</Text>
            <View style={styles.legend}>
              {[0, 1, 2, 3, 4].map(l => (
                <View key={l} style={[styles.miniSquare, { backgroundColor: getSleepColor(l) }]} />
              ))}
            </View>
            <Text style={styles.gridFooterText}>Darker Blue (8+ hrs)</Text>
          </View>
        </View>

        {/* 4. Completion State Message */}
        {allTasksDone ? (
          <View style={styles.completionCard}>
            <Ionicons name="moon-outline" size={24} color="#93c5fd" style={{ marginBottom: 8 }} />
            <Text style={styles.completionText}>Once all tasks are checked, system ready. Rest well.</Text>
          </View>
        ) : (
          <View style={[styles.completionCard, { opacity: 0.3 }]}>
            <Text style={styles.completionText}>Complete your routine to prime the system.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark foundation
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  windowBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  windowText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskCardCompleted: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    opacity: 0.6,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    color: '#bfdbfe',
    fontSize: 16,
    marginLeft: 14,
    fontWeight: '500',
  },
  taskTextCompleted: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  gridContainer: {
    marginBottom: 32,
  },
  githubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
  },
  gridSquare: {
    width: (width - 100) / 14, // Fits roughly 14 columns
    height: (width - 100) / 14,
    margin: 2,
    borderRadius: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  gridFooterText: {
    color: '#475569',
    fontSize: 10,
  },
  legend: {
    flexDirection: 'row',
  },
  miniSquare: {
    width: 10,
    height: 10,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  completionCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
  },
  completionText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
});