import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { trackOrder, disconnectSocket } from '../services/socketService';
import { COLORS, ORDER_STATUSES } from '../utils/constants';
import { getStatusColor } from '../utils/helpers';

const { height } = Dimensions.get('window');

const OrderTrackingScreen = ({ navigation, route }) => {
  const { orderId, order } = route.params;
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for driver marker
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Connect socket and start tracking
    const cleanup = trackOrder(
      orderId,
      order?.customer?._id || '',
      (locationData) => {
        setDriverLocation({ lat: locationData.lat, lng: locationData.lng });
        setEta(locationData.eta);
        // Animate map to driver position
        mapRef.current?.animateToRegion({
          latitude: locationData.lat,
          longitude: locationData.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 800);
      },
      (statusData) => {
        setCurrentStatus(statusData.status);
        setStatusMessage(statusData.message);
      }
    );

    return () => {
      cleanup();
      pulse.stop();
    };
  }, [orderId]);

  const deliveryCoords = order?.deliveryAddress?.coordinates;
  const statusInfo = ORDER_STATUSES[currentStatus] || ORDER_STATUSES.pending;

  const statusSteps = ['pending', 'confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: deliveryCoords?.lat || 37.7749,
          longitude: deliveryCoords?.lng || -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Delivery destination marker */}
        {deliveryCoords && (
          <Marker
            coordinate={{ latitude: deliveryCoords.lat, longitude: deliveryCoords.lng }}
            title="Your Location"
          >
            <View style={styles.destMarker}>
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
          </Marker>
        )}

        {/* Live driver marker */}
        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
            title="Your Driver"
          >
            <Animated.View style={[styles.driverMarker, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={{ fontSize: 28 }}>🚗</Text>
            </Animated.View>
          </Marker>
        )}

        {/* Route polyline */}
        {driverLocation && deliveryCoords && (
          <Polyline
            coordinates={[
              { latitude: driverLocation.lat, longitude: driverLocation.lng },
              { latitude: deliveryCoords.lat, longitude: deliveryCoords.lng },
            ]}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backIcon}>✕</Text>
      </TouchableOpacity>

      {/* Bottom panel */}
      <View style={styles.panel}>
        {/* ETA */}
        {eta !== null && currentStatus !== 'delivered' && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaText}>⏱ {eta} min estimated arrival</Text>
          </View>
        )}

        {/* Current Status */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor(currentStatus) }]}>
          <Text style={{ fontSize: 28 }}>{statusInfo.icon ? '•' : '📍'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: getStatusColor(currentStatus) }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.statusMessage}>
              {statusMessage || `Your order is ${statusInfo.label.toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsScroll}>
          <View style={styles.steps}>
            {statusSteps.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <View key={step} style={styles.step}>
                  <View
                    style={[
                      styles.stepDot,
                      isDone && styles.stepDotDone,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    <Text style={styles.stepDotText}>{isDone ? '✓' : (index + 1).toString()}</Text>
                  </View>
                  <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                    {ORDER_STATUSES[step]?.label || step}
                  </Text>
                  {index < statusSteps.length - 1 && (
                    <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Order number */}
        <Text style={styles.orderNumber}>Order #{order?.orderNumber || orderId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: height * 0.55 },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  backIcon: { fontSize: 16, color: COLORS.text, fontWeight: '700' },
  destMarker: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  driverMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  etaBadge: {
    backgroundColor: '#f0fbf4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  etaText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderLeftWidth: 4,
  },
  statusLabel: { fontSize: 16, fontWeight: '800' },
  statusMessage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  stepsScroll: { marginTop: 4 },
  steps: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 4 },
  step: { alignItems: 'center', width: 80, position: 'relative' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotDone: { backgroundColor: COLORS.primary },
  stepDotCurrent: { backgroundColor: COLORS.primaryDark, shadowColor: COLORS.primary, shadowRadius: 6, shadowOpacity: 0.4, elevation: 4 },
  stepDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 13 },
  stepLabelDone: { color: COLORS.primary, fontWeight: '600' },
  stepLine: {
    position: 'absolute',
    top: 14,
    right: -26,
    width: 32,
    height: 2,
    backgroundColor: COLORS.border,
  },
  stepLineDone: { backgroundColor: COLORS.primary },
  orderNumber: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
});

export default OrderTrackingScreen;
