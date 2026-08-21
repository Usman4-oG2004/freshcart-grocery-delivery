import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../utils/constants';

const SplashScreen = () => {
  const scaleAnim = new Animated.Value(0.6);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, '#a8edaa']}
      style={styles.container}
    >
      <Animated.View
        style={[styles.logoContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
      >
        <Text style={styles.logoEmoji}>🛒</Text>
        <Text style={styles.logoText}>FreshCart</Text>
        <Text style={styles.tagline}>Fresh Groceries, Delivered Fast</Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 32,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
});

export default SplashScreen;
