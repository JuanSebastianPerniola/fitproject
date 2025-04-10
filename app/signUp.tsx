import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// Interfaz para el tipo de usuario
interface User {
  username: string;
  email: string;
  password: string;
  age: string;
  weight: string;
  salt: string; // Para mejorar la seguridad
}

export default function SignUpScreen() {
  const [formData, setFormData] = useState<User>({
    username: '',
    email: '',
    password: '',
    age: '',
    weight: '',
    salt: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = 'Nombre de usuario requerido';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Contraseña requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.age) newErrors.age = 'Edad requerida';
    else if (isNaN(Number(formData.age))) newErrors.age = 'Debe ser un número';
    if (!formData.weight) newErrors.weight = 'Peso requerido';
    else if (isNaN(Number(formData.weight))) newErrors.weight = 'Debe ser un número';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generar salt aleatorio
  const generateSalt = async () => {
    return await Crypto.randomUUID();
  };

  // Encriptar contraseña con salt
  const encryptPassword = async (password: string, salt: string) => {
    const combined = password + salt;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    return digest;
  };

  // Guardar usuario en JSON
  const saveUser = async () => {
    if (!validateForm()) return;

    try {
      // Generar salt y encriptar contraseña
      const salt = await generateSalt();
      const encryptedPassword = await encryptPassword(formData.password, salt);
      
      const newUser = {
        ...formData,
        password: encryptedPassword,
        salt,
      };

      // Ruta del archivo JSON
      const fileUri = FileSystem.documentDirectory + 'users.json';
      
      // Verificar si el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      let users: User[] = [];
      
      if (fileInfo.exists) {
        // Leer usuarios existentes
        const content = await FileSystem.readAsStringAsync(fileUri);
        users = JSON.parse(content);
        
        // Verificar si el email ya existe
        const emailExists = users.some(user => user.email === formData.email);
        if (emailExists) {
          Alert.alert('Error', 'Este email ya está registrado');
          return;
        }
      }
      
      // Agregar nuevo usuario
      users.push(newUser);
      
      // Guardar en el archivo
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(users));
      
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      // Aquí podrías navegar a la pantalla de login
      // navigation.navigate('Login');
      
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      Alert.alert('Error', 'Ocurrió un error al registrar el usuario');
    }
  };

  // Actualizar campo del formulario
  const handleChange = (field: keyof User, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>
      
      {/* Nombre de usuario */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de usuario:</Text>
        <TextInput
          style={[styles.input, errors.username && styles.errorInput]}
          placeholder="Ej: usuario123"
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>
      
      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          placeholder="Ej: usuario@example.com"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      
      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={[styles.input, errors.password && styles.errorInput]}
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      
      {/* Confirmar contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar contraseña:</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.errorInput]}
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      
      {/* Edad */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Edad:</Text>
        <TextInput
          style={[styles.input, errors.age && styles.errorInput]}
          placeholder="Ej: 25"
          value={formData.age}
          onChangeText={(text) => handleChange('age', text)}
          keyboardType="numeric"
        />
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      </View>
      
      {/* Peso */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Peso (kg):</Text>
        <TextInput
          style={[styles.input, errors.weight && styles.errorInput]}
          placeholder="Ej: 70"
          value={formData.weight}
          onChangeText={(text) => handleChange('weight', text)}
          keyboardType="numeric"
        />
        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
      </View>
      
      <TouchableOpacity style={styles.button} onPress={saveUser}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
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
});