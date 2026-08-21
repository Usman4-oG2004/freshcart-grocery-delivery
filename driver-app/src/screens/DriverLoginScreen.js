import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://your-api.com/api';

const DriverLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/drivers/login`, { email, password });
      await AsyncStorage.setItem('driver_token', data.token);
      await AsyncStorage.setItem('driver_data', JSON.stringify(data.driver));
      navigation.replace('Dashboard', { driver: data.driver });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🚗</Text>
        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>FreshCart Delivery Partner</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, justifyContent: 'center', padding: 32, gap: 14 },
  logo: { fontSize: 72, textAlign: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 10 },
  error: { color: '#e74c3c', textAlign: 'center', fontSize: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btn: {
    backgroundColor: '#2ecc71',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DriverLoginScreen;
