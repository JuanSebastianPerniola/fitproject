import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const InformeDetalle = ({ route }) => {
  // route.params contendrá el objeto del informe que pasaste al navegar a esta pantalla
  const { informe } = route.params;

  if (!informe) {
    return <Text>No se ha proporcionado información del informe.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Informe</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Paciente</Text>
        <Text>Nombre: {informe.usuario.nombre} {informe.usuario.apellidos}</Text>
        <Text>Email: {informe.usuario.email}</Text>
        {informe.usuario.telefono && <Text>Teléfono: {informe.usuario.telefono}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Nutricionista</Text>
        <Text>Enviado por: {informe.enviadoPor.nombre} {informe.enviadoPor.apellidos}</Text>
        <Text>Email: {informe.enviadoPor.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Informe</Text>
        <Text>Fecha: {informe.fecha}</Text>
        <Text>Mensaje: {informe.mensaje}</Text>
        <Text>Peso: {informe.peso} kg</Text>
        <Text>Masa Muscular: {informe.masaMuscular} %</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
});

export default InformeDetalle;