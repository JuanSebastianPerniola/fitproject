import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
// import MainMenuUserScreen from "./mainMenuUser";
// import NutricionistaScreen from "./screens/NutricionistaScreen";
// import EntrenadorScreen from "./screens/EntrenadorScreen";

export type RootStackParamList = {
  Login: undefined;
  MainMenuUser: { userData: any };
  Nutricionista: { userData: any };
  Entrenador: { userData: any };
  // "/nutricionista": { userData: any }; // Añade esto
  "/": undefined;
  "/login": undefined;
  "/mainMenuUser": { userData: any };
  "/signUp": undefined;
  "/clasesDirigidas": undefined;
  "/_sitemap": undefined;
  "/+not-found": undefined;
};
const API_URL = "http://localhost:8080/api/users/login";

const LoginScreen = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Usuario y contraseña son requeridos");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        throw new Error("Server did not return JSON");
      }
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Error en la autenticación");
        return;
      }

      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("token", data.token || "");

      if (data.entrenador) {
        router.push({
          pathname: "/entrenador",
          params: { userData: JSON.stringify(data) },
        });
      } else if (data.nutricionista) {
        router.push({
          pathname: "/nutricionista",
          params: { userData: JSON.stringify(data) },
        });
      } else {
        router.push({
          pathname: "/mainMenuUser",
          params: { userData: JSON.stringify(data) },
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Error de conexión. Inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón para ir atrás */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Iniciar Sesión</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Usuario:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Procesando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "white",
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#2E7D32",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default LoginScreen;
