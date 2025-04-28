import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

export default function notis() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    const getPushToken = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        setExpoPushToken(token.data);
      }
    };

    getPushToken();
  }, []);

  return (
    <View>
      <Text>Your Expo Push Token: {expoPushToken}</Text>
    </View>
  );
}
