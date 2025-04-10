import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// Definimos una interfaz para nuestro objeto de usuario
interface User {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigation = useNavigation();
  // Especificamos el tipo del estado users como User[]
  const [users, setUsers] = useState<User[]>([]);

  // boton para ir para atras
  const handleGoBack = () => { navigation.goBack(); };

  // Cargar usuarios desde el archivo de texto
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Ruta al archivo de usuarios (ajustar según tu estructura de proyecto)
      const fileUri = FileSystem.documentDirectory + 'users.txt';

      // Verificar si el archivo existe, si no, crear uno con usuario de ejemplo
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(
          fileUri,
          'userName: jose, password: ejemploPassword\n'
        );
      }

      // Leer el archivo
      const content = await FileSystem.readAsStringAsync(fileUri);
      const lines = content.split('\n').filter(line => line.trim() !== '');

      // Convertir cada línea en un objeto de usuario
      const parsedUsers: User[] = lines.map(line => {
        const userMatch = line.match(/userName\s*:\s*([^,]+)/);
        const passMatch = line.match(/password\s*:\s*([^,]+)/);

        return {
          username: userMatch ? userMatch[1].trim() : '',
          password: passMatch ? passMatch[1].trim() : ''
        };
      });

      setUsers(parsedUsers);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setErrorMessage("Error al cargar los datos de usuario");
    }
  };

  const handleLogin = () => {
    // Limpiar mensaje de error anterior
    setErrorMessage('');

    // Validar que se ingresaron username y password
    if (!username || !password) {
      setErrorMessage('Por favor ingrese usuario y contraseña');
      return;
    }

    // Buscar el usuario en la lista
    const user = users.find(
      user => user.username === username && user.password === password
    );

    if (user) {
      // Login exitoso
      Alert.alert("Éxito", "Has iniciado sesión correctamente");
      // Aquí podrías navegar a la siguiente pantalla
      // navigation.navigate('Home');
    } else {
      // Usuario no encontrado o contraseña incorrecta
      setErrorMessage('Usuario o contraseña incorrectos');
    }
  };

  return (

    <View style={styles.container}>

      {/*boton para ir para atras*/}

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
      >
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Para la opción 2 (header navigation)
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  headerButtonText: {
    color: '#007AFF', // Color azul típico de iOS
    fontSize: 16,
  },
});