import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createWorkletRuntime } from "react-native-reanimated";

interface UserData {
  nombre: string;
  apellidos: string;
  peso: number;
  altura: number;
  masaMuscular: number;
  foto?: string;
}

// Define your navigation stack types
type RootStackParamList = {
  MainMenuUser: {
    userData: { user: UserData;  };
  };
  Login: undefined;
  Nutricion: undefined;
  Calendario: undefined;
  Progreso: undefined;
  Mensajes: undefined;
  Ajustes: undefined;
  ClasesDirigidas: undefined;
};

type MainMenuUserNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainMenuUser"
>;

type MainMenuUserRouteProp = RouteProp<RootStackParamList, "MainMenuUser">;

const MainMenuUser = () => {
  const navigation = useNavigation<MainMenuUserNavigationProp>();
  const route = useRoute<MainMenuUserRouteProp>();
  const [userData, setUserData] = React.useState<UserData | null>(null);

  React.useEffect(() => {
    console.log("Route params:", route.params);
    
    if (route.params?.userData?.user) {
      console.log("User data from params:", route.params.userData.user);
      setUserData(route.params.userData.user);
    } else {
      console.log("User data not available in params, loading from storage");
      loadUserData();
    }
  }, []);


  const loadUserData = async () => {
    try {
      console.log("Attempting to load user data from AsyncStorage");
      const storedUserData = await AsyncStorage.getItem("userData");
      console.log("Retrieved data:", storedUserData);
      
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log("Parsed user data:", parsedData);
        
        // Here's the fix: extract the user object from the stored data
        if (parsedData.user) {
          setUserData(parsedData.user);
        } else {
          console.log("User property not found in stored data");
          navigation.navigate("Login");
        }
      } else {
        console.log("No user data found, redirecting to login");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      navigation.navigate("Login");
    }
  };
  const handleLogout = async () => {
    try {
      // Clear user data from storage
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("token");
      // Navigate back to login
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  // CARGANDO
  if (!userData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {userData.foto ? (
            <Image
              source={{ uri: userData?.foto }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={50} color="#555" />
            </View>
          )}
        </View>
        <Text style={styles.welcomeText}>
          Bienvenido, {userData?.nombre} {userData?.apellidos}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.peso} kg</Text>
            <Text style={styles.statLabel}>Peso</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.altura} m</Text>
            <Text style={styles.statLabel}>Altura</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.masaMuscular}%</Text>
            <Text style={styles.statLabel}>Masa Muscular</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Nutricion")}
        >
          <Ionicons name="nutrition-outline" size={32} color="white" />
          <Text style={styles.menuText}>Plan Nutricional</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Calendario")}
        >
          <Ionicons name="calendar-outline" size={32} color="white" />
          <Text style={styles.menuText}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Progreso")}
        >
          <Ionicons name="analytics-outline" size={32} color="white" />
          <Text style={styles.menuText}>Mi Progreso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Mensajes")}
        >
          <Ionicons name="chatbubbles-outline" size={32} color="white" />
          <Text style={styles.menuText}>Mensajes</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Ajustes")}
        >
          <Ionicons name="settings-outline" size={32} color="white" />
          <Text style={styles.menuText}>Ajustes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ClasesDirigidas")}
        >
          <Ionicons name="fitness" size={32} color="white" />
          <Text style={styles.menuText}>Clases Dirigidas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: "#2A2A2A",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  menuText: {
    color: "white",
    marginTop: 8,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF4500",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MainMenuUser;
