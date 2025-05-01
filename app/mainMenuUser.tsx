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
import { router, useRouter } from "expo-router";

// Define your navigation stack types
type RootStackParamList = {
  MainMenuUser: {
    userData: { user: UserData };
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

interface UserData {
  nombre: string;
  apellidos: string;
  peso: number;
  altura: number;
  masaMuscular: number;
  foto?: string;
}

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
  }, [route.params]);

  const loadUserData = async () => {
    try {
      console.log("Attempting to load user data from AsyncStorage");
      const storedUserData = await AsyncStorage.getItem("userData");
      console.log("Retrieved data:", storedUserData);

      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log("Parsed user data:", parsedData);

        if (parsedData.user) {
          setUserData(parsedData.user);
        } else {
          console.log("User property not found in stored data");
          navigation.navigate("login");
        }
      } else {
        console.log("No user data found, redirecting to login");
        navigation.navigate("login");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      navigation.navigate("login");
    }
  };

  const handleLogout = async () => {
    try {
      // Clear user data from storage
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("token");

      // Navigate back to login screen
      navigation.navigate("login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {userData?.foto ? (
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
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/notificaciones")}
        >
          <Ionicons name="notifications-outline" size={32} color="white" />
          <Text style={styles.menuText}>Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/clasesDirigidas")}
        >
          <Ionicons name="calendar-outline" size={32} color="white" />
          <Text style={styles.menuText}>Cita</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push("/elegirEntrenador")}
      >
        <Ionicons name="person-add-outline" size={32} color="white" />
        <Text style={styles.menuText}>Elegir Entrenador</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push("/elegirNutricionista")}
      >
        <Ionicons name="nutrition-outline" size={32} color="white" />
        <Text style={styles.menuText}>Elegir Nutricionista</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MainMenuUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 50,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
