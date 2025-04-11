import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  
  const fs = require('fs');
  const path = require('path');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMessage('Usuario y contraseña son requeridos');
      return;
    }
    
    try {
      const userData = { username, loginDate: new Date() };
      const userDir = path.join('C:', 'Users', 'JuanPrograma', 'OneDrive', 'Desktop', 
                               'fitproject', 'fitproject', 'fitproject', 'user');
      
      // Ensure directory exists
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      
      // Create a JSON file for the user
      const userFilePath = path.join(userDir, `${username}.json`);
      fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
      
      console.log(`Usuario guardado en: ${userFilePath}`);
      
    } catch (error) {
      console.error('Error al guardar datos:', error);
      setErrorMessage('Error al guardar datos de usuario');
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

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginScreen;