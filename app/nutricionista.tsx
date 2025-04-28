import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Nutricionista() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, Nutricionista!</Text>
      <Text style={styles.subtitle}>Bienvenido al área de nutrición</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007BFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
  },
});