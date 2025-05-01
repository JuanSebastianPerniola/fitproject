import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, Button, Alert, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ClasesDirigidasCalendar() {
  const [markedDates, setMarkedDates] = useState({});
  const [clasesDia, setClasesDia] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservingClass, setReservingClass] = useState(false);
  const [error, setError] = useState(null);
  const [userReservas, setUserReservas] = useState([]);
  const API_URL = "http://localhost:8080/api/clasesDirigidas";

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== "string")
      return "Hora no disponible";
    return timeString.substring(0, 5);
  };

  useEffect(() => {
    const fetchClases = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        const newMarkedDates = {};
        if (Array.isArray(data)) {
          data.forEach((clase) => {
            if (!clase || typeof clase !== "object") {
              return;
            }

            if (!clase.dia || typeof clase.dia !== "string") {
              return;
            }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(clase.dia)) {
              return;
            }

            newMarkedDates[clase.dia] = { marked: true, dotColor: "#007BFF" };
          });
        }

        setMarkedDates(newMarkedDates);
        
        // Fetch user's existing reservations for duplicate checking
        await fetchUserReservas();
      } catch (error) {
        setError(
          "Error al cargar las clases. Por favor, intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, []);

  const fetchUserReservas = async () => {
    try {
      // Get user data from AsyncStorage consistently using "userData" key
      const usuarioData = await AsyncStorage.getItem("userData");
      
      if (!usuarioData) {
        return;
      }
      
      try {
        const usuarioObj = JSON.parse(usuarioData);
        
        if (!usuarioObj || !usuarioObj.user || !usuarioObj.user.id) {
          return;
        }

        const usuarioId = usuarioObj.user.id;
        
        // Fetch user's existing reservations
        const response = await fetch(`http://localhost:8080/api/reservas?usuarioId=${usuarioId}`);
        
        if (response.ok) {
          const reservas = await response.json();
          setUserReservas(reservas);
        }
      } catch (parseError) {
        // Handle JSON parse error gracefully
        setError("Error procesando datos del usuario.");
      }
    } catch (error) {
      setError("Error al cargar reservas del usuario.");
    }
  };

  const handleDayPress = async (day) => {
    if (selectedDate === day.dateString) return;

    setSelectedDate(day.dateString);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}?dia=${day.dateString}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setClasesDia([]);
      } else {
        setClasesDia(data);
      }
    } catch (error) {
      setError("Error al cargar las clases para este día.");
      setClasesDia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReservaClase = async (claseId) => {
    setReservingClass(true);
    
    try {
      // Use the same key "userData" consistently for fetching user data
      const usuarioData = await AsyncStorage.getItem("userData");
      
      if (!usuarioData) {
        Alert.alert("Error", "No se encontró información del usuario.");
        return;
      }
      
      try {
        const usuarioObj = JSON.parse(usuarioData);
        
        // Check if user data exists and has the ID
        if (!usuarioObj || !usuarioObj.user || !usuarioObj.user.id) {
          Alert.alert("Error", "No se encontró el ID del usuario.");
          return;
        }

        const usuarioId = usuarioObj.user.id;
        
        // Check if the user has already reserved this class
        const alreadyReserved = userReservas.some(
          reserva => reserva.claseDirigida && reserva.claseDirigida.id === claseId
        );
        
        if (alreadyReserved) {
          Alert.alert(
            "Reserva Duplicada", 
            "Ya tienes una reserva para esta clase."
          );
          return;
        }
        
        // Send request with query parameters, as expected by the backend
        const response = await fetch(
          `http://localhost:8080/api/reservas?usuarioId=${usuarioId}&claseDirigidaId=${claseId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
            // No body needed, params are in the URL
          }
        );
        
        if (response.ok) {
          Alert.alert("Reserva Exitosa", "La clase ha sido reservada con éxito.");
          // Refresh the user's reservations after successful reservation
          await fetchUserReservas();
        } else {
          Alert.alert("Error", "No se pudo realizar la reserva. Por favor, intente nuevamente.");
        }
      } catch (parseError) {
        Alert.alert("Error", "Error al procesar los datos del usuario.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo completar la reserva. Intenta nuevamente."
      );
    } finally {
      setReservingClass(false);
    }
  };

  const renderClases = () => {
    if (loading) {
      return <Text style={styles.statusText}>Cargando...</Text>;
    }

    if (error) {
      return <Text style={[styles.statusText, styles.errorText]}>{error}</Text>;
    }

    if (!selectedDate) {
      return (
        <Text style={styles.statusText}>
          Selecciona un día para ver las clases disponibles.
        </Text>
      );
    }

    if (clasesDia.length === 0) {
      return (
        <Text style={styles.statusText}>
          No hay clases dirigidas para este día.
        </Text>
      );
    }

    return (
      <FlatList
        data={clasesDia}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : `clase-${index}`
        }
        renderItem={({ item }) => {
          // Check if this class is already reserved by the user
          const isAlreadyReserved = userReservas.some(
            reserva => reserva.claseDirigida && reserva.claseDirigida.id === item.id
          );
          
          return (
            <View style={styles.claseItem}>
              <Text style={styles.claseText}>
                {item.nombreClaseDirigida || "Clase sin nombre"}
              </Text>
              <Text style={styles.descripcionText}>
                {item.descripcion || "Sin descripción"}
              </Text>
              <Text style={styles.horaText}>Hora: {formatTime(item.hora)}</Text>
              <Text style={styles.duracionText}>
                Duración: {item.duracion || "?"} minutos
              </Text>
              {isAlreadyReserved ? (
                <Text style={styles.reservedText}>
                  ✓ Ya tienes reserva para esta clase
                </Text>
              ) : reservingClass ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Button
                  title="Reservar Clase"
                  onPress={() => handleReservaClase(item.id)}
                  color="#4285F4"
                />
              )}
            </View>
          );
        }}
      />
    );
  };

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

      {loading && !selectedDate ? (
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      ) : (
        <Calendar
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: "#4285F4",
            },
          }}
          markingType={"dot"}
          onDayPress={handleDayPress}
          theme={{
            selectedDayBackgroundColor: "#4285F4",
            todayTextColor: "#4285F4",
            arrowColor: "#4285F4",
          }}
        />
      )}

      <View style={styles.clasesContainer}>
        {selectedDate && !loading && !error && (
          <Text style={styles.dateHeaderText}>
            Clases para el{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        )}
        {renderClases()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
  },
  clasesContainer: {
    marginTop: 20,
    flex: 1,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  claseItem: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  claseText: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    color: "#333",
  },
  descripcionText: {
    marginBottom: 8,
    color: "#555",
  },
  horaText: {
    fontSize: 14,
    color: "#4285F4",
    fontWeight: "500",
  },
  duracionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  statusText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#D32F2F",
  },
  reservedText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 8,
  }
});