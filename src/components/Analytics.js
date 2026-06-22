import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  Food: '#dc2626',
  Transport: '#2563eb',
  Shopping: '#9333ea',
  Bills: '#d97706',
  Entertainment: '#059669',
  Health: '#db2777',
  Other: '#6b7280',
};

const ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '💊',
  Other: '📦',
};

export default function Analytics({ transactions }) {
  const data = React.useMemo(() => {
    const counts = {};
    transactions.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + Number(t.amount);
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([category, amount]) => ({ category, amount, pct: total ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <View style={[styles.card, styles.span3]}>
      <Text style={styles.cardTitle}>Analytics</Text>
      {data.length === 0 ? (
        <Text style={styles.empty}>No data yet</Text>
      ) : (
        <View style={styles.barChart}>
          {data.map((d) => (
            <View key={d.category} style={styles.barChartItem}>
              <Text style={styles.barChartValue}>{Math.round(d.pct)}%</Text>
              <View style={styles.barChartBarWrapper}>
                <View
                  style={[
                    styles.barChartBar,
                    { height: `${d.pct}%`, backgroundColor: COLORS[d.category] || COLORS.Other }
                  ]}
                />
              </View>
              <View style={styles.barChartLabel}>
                <Text style={styles.barChartIcon}>{ICONS[d.category] || '📦'}</Text>
                <Text>{d.category}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    padding: 18,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 220,
    paddingTop: 24,
  },
  barChartItem: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barChartValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
  },
  barChartBarWrapper: {
    width: '100%',
    flex: 1,
    alignItems: 'flex-end',
    minHeight: 0,
  },
  barChartBar: {
    width: '100%',
    borderRadius: 8,
  },
  barChartLabel: {
    alignItems: 'center',
    marginTop: 6,
  },
  barChartIcon: {
    fontSize: 14,
  },
});