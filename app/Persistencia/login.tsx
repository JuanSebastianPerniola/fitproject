// app/Persistencia/login.tsx
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    // Supongamos que el login fue exitoso
    await AsyncStorage.setItem('isLoggedIn', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View>
      <Text>Iniciar sesión</Text>
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}
