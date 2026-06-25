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
      .map(([category, amount]) => ({
        category,
        amount,
        pct: total ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalSpending = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <View style={[styles.card, styles.span3]}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Analytics</Text>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₱{totalSpending.toFixed(2)}</Text>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.empty}>No spending data yet</Text>
          <Text style={styles.emptyHint}>Add transactions to see analytics</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {data.map((d) => (
            <View key={d.category} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconDot, { backgroundColor: COLORS[d.category] || COLORS.Other + '20' }]}>
                  <Text style={styles.iconText}>{ICONS[d.category] || '📦'}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>{d.category}</Text>
                  <Text style={styles.rowSub}>₱{d.amount.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.pctText}>{Math.round(d.pct)}%</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${d.pct}%`,
                        backgroundColor: COLORS[d.category] || COLORS.Other,
                      },
                    ]}
                  />
                </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginRight: 6,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  rowSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 50,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  barBg: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
