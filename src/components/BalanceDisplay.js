import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BalanceDisplay({ budget, expense, remaining }) {
  const isOverBudget = remaining < 0;

  return (
    <View style={[styles.card, styles.span3]}>
      <Text style={styles.cardTitle}>Balance</Text>
      <View style={styles.bigNumberRow}>
        <Text style={[styles.bigNumber, isOverBudget && styles.dangerBigNumber]}>
          {isOverBudget ? `-₱${Math.abs(remaining)}` : `₱${remaining}`}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Budget</Text>
          <Text style={styles.statValue}>₱{budget}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={[styles.statValue, styles.danger]}>₱{expense}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={[styles.statValue, isOverBudget ? styles.danger : styles.ok]}>
            {isOverBudget ? `-₱${Math.abs(remaining)}` : `₱${remaining}`}
          </Text>
        </View>
      </View>
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
    letterSpacing: 0.5,
  },
  bigNumberRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bigNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  dangerBigNumber: {
    color: '#dc2626',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  ok: {
    color: '#16a34a',
  },
  danger: {
    color: '#dc2626',
  },
});
