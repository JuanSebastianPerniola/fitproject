import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function SeleccionarNutricionistaScreen({ navigation }) {
  const [nutricionistas, setNutricionistas] = useState([]);
  const [selectedNutricionista, setSelectedNutricionista] = useState(null);
  const API_URL = "http://192.168.1.143:8080/api/users/nutricionista";

  useEffect(() => {
    fetchNutricionistas();
  }, []);

  const fetchNutricionistas = async () => {
    try {
      const response = await fetch(API_URL); 
      const data = await response.json();
      setNutricionistas(data);
    } catch (error) {
      console.error("Error fetching nutricionistas:", error);
    }
  };

  const handleSelect = (nutricionista) => {
    setSelectedNutricionista(nutricionista);
  };

  const handleConfirm = () => {
    if (selectedNutricionista) {
      console.log("Nutricionista seleccionado:", selectedNutricionista);
      router.push("/mainMenuUser");

    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un Nutricionista</Text>

      <FlatList
        data={nutricionistas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedNutricionista?.id === item.id && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.nombre} {item.apellidos}</Text>
          </TouchableOpacity>
        )}
      />

      <Button title="Confirmar Selección" onPress={handleConfirm} disabled={!selectedNutricionista} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  item: { padding: 15, borderWidth: 1, borderColor: "#ccc", marginBottom: 10, borderRadius: 8 },
  selectedItem: { backgroundColor: "#add8e6" },
  itemText: { fontSize: 18 },
});
