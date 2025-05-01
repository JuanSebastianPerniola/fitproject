import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SeleccionarEntrenadorScreen({ navigation }) {
  const [entrenadores, setEntrenadores] = useState([]);
  const [selectedEntrenador, setSelectedEntrenador] = useState(null);
  const API_URL = "http://localhost:8080/api/users/entrenadores";

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const fetchEntrenadores = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // Filtrar solo los usuarios que tienen entrenador = true
      const entrenadoresFiltrados = data.filter(
        (usuario) => usuario.entrenador === true
      );
      setEntrenadores(entrenadoresFiltrados);
    } catch (error) {
      console.error("Error fetching entrenadores:", error);
    }
  };

  const handleSelect = (entrenador) => {
    setSelectedEntrenador(entrenador);
  };

  const handleConfirm = () => {
    if (selectedEntrenador) {
      console.log("Entrenador seleccionado:", selectedEntrenador);
      router.push("/mainMenuUser");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un Entrenador</Text>

      {entrenadores.length === 0 && (
        <Text style={{ textAlign: "center", marginVertical: 20 }}>
          No hay entrenadores disponibles en este momento.
        </Text>
      )}
      <FlatList
        data={entrenadores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedEntrenador?.id === item.id && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>
              {item.nombre} {item.apellidos}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Button
        title="Confirmar Selección"
        onPress={handleConfirm}
        disabled={!selectedEntrenador}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 8,
  },
  selectedItem: { backgroundColor: "#add8e6" },
  itemText: { fontSize: 18 },
});
