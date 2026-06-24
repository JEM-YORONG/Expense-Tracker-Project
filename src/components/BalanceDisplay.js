import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BalanceDisplay({ budget, expense, remaining }) {
  return (
    <View style={[styles.card, styles.span3]}>
      <Text style={styles.cardTitle}>Balance</Text>
      <Text style={styles.bigNumber}>
        {remaining < 0 ? `-₱${Math.abs(remaining)}` : `₱${remaining}`}
      </Text>
      
      <View style={styles.summaryRow}>
        <SummaryItem label="Budget" value={`₱${budget}`} />
        <SummaryItem label="Spent" value={`₱${expense}`} danger />
        <SummaryItem 
          label="Remaining" 
          value={`₱${remaining}`} 
          ok={remaining >= 0} 
          danger={remaining < 0} 
        />
      </View>
    </View>
  );
}

function SummaryItem({ label, value, danger, ok }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[
        styles.summaryValue,
        ok && styles.ok,
        danger && styles.danger,
      ]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },
  span3: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  bigNumber: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.02,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  ok: {
    color: '#16a34a',
  },
  danger: {
    color: '#dc2626',
  },
});