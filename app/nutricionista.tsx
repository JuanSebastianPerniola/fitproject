import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";

export default function Nutricionista({ navigation }) {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [clientReservations, setClientReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [userType, setUserType] = useState("client"); // 'client', 'nutricionista', or 'entrenador'
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Modal para enviar notificaciones
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationReceiver, setNotificationReceiver] = useState(null);
  
  // ID de usuario actual (nutricionista) - En una app real vendría de autenticación
  const currentUserId = 1; // Ejemplo: ID del nutricionista logueado

  // Report form state
  const [reportForm, setReportForm] = useState({
    weight: "",
    dietNotes: "",
    heartRate: "",
  });

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch(`http://localhost:8080/api/notificaciones/${currentUserId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las notificaciones");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Send notification to user
  const sendNotification = async () => {
    if (!notificationMessage.trim() || !notificationReceiver) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/notificaciones/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: notificationMessage,
        }),
        // Añadimos los parámetros como query params
        params: new URLSearchParams({
          emisorId: currentUserId,
          receptorId: notificationReceiver.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la notificación");
      }

      // Limpiar el formulario y cerrar el modal
      setNotificationMessage("");
      setIsNotificationModalVisible(false);
      
      Alert.alert("Éxito", "Notificación enviada correctamente");
    } catch (err) {
      console.error("Error sending notification:", err);
      Alert.alert("Error", "No se pudo enviar la notificación");
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notificaciones/leida/${id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al marcar la notificación como leída");
      }

      // Update local state
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, leida: true } : notification
      );
      
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Fetch clients from API - filtering for only regular clients (not entrenadores or nutricionistas)
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/users");

      if (!response.ok) {
        throw new Error("Error al cargar los clientes");
      }

      const data = await response.json();
      // Filter out nutricionistas and entrenadores, keep only regular clients
      const regularClients = data.filter(
        (user) => !user.nutricionista && !user.entrenador
      );
      setClients(regularClients);
      setFilteredClients(regularClients);
    } catch (err) {
      setError(err.message);
      Alert.alert(
        "Error",
        "No se pudieron cargar los clientes. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClients();
    fetchNotifications();

    // Check if the current user is a nutricionista
    // This would normally come from your authentication system
    setUserType("nutricionista");
    
    // Podríamos establecer un intervalo para actualizar las notificaciones periódicamente
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Cada minuto
    
    return () => clearInterval(notificationInterval);
  }, []);

  // Filter clients based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.nombre.toLowerCase().includes(lowercasedQuery) ||
          client.apellidos.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.leida
  ).length;

  // View client details and fetch their reservations
  const viewClientDetails = async (client) => {
    setSelectedClient(client);
    setShowClientDetail(true);

    // Fetch client's reservations
    setLoadingReservations(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/reservas?usuarioId=${client.id}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar las reservas");
      }

      const data = await response.json();
      setClientReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      // We'll show an error message in the UI instead of using Alert
    } finally {
      setLoadingReservations(false);
    }
  };

  // Go back to client list
  const backToList = () => {
    setShowClientDetail(false);
    setSelectedClient(null);
    // Reset report form and clear reservations
    setReportForm({
      weight: "",
      dietNotes: "",
      heartRate: "",
    });
    setClientReservations([]);
  };

  // Handle sending report
  const sendReport = () => {
    // In a real app, this would send data to an API WIP
    Alert.alert(
      "Informe Enviado",
      `Se ha enviado el informe a ${selectedClient.nombre} ${selectedClient.apellidos}`,
      [{ text: "OK" }]
    );

    // Reset form
    setReportForm({
      weight: "",
      dietNotes: "",
      heartRate: "",
    });
  };

  // Handle report form changes
  const handleReportChange = (field, value) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Open notification modal to send message to a client
  const openSendNotificationModal = (client) => {
    setNotificationReceiver(client);
    setIsNotificationModalVisible(true);
  };

  // Render client item for the list
  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => viewClientDetails(item)}
    >
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>
          {item.nombre} {item.apellidos}
        </Text>
        <Text style={styles.clientDetails}>
          Email: {item.email} | Teléfono: {item.telefono}
        </Text>
      </View>
      <View style={styles.clientActions}>
        <TouchableOpacity
          style={styles.notifyButton}
          onPress={() => openSendNotificationModal(item)}
        >
          <Text style={styles.notifyButtonText}>Notificar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => scheduleConsultation(item.id)}
        >
          <Text style={styles.scheduleButtonText}>Cita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => viewClientDetails(item)}
        >
          <Text style={styles.viewButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render notification item
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.leida && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationSender}>
          De: {item.emisor?.nombre || "Sistema"}
        </Text>
        <Text style={styles.notificationMessage}>{item.mensaje}</Text>
        <Text style={styles.notificationTime}>{new Date(item.fechaCreacion).toLocaleString()}</Text>
      </View>
      {!item.leida && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  // Client Detail Screen
  const renderClientDetail = () => (
    <ScrollView style={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={backToList}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.clientHeader}>
        <View style={styles.clientAvatarContainer}>
          {selectedClient.foto ? (
            <Image
              source={{
                uri: `http://localhost:8080/api/users/photos/${selectedClient.foto}`,
              }}
              style={styles.clientAvatar}
            />
          ) : (
            <View style={[styles.clientAvatar, styles.clientAvatarPlaceholder]}>
              <Text style={styles.clientAvatarText}>
                {selectedClient.nombre.charAt(0) +
                  selectedClient.apellidos.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.clientDetailName}>
          {selectedClient.nombre} {selectedClient.apellidos}
        </Text>
        
        {/* Botón para enviar notificación directamente desde la vista de detalle */}
        <TouchableOpacity 
          style={styles.detailNotifyButton}
          onPress={() => openSendNotificationModal(selectedClient)}
        >
          <Text style={styles.detailNotifyButtonText}>Enviar notificación</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clientDetailsCard}>
        <Text style={styles.detailSectionTitle}>Información Personal</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>DNI:</Text>
          <Text style={styles.detailValue}>{selectedClient.dni}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{selectedClient.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Teléfono:</Text>
          <Text style={styles.detailValue}>{selectedClient.telefono}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dirección:</Text>
          <Text style={styles.detailValue}>
            {selectedClient.direccion}, {selectedClient.poblacion}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de alta:</Text>
          <Text style={styles.detailValue}>{selectedClient.fechaAlta}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo de pago:</Text>
          <Text style={styles.detailValue}>{selectedClient.tipoPago}</Text>
        </View>
      </View>

      <View style={styles.clientDetailsCard}>
        <Text style={styles.detailSectionTitle}>Datos Físicos</Text>

        <View style={styles.physicalDataContainer}>
          <View style={styles.physicalDataItem}>
            <Text style={styles.physicalDataValue}>
              {selectedClient.peso} kg
            </Text>
            <Text style={styles.physicalDataLabel}>Peso</Text>
          </View>

          <View style={styles.physicalDataItem}>
            <Text style={styles.physicalDataValue}>
              {selectedClient.altura} m
            </Text>
            <Text style={styles.physicalDataLabel}>Altura</Text>
          </View>

          <View style={styles.physicalDataItem}>
            <Text style={styles.physicalDataValue}>
              {selectedClient.masaMuscular}%
            </Text>
            <Text style={styles.physicalDataLabel}>Masa Muscular</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo de deporte:</Text>
          <Text style={styles.detailValue}>{selectedClient.tipoDeporte}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IMC:</Text>
          <Text style={styles.detailValue}>
            {(
              selectedClient.peso /
              (selectedClient.altura * selectedClient.altura)
            ).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Reservations section */}
      <View style={styles.clientDetailsCard}>
        <Text style={styles.detailSectionTitle}>Reservas</Text>

        {loadingReservations ? (
          <ActivityIndicator
            size="small"
            color="#007BFF"
            style={styles.reservationsLoading}
          />
        ) : clientReservations.length > 0 ? (
          clientReservations.map((reservation, index) => (
            <View key={index} style={styles.reservationItem}>
              <View style={styles.reservationHeader}>
                <Text style={styles.reservationTitle}>
                  {reservation.claseDirigida?.nombre || "Consulta de Nutrición"}
                </Text>
                <Text style={styles.reservationStatus}>
                  {reservation.estado === "CONFIRMADO"
                    ? "✅ Confirmada"
                    : "⏳ Pendiente"}
                </Text>
              </View>

              <View style={styles.reservationDetails}>
                <Text style={styles.reservationDate}>
                  {reservation.fecha || "Fecha no disponible"}
                </Text>
                <Text style={styles.reservationTime}>
                  {reservation.hora || "Hora no disponible"}
                </Text>
                {reservation.ubicacion && (
                  <Text style={styles.reservationLocation}>
                    📍 {reservation.ubicacion}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noReservationsText}>
            No hay reservas registradas para este cliente.
          </Text>
        )}
      </View>

      <View style={styles.clientDetailsCard}>
        <Text style={styles.detailSectionTitle}>Enviar Informe</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Peso actual (kg):</Text>
          <TextInput
            style={styles.formInput}
            value={reportForm.weight}
            onChangeText={(text) => handleReportChange("weight", text)}
            keyboardType="numeric"
            placeholder="Ej: 65.5"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Pulsaciones (bpm):</Text>
          <TextInput
            style={styles.formInput}
            value={reportForm.heartRate}
            onChangeText={(text) => handleReportChange("heartRate", text)}
            keyboardType="numeric"
            placeholder="Ej: 72"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Notas sobre dieta:</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={reportForm.dietNotes}
            onChangeText={(text) => handleReportChange("dietNotes", text)}
            placeholder="Añade notas sobre la dieta recomendada..."
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.sendReportButton} onPress={sendReport}>
          <Text style={styles.sendReportButtonText}>Enviar Informe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Home screen content
  const renderHomeContent = () => (
    <ScrollView style={styles.contentContainer}>
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Hola, Nutricionista!</Text>
        <Text style={styles.subtitle}>Bienvenido al área de nutrición</Text>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Clientes recientes</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : error ? (
          <Text style={styles.errorText}>Error al cargar los clientes</Text>
        ) : clients.length === 0 ? (
          <Text style={styles.noClientsText}>No hay clientes disponibles</Text>
        ) : (
          clients.slice(0, 3).map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.recentClientItem}
              onPress={() => viewClientDetails(client)}
            >
              <Text style={styles.recentClientName}>
                {client.nombre} {client.apellidos}
              </Text>
              <Text style={styles.recentClientDate}>{client.fechaAlta}</Text>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity onPress={() => setActiveTab("search")}>
          <Text style={styles.viewAllLink}>Ver todos los clientes</Text>
        </TouchableOpacity>
      </View>

      {/* Recent notifications section on home */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Notificaciones recientes</Text>
        {loadingNotifications ? (
          <ActivityIndicator size="small" color="#007BFF" />
        ) : notifications.length === 0 ? (
          <Text style={styles.noClientsText}>No hay notificaciones</Text>
        ) : (
          <>
            {notifications.slice(0, 3).map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.recentNotificationItem,
                  !notification.leida && styles.unreadNotificationItem
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <Text style={styles.recentNotificationSender}>
                  De: {notification.emisor?.nombre || "Sistema"}
                </Text>
                <Text 
                  style={styles.recentNotificationMessage}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {notification.mensaje}
                </Text>
                <Text style={styles.recentNotificationDate}>
                  {new Date(notification.fechaCreacion).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setActiveTab("notifications")}>
              <Text style={styles.viewAllLink}>Ver todas las notificaciones</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  // Search content
  const renderSearchContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente por nombre o apellidos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchClients}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : filteredClients.length > 0 ? (
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.clientsList}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No se encontraron clientes</Text>
        </View>
      )}
    </View>
  );

  // Notifications content
  const renderNotificationsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.notificationsHeader}>
        <Text style={styles.notificationsTitle}>Notificaciones</Text>
        {unreadCount > 0 && (
          <Text style={styles.unreadCount}>{unreadCount} no leídas</Text>
        )}
      </View>

      {loadingNotifications ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.notificationsList}
          refreshing={loadingNotifications}
          onRefresh={fetchNotifications}
        />
      ) : (
        <View style={styles.noNotificationsContainer}>
          <Text style={styles.noNotificationsText}>
            No tienes notificaciones
          </Text>
        </View>
      )}
    </View>
  );

  // Modal para enviar notificación
  const renderNotificationModal = () => (
    <Modal
      visible={isNotificationModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsNotificationModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Enviar notificación a {notificationReceiver?.nombre} {notificationReceiver?.apellidos}
          </Text>
          
          <TextInput
            style={[styles.formInput, styles.textArea, styles.modalInput]}
            value={notificationMessage}
            onChangeText={setNotificationMessage}
            placeholder="Escribe tu mensaje..."
            multiline={true}
            numberOfLines={4}
          />
          
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setIsNotificationModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalSendButton}
              onPress={sendNotification}
            >
              <Text style={styles.modalSendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* If showing client detail */}
      {showClientDetail && selectedClient ? (
        renderClientDetail()
      ) : (
        // Otherwise show main tabs
        <>
          {/* Main content based on active tab */}
          {activeTab === "home" && renderHomeContent()}
          {activeTab === "search" && renderSearchContent()}
          {activeTab === "notifications" && renderNotificationsContent()}

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === "home" && styles.activeNavItem,
              ]}
              onPress={() => setActiveTab("home")}
            >
              <Text
                style={[
                  styles.navText,
                  activeTab === "home" && styles.activeNavText,
                ]}
              >
                Inicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === "search" && styles.activeNavItem,
              ]}
              onPress={() => setActiveTab("search")}
            >
              <Text
                style={[
                  styles.navText,
                  activeTab === "search" && styles.activeNavText,
                ]}
              >
                Buscar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === "notifications" && styles.activeNavItem,
              ]}
              onPress={() => setActiveTab("notifications")}
            >
              <View style={styles.navItemWithBadge}>
                <Text
                  style={[
                    styles.navText,
                    activeTab === "notifications" && styles.activeNavText,
                  ]}
                >
                  Notificaciones
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {/* Modal para enviar notificaciones */}
      {renderNotificationModal()}
    </SafeAreaView>
  );
}

// Function to schedule a new nutrition consultation
const scheduleConsultation = (clientId) => {
  // This would connect to your API to create a new reservation
  Alert.alert(
    "Programar consulta",
    "Esta funcionalidad conectaría con tu API para crear una nueva reserva de consulta nutricional."
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007BFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  recentSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  recentClientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recentClientName: {
    fontSize: 16,
    color: "#333",
  },
  recentClientDate: {
    fontSize: 14,
    color: "#666",
  },
  viewAllLink: {
    color: "#007BFF",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 60,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: "#007BFF",
  },
  navText: {
    color: "#666",
    fontSize: 14,
  },
  activeNavText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  navItemWithBadge: {
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -15,
    top: -8,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clientsList: {
    flex: 1,
  },
  clientItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  clientDetails: {
    fontSize: 14,
    color: "#666",
  },
  clientActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleButton: {
    backgroundColor: "#28a745",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 8,
  },
  scheduleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  viewButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
  noClientsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  unreadCount: {
    fontSize: 14,
    color: "#007BFF",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: "#f0f7ff",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    marginLeft: 10,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noNotificationsText: {
    fontSize: 16,
    color: "#666",
  },
  // Client Detail Styles
  backButton: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007BFF",
    fontWeight: "500",
  },
  clientHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  clientAvatarContainer: {
    marginBottom: 10,
  },
  clientAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  clientAvatarPlaceholder: {
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  clientAvatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  clientDetailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  // Reservation styles
  reservationsLoading: {
    padding: 20,
  },
  reservationItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#007BFF",
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  reservationStatus: {
    fontSize: 14,
    color: "#28a745",
  },
  reservationDetails: {
    flexDirection: "column",
  },
  reservationDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reservationTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reservationLocation: {
    fontSize: 14,
    color: "#666",
  },
  noReservationsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 15,
  },
  clientDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    width: "35%",
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  physicalDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  physicalDataItem: {
    alignItems: "center",
    width: "30%",
  },
  physicalDataValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 5,
  },
  physicalDataLabel: {
    fontSize: 12,
    color: "#666",
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  sendReportButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  sendReportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
