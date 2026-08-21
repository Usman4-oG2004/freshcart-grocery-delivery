import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DriverLoginScreen from './src/screens/DriverLoginScreen';
import DriverDashboard from './src/screens/DriverDashboard';
import ActiveDeliveryScreen from './src/screens/ActiveDeliveryScreen';

const Stack = createNativeStackNavigator();

const App = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={DriverLoginScreen} />
        <Stack.Screen name="Dashboard" component={DriverDashboard} />
        <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
);

export default App;
