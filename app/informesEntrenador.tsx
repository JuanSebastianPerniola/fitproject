import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

const InformeDetalle = () => {
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const route = useRoute();
  const informeId = route.params?.informeId;
  
  useEffect(() => {
    // Check if we have an ID before fetching
    if (!informeId) {
      setError('No se proporcionó ID del informe');
      setLoading(false);
      return;
    }
    
    fetchInforme();
  }, [informeId]);
  
  const fetchInforme = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/informes/usuario/1`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener el informe: ${response.status}`);
      }
      
      const data = await response.json();
      setInforme(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching informe:', err);
      setError(`No se pudo cargar el informe: ${err.message}`);
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar la información del informe');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando informe...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!informe) {
    return (
      <View style={styles.centerContainer}>
        <Text>No se ha encontrado información del informe.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalles del Informe</Text>

      {informe.usuario && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Paciente</Text>
          <Text>Nombre: {informe.usuario.nombre} {informe.usuario.apellidos}</Text>
          <Text>Email: {informe.usuario.email}</Text>
          {informe.usuario.telefono && <Text>Teléfono: {informe.usuario.telefono}</Text>}
        </View>
      )}

      {informe.enviadoPor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Nutricionista</Text>
          <Text>Enviado por: {informe.enviadoPor.nombre} {informe.enviadoPor.apellidos}</Text>
          <Text>Email: {informe.enviadoPor.email}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Informe</Text>
        <Text>Fecha: {new Date(informe.fecha).toLocaleDateString()}</Text>
        {informe.mensaje && <Text>Mensaje: {informe.mensaje}</Text>}
        {informe.peso && <Text>Peso: {informe.peso} kg</Text>}
        {informe.masaMuscular && <Text>Masa Muscular: {informe.masaMuscular} %</Text>}
        {informe.grasaCorporal && <Text>Grasa Corporal: {informe.grasaCorporal} %</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default InformeDetalle;