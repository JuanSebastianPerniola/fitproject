import { Slot, useRouter, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const logged = await AsyncStorage.getItem('isLoggedIn');
      setIsLogged(logged === 'true');
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirección basada en estado de autenticación
  if (isLogged === false) {
    return <Redirect href="/Persistencia/login" />;
  }

  return <Slot />;
}