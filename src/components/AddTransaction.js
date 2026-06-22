import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function AddTransaction({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = () => {
    if (!title.trim() || !amount) return;
    onAdd({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
    });
    setTitle('');
    setAmount('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add Transaction</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Add Transaction</Text>
        </TouchableOpacity>
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fdfdfd',
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});