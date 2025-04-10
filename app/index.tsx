import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
export default function AuthScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Welcome!</Text>

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={() => router.push('/login')} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={() => router.push('/signUp')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  }, logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});
