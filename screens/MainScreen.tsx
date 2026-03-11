import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- Mock Data Generators ---

const generateConsistencyData = () => {
  // Generates 14 weeks (approx 3 months) of random data
  return Array.from({ length: 98 }, () => Math.floor(Math.random() * 4));
};

// --- Sub-Components ---

const AlarmCard = ({ time, condition, active, icon }: any) => (
  <View style={[styles.alarmCard, active ? styles.activeAlarm : styles.inactiveAlarm]}>
    <View style={styles.alarmHeader}>
      <Text style={[styles.alarmTime, !active && { opacity: 0.5 }]}>{time}</Text>
      <View style={[styles.toggle, active ? styles.toggleOn : styles.toggleOff]}>
        <View style={[styles.toggleCircle, active ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
      </View>
    </View>
    <View style={styles.badgeContainer}>
      <Ionicons name={icon} size={14} color={active ? "#00E5FF" : "#94a3b8"} />
      <Text style={[styles.badgeText, { color: active ? "#00E5FF" : "#94a3b8" }]}>
        {condition.toUpperCase()}
      </Text>
    </View>
    {active && (
      <TouchableOpacity style={styles.solveButton}>
        <Text style={styles.solveButtonText}>SOLVE TO STOP</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ConsistencyGrid = () => {
  const data = generateConsistencyData();
  return (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionLabel}>Wake-up Consistency (3:00 AM)</Text>
      <View style={styles.githubGrid}>
        {data.map((level, i) => (
          <View 
            key={i} 
            style={[
              styles.gridSquare, 
              { backgroundColor: level === 0 ? '#1e293b' : level === 1 ? '#064e3b' : level === 2 ? '#059669' : '#10b981' }
            ]} 
          />
        ))}
      </View>
      <View style={styles.gridFooter}>
        <Text style={styles.gridFooterText}>Less</Text>
        {[0, 1, 2, 3].map(l => (
           <View key={l} style={[styles.miniSquare, { backgroundColor: l === 0 ? '#1e293b' : l === 1 ? '#064e3b' : l === 2 ? '#059669' : '#10b981' }]} />
        ))}
        <Text style={styles.gridFooterText}>More</Text>
      </View>
    </View>
  );
};

// --- Main Screen ---

export default function MainScreen() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Deep Work Session (2 hours)', completed: true },
    { id: 2, text: 'Gym Workout (1 hour)', completed: false },
    { id: 3, text: 'Review Weekly Plan', completed: false },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rise & Shine</Text>
        <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Top Section: Alarms */}
        <Text style={styles.sectionLabel}>Upcoming Alarms</Text>
        <View style={styles.alarmRow}>
          <AlarmCard 
            time="3:00 AM" 
            condition="3 Math Problems" 
            active={true} 
            icon="calculator"
          />
          <AlarmCard 
            time="3:10 AM" 
            condition="100 Steps" 
            active={false} 
            icon="walk"
          />
        </View>

        {/* 2. Middle Section: Tracker */}
        <ConsistencyGrid />

        {/* 3. Bottom Section: Agenda */}
        <View style={styles.agendaContainer}>
          <View style={styles.agendaHeader}>
            <Text style={styles.sectionLabel}>Today's Objectives</Text>
            <TouchableOpacity><Text style={styles.addText}>Add Task</Text></TouchableOpacity>
          </View>
          
          {tasks.map(task => (
            <TouchableOpacity key={task.id} style={styles.taskItem}>
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

        {/* Motivational Footer */}
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
    backgroundColor: '#0f172a', // Deep Charcoal/Black
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alarmCard: {
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 16,
    height: 150,
    justifyContent: 'space-between',
  },
  activeAlarm: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  inactiveAlarm: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    opacity: 0.6,
  },
  alarmTime: {
    color: '#fff',
    fontSize: 28,
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
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#00E5FF' },
  toggleOff: { backgroundColor: '#334155' },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  solveButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  solveButtonText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '900',
  },
  // Grid Styles
  gridContainer: {
    marginTop: 20,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
  },
  githubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  gridSquare: {
    width: 10,
    height: 10,
    margin: 2,
    borderRadius: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  gridFooterText: {
    color: '#475569',
    fontSize: 10,
    marginHorizontal: 4,
  },
  miniSquare: {
    width: 8,
    height: 8,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  // Agenda Styles
  agendaContainer: {
    marginTop: 20,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
  },
  quoteText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'serif', // Editorial feel
  },
  quoteAuthor: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});