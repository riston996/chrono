import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Optional: for better UX

import AlarmService from '../services/AlarmService';

const { width } = Dimensions.get('window');

// --- Mock Sleep Data ---
const generateSleepData = () => {
  return Array.from({ length: 98 }, () => Math.floor(Math.random() * 5));
};

export default function PrepScreen() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Journal Today's Thoughts", icon: "pencil-outline", completed: false },
    { id: 2, text: "Set the Workspace for Tomorrow", icon: "desktop-outline", completed: false },
    { id: 3, text: "Ensure Goals are Written", icon: "star-outline", completed: false },
    { id: 4, text: "Read Your Book", icon: "book-outline", completed: false },
  ]);

  const sleepData = useMemo(() => generateSleepData(), []);
  const allTasksDone = tasks.every(t => t.completed);

  const handleToggleTask = async (id: number, currentStatus: boolean) => {
    try {
      setLoadingId(id);
      // 1. Sync with your AlarmService
      await AlarmService.toggleProtocol(id, !currentStatus);
      
      // 2. Trigger Haptics
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 3. Update local UI
      setTasks(prev => 
        prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t)
      );
    } catch (error) {
      console.error("Failed to sync task:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const getSleepColor = (level: number) => {
    // 0 is low recovery/rest, 4 is optimal recovery
    const colors = ['#1e293b', '#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa'];
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
              onPress={() => handleToggleTask(task.id, task.completed)}
              disabled={loadingId === task.id}
              activeOpacity={0.7}
            >
              <View style={styles.taskLeft}>
                {loadingId === task.id ? (
                  <ActivityIndicator size="small" color="#93c5fd" />
                ) : (
                  <Ionicons 
                    name={task.icon as any} 
                    size={20} 
                    color={task.completed ? "#64748b" : "#93c5fd"} 
                  />
                )}
                <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                  {task.text}
                </Text>
              </View>
              {task.completed && <Ionicons name="checkmark-circle" size={20} color="#60a5fa" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Sleep Recovery History (Heatmap) */}
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
            <Text style={styles.gridFooterText}>Low Recovery</Text>
            <View style={styles.legend}>
              {[0, 1, 2, 3, 4].map(l => (
                <View key={l} style={[styles.miniSquare, { backgroundColor: getSleepColor(l) }]} />
              ))}
            </View>
            <Text style={styles.gridFooterText}>Optimal Rest</Text>
          </View>
        </View>

        {/* 4. Completion State Message */}
        <View style={[styles.completionCard, !allTasksDone && { opacity: 0.4 }]}>
          <Ionicons 
            name={allTasksDone ? "moon" : "moon-outline"} 
            size={24} 
            color={allTasksDone ? "#60a5fa" : "#94a3b8"} 
            style={{ marginBottom: 8 }} 
          />
          <Text style={styles.completionText}>
            {allTasksDone 
              ? "System primed. You've completed your nightly protocol. Rest well."
              : "Complete your routine to prime the system for tomorrow."}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  windowBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  windowText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskCardCompleted: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderColor: 'transparent',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskText: {
    color: '#f1f5f9',
    fontSize: 15,
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
    justifyContent: 'center',
    backgroundColor: '#020617',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridSquare: {
    // Dynamically calculate square size based on 14 columns
    width: (width - 48 - 24 - (14 * 4)) / 14, 
    height: (width - 48 - 24 - (14 * 4)) / 14,
    margin: 2,
    borderRadius: 3,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  gridFooterText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSquare: {
    width: 8,
    height: 8,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  completionCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 20,
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
    fontWeight: '500',
  },
});