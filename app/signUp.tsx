  import React, { useEffect, useState } from "react";
  import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    Pressable,
  } from "react-native";
  import * as Crypto from "expo-crypto";
  import { NativeStackNavigationProp } from "@react-navigation/native-stack";
  import { router, useRouter } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";
  import { Picker } from "@react-native-picker/picker";
  // Define navigation types
  type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    // Add other screens as needed
  };

  type SignUpScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "SignUp"
  >;

  type SignUpScreenProps = {
    navigation: SignUpScreenNavigationProp;
  };

  // Interface matching the Java Usuario model
  interface Usuario {
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
    direccion: string;
    poblacion: string;
    peso: string;
    masaMuscular: string;
    altura: string;
    tipoDeporte: string;
    tipoPago: string;
    foto: string;
    dni: string;
    username: string;
    password: string;
    entrenador: boolean;
    nutricionista: boolean;
    fechaAlta: string;
    tipoTrabajador: string;
  }

  export default function SignUpScreen({ navigation }: SignUpScreenProps) {
    const [formData, setFormData] = useState<Usuario>({
      nombre: "",
      apellidos: "",
      telefono: "",
      email: "",
      direccion: "",
      poblacion: "",
      peso: "",
      masaMuscular: "",
      altura: "",
      tipoDeporte: "",
      tipoPago: "",
      foto: "",
      dni: "",
      username: "",
      password: "",
      entrenador: false,
      nutricionista: false,
      fechaAlta: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      tipoTrabajador: "cliente", // Default value
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // listado de entrendaores y nutris

    // API URL for your Spring backend
    const API_URL = "http://localhost:8080/api/users";

    // Validate form
    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      // Required fields validation
      if (!formData.nombre.trim()) newErrors.nombre = "Nombre requerido";
      if (!formData.apellidos.trim())
        newErrors.apellidos = "Apellidos requeridos";
      if (!formData.telefono.trim()) newErrors.telefono = "Teléfono requerido";
      if (!formData.email.trim()) newErrors.email = "Email requerido";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = "Email inválido";
      if (!formData.dni.trim()) newErrors.dni = "DNI requerido";
      if (!formData.username.trim())
        newErrors.username = "Nombre de usuario requerido";

      // Password validation
      if (!formData.password) newErrors.password = "Contraseña requerida";
      else if (formData.password.length < 6)
        newErrors.password = "Mínimo 6 caracteres";
      if (formData.password !== confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";

      // Numeric fields validation
      if (!formData.peso) newErrors.peso = "Peso requerido";
      else if (isNaN(Number(formData.peso)))
        newErrors.peso = "Debe ser un número";

      if (!formData.altura) newErrors.altura = "Altura requerida";
      else if (isNaN(Number(formData.altura)))
        newErrors.altura = "Debe ser un número";

      if (formData.masaMuscular && isNaN(Number(formData.masaMuscular)))
        newErrors.masaMuscular = "Debe ser un número";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Hash password
    const hashPassword = async (password: string) => {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      return digest;
    };

    // Register user via API
    const registerUser = async () => {
      if (!validateForm()) return;

      setIsLoading(true);

      try {
        // Hash password before sending to server
        const hashedPassword = await hashPassword(formData.password);

        // Convert string values to numbers for numeric fields
        const userToSend = {
          ...formData,
          password: hashedPassword,
          peso: parseFloat(formData.peso),
          altura: parseFloat(formData.altura),
          masaMuscular: formData.masaMuscular
            ? parseFloat(formData.masaMuscular)
            : 0,
        };

        // Send POST request to Spring backend
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userToSend),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al registrar usuario");
        }

        const data = await response.json();

        // With this:
        Alert.alert("Registro exitoso", "Te has registrado correctamente.", [
          {
            text: "OK",
            onPress: () => router.push("/login"),
          },
        ]);
      } catch (error) {
        console.error("Error registering user:", error);

        let errorMessage = "Ha ocurrido un error durante el registro.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Update form field with proper typing
    const handleChange = (field: keyof Usuario, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Pressable
            onPress={() => router.back()}
            style={{ alignSelf: "flex-start", padding: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>

          <Text style={styles.title}>Registro de Usuario</Text>

          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Información Personal</Text>

          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.errorInput]}
              placeholder="Introduce tu nombre"
              value={formData.nombre}
              onChangeText={(text: string) => handleChange("nombre", text)}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
          </View>

          {/* Apellidos */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Apellidos:</Text>
            <TextInput
              style={[styles.input, errors.apellidos && styles.errorInput]}
              placeholder="Introduce tus apellidos"
              value={formData.apellidos}
              onChangeText={(text: string) => handleChange("apellidos", text)}
            />
            {errors.apellidos && (
              <Text style={styles.errorText}>{errors.apellidos}</Text>
            )}
          </View>

          {/* DNI */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>DNI:</Text>
            <TextInput
              style={[styles.input, errors.dni && styles.errorInput]}
              placeholder="Ej: 12345678A"
              value={formData.dni}
              onChangeText={(text: string) => handleChange("dni", text)}
            />
            {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono:</Text>
            <TextInput
              style={[styles.input, errors.telefono && styles.errorInput]}
              placeholder="Ej: 612345678"
              value={formData.telefono}
              onChangeText={(text: string) => handleChange("telefono", text)}
              keyboardType="phone-pad"
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}</Text>
            )}
          </View>

          {/* Dirección */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dirección:</Text>
            <TextInput
              style={[styles.input, errors.direccion && styles.errorInput]}
              placeholder="Introduce tu dirección"
              value={formData.direccion}
              onChangeText={(text: string) => handleChange("direccion", text)}
            />
            {errors.direccion && (
              <Text style={styles.errorText}>{errors.direccion}</Text>
            )}
          </View>

          {/* Población */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Población:</Text>
            <TextInput
              style={[styles.input, errors.poblacion && styles.errorInput]}
              placeholder="Introduce tu población"
              value={formData.poblacion}
              onChangeText={(text: string) => handleChange("poblacion", text)}
            />
            {errors.poblacion && (
              <Text style={styles.errorText}>{errors.poblacion}</Text>
            )}
          </View>

          {/* Physical Information */}
          <Text style={styles.sectionTitle}>Información Física</Text>

          {/* Peso */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peso (kg):</Text>
            <TextInput
              style={[styles.input, errors.peso && styles.errorInput]}
              placeholder="Ej: 70"
              value={formData.peso}
              onChangeText={(text: string) => handleChange("peso", text)}
              keyboardType="numeric"
            />
            {errors.peso && <Text style={styles.errorText}>{errors.peso}</Text>}
          </View>

          {/* Altura */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Altura (cm):</Text>
            <TextInput
              style={[styles.input, errors.altura && styles.errorInput]}
              placeholder="Ej: 175"
              value={formData.altura}
              onChangeText={(text: string) => handleChange("altura", text)}
              keyboardType="numeric"
            />
            {errors.altura && (
              <Text style={styles.errorText}>{errors.altura}</Text>
            )}
          </View>

          {/* Masa Muscular */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Masa Muscular (%):</Text>
            <TextInput
              style={[styles.input, errors.masaMuscular && styles.errorInput]}
              placeholder="Ej: 30"
              value={formData.masaMuscular}
              onChangeText={(text: string) => handleChange("masaMuscular", text)}
              keyboardType="numeric"
            />
            {errors.masaMuscular && (
              <Text style={styles.errorText}>{errors.masaMuscular}</Text>
            )}
          </View>

          {/* Tipo Deporte */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Deporte:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Running, Fútbol, Gimnasio..."
              value={formData.tipoDeporte}
              onChangeText={(text: string) => handleChange("tipoDeporte", text)}
            />
          </View>

          {/* Tipo Pago */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Pago:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mensual, Anual..."
              value={formData.tipoPago}
              onChangeText={(text: string) => handleChange("tipoPago", text)}
            />
          </View>

          {/* Account Information */}
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre de usuario:</Text>
            <TextInput
              style={[styles.input, errors.username && styles.errorInput]}
              placeholder="Ej: usuario123"
              value={formData.username}
              onChangeText={(text: string) => handleChange("username", text)}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Ej: usuario@example.com"
              value={formData.email}
              onChangeText={(text: string) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={(text: string) => handleChange("password", text)}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar contraseña:</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.errorInput]}
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Professional Info */}
          <Text style={styles.sectionTitle}>Información Profesional</Text>


          {/* Register Button */}
          <View style={[styles.button, isLoading && styles.buttonDisabled]}>
            <Text
              style={styles.buttonText}
              onPress={isLoading ? undefined : registerUser}
            >
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : "Registrarse"}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const styles = StyleSheet.create({
    pickerContainer: {
      marginBottom: 15,
    },
    pickerLabel: {
      fontSize: 16,
      marginBottom: 5,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
    },
    picker: {
      height: 50,
      width: "100%",
    },
    scrollContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      marginTop: 10,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 10,
      color: "#007BFF",
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      marginBottom: 5,
      fontSize: 16,
    },
    input: {
      width: "100%",
      height: 50,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      paddingHorizontal: 10,
      fontSize: 16,
    },
    errorInput: {
      borderColor: "red",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 5,
    },
    checkboxContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 15,
    },
    checkbox: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkboxLabel: {
      fontSize: 16,
      marginRight: 10,
    },
    checkboxBox: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: "#007BFF",
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: "#007BFF",
    },
    checkmark: {
      color: "white",
      fontWeight: "bold",
    },
    button: {
      width: "100%",
      height: 50,
      backgroundColor: "#007BFF",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
      marginTop: 20,
    },
    buttonDisabled: {
      backgroundColor: "#7FBDFF",
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
