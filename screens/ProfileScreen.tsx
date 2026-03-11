import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- Mock Data for Life Log ---
const INITIAL_LOGS = [
  { 
    date: 'OCT 15', 
    text: 'Focused on deep work, made significant progress on the core engine.',
    happiness: 5, 
    deepWork: 8 
  },
  { 
    date: 'OCT 14', 
    text: 'Relaxed evening with friends; recharged for the upcoming sprint.',
    happiness: 4, 
    deepWork: 2 
  },
  { date: 'OCT 13', text: 'Struggled with focus today, but kept the morning discipline intact.' ,
    happiness: 4, 
    deepWork: 2 },
  { date: 'OCT 12', text: 'Physical recovery day. Early to bed, feeling refreshed.',
    happiness: 4, 
    deepWork: 2  },
  { date: 'OCT 11', text: 'Hit a personal best in the gym. Mind is sharp and ready.' ,
    happiness: 4, 
    deepWork: 2 },
];

export default function ProfileScreen() {
  const [journalInput, setJournalInput] = useState('');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [happiness, setHappiness] = useState(3);
  const [deepWork, setDeepWork] = useState(4);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Identity Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=alex' }} 
              style={styles.avatar} 
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.userName}>Alex Chen</Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color="#f59e0b" />
              <Text style={styles.streakText}>75-DAY STREAK</Text>
            </View>
          </View>
        </View>

        {/* 2. Discipline Protocol (The Settings View) */}
        <Text style={styles.sectionLabel}>Discipline Protocol</Text>
        <View style={styles.protocolCard}>
          <View style={styles.protocolItem}>
            <View style={styles.iconBox}>
              <Ionicons name="calculator-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.protocolDetails}>
              <Text style={styles.protocolTitle}>Brain Check (Cognitive)</Text>
              <Text style={styles.protocolTime}>3:00 AM</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>

          <View style={[styles.protocolItem, styles.borderTop]}>
            <View style={styles.iconBox}>
              <Ionicons name="walk-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.protocolDetails}>
              <Text style={styles.protocolTitle}>Body Check (Physical)</Text>
              <Text style={styles.protocolTime}>3:10 AM</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>

          <View style={[styles.protocolItem, styles.borderTop]}>
            <View style={styles.iconBox}>
              <Ionicons name="moon-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.protocolDetails}>
              <Text style={styles.protocolTitle}>Time to Sleep</Text>
              <Text style={styles.protocolTime}>9:00 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>
        </View>

{/* Row 2: Happiness & Deep Work Selectors */}
        <View style={styles.selectorRow}>
            {/* Happiness Selector */}
            <View style={styles.selectorItem}>
            <Ionicons name="happy-outline" size={16} color="#f59e0b" />
            <Text style={styles.selectorLabel}>Vibe:</Text>
            <View style={styles.stepper}>
                {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity 
                    key={num} 
                    onPress={() => setHappiness(num)}
                    style={[styles.stepCircle, happiness === num && styles.activeStep]}
                >
                    <Text style={[styles.stepText, happiness === num && styles.activeStepText]}>{num}</Text>
                </TouchableOpacity>
                ))}
            </View>
            </View>

         {/* Deep Work Stepper */}
            <View style={styles.selectorItem}>
            <Ionicons name="flash-outline" size={16} color="#00E5FF" />
            <Text style={styles.selectorLabel}>Work:</Text>
            <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setDeepWork(Math.max(0, deepWork - 1))} style={styles.stepBtn}>
                <Ionicons name="remove" size={14} color="#94a3b8" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{deepWork}h</Text>
                <TouchableOpacity onPress={() => setDeepWork(Math.min(20, deepWork + 1))} style={styles.stepBtn}>
                <Ionicons name="add" size={14} color="#94a3b8" />
                </TouchableOpacity>
            </View>
            </View>
        </View>

        {/* 3. Life Log (Journal Section) */}
        <Text style={styles.sectionLabel}>Life Log</Text>
        <View style={styles.logInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Sum up today in one sentence..."
            placeholderTextColor="#64748b"
            value={journalInput}
            onChangeText={setJournalInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="arrow-up" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>
        

        <View style={styles.logList}>
        {logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
            <View style={styles.logHeader}>
                <Text style={styles.logDate}>{log.date}</Text>
                <View style={styles.logDot} />
                
                {/* New Metrics Row */}
                <View style={styles.metricsRow}>
                {/* Happiness Level */}
                <View style={styles.metricBadge}>
                    <Ionicons name="sunny" size={12} color="#f59e0b" />
                    <Text style={styles.metricText}>{log.happiness}/5</Text>
                </View>
                
                {/* Deep Work Hours */}
                <View style={[styles.metricBadge, { backgroundColor: 'rgba(0, 229, 255, 0.1)' }]}>
                    <Ionicons name="flash" size={12} color="#00E5FF" />
                    <Text style={[styles.metricText, { color: '#00E5FF' }]}>{log.deepWork}h Deep</Text>
                </View>
                </View>
            </View>

            <Text style={styles.logText}>{log.text}</Text>
            </View>
        ))}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  identityText: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  protocolCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 4,
    marginBottom: 32,
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  protocolDetails: {
    flex: 1,
    marginLeft: 16,
  },
  protocolTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  protocolTime: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
logInputContainer: {
  backgroundColor: '#1e293b',
  borderRadius: 20,
  padding: 16,
  marginBottom: 24, // Increase this from 24 to 40 for a clear break
  borderWidth: 0.5,
  borderColor: '#334155',
},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#0f172a',
  },
  activeStep: {
    backgroundColor: '#f59e0b',
  },
  stepText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  activeStepText: {
    color: '#0f172a',
  },
  stepBtn: {
    backgroundColor: '#0f172a',
    padding: 4,
    borderRadius: 6,
  },
  stepperValue: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    maxHeight: 60,
  },
  sendButton: {
    backgroundColor: '#f59e0b',
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  logList: {
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
    marginLeft: 10,
    paddingLeft: 20,
  },
 metricsRow: {
    flexDirection: 'row',
    marginLeft: 12,
    alignItems: 'center',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  metricText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Increased margin for metrics
    marginLeft: -26,
  },
  logEntry: {
    marginBottom: 32, // More breathing room between days
  },
  logDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f59e0b',
    borderWidth: 3,
    borderColor: '#0f172a',
    marginLeft: 10,
  },
  logDate: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    width: 50,
    textAlign: 'right',
  },
  logText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});