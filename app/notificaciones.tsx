import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Notificaciones() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const usuarioData = await AsyncStorage.getItem("userData");

        if (!usuarioData) {
          Alert.alert("Error", "No se encontró información del usuario.");
          return;
        }

        const usuarioObj = JSON.parse(usuarioData);
        const usuarioId = usuarioObj?.user?.id;

        if (!usuarioId) {
          Alert.alert("Error", "No se encontró el ID del usuario.");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/api/reservas/usuario/${usuarioId}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setReservas(data);
        } else {
          Alert.alert("Error", "No se pudieron cargar las reservas.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Hubo un problema al obtener las reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (reservas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No tienes clases reservadas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clases Dirigidas</Text>
        <Button
          title="Volver al Menú"
          onPress={() => router.push("/mainMenuUser")}
          color="#333"
        />
      </View>

      <Text style={styles.title}>Tus clases reservadas:</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item?.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.className}>
              {item?.claseDirigida.nombreClaseDirigida}
            </Text>
            <Text style={styles.classDetail}>
              ⏳ Duración: {item?.claseDirigida.duracion} minutos
            </Text>
            <Text style={styles.classDetail}>
              📅 Día: {item?.claseDirigida.dia}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007BFF",
  },
  reservaItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  reservaText: {
    fontSize: 16,
    color: "#333",
  },
});
