import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { broadcastLocation } from '../services/locationService';

const STATUS_FLOW = [
  { status: 'picked_up', label: 'Picked Up from Store', btnLabel: 'Mark as Picked Up ✅' },
  { status: 'on_the_way', label: 'On the Way', btnLabel: 'Start Delivery 🚗' },
  { status: 'delivered', label: 'Delivered!', btnLabel: 'Confirm Delivery 🎉' },
];

const ActiveDeliveryScreen = ({ navigation, route }) => {
  const { order, driver } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const mapRef = useRef(null);
  const watchId = useRef(null);

  useEffect(() => {
    startLocationTracking();
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const startLocationTracking = () => {
    Geolocation.requestAuthorization('whenInUse');

    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setCurrentLocation(loc);

        // Broadcast to server & customers via socket
        broadcastLocation({
          driverId: driver._id,
          orderId: order._id,
          lat: latitude,
          lng: longitude,
          heading,
          speed: (speed || 0) * 3.6, // m/s -> km/h
        });

        // Animate map
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      },
      (error) => console.error('GPS error:', error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,   // Update every 10 meters
        interval: 5000,       // Every 5 seconds
        fastestInterval: 3000,
      }
    );
  };

  const handleNextStatus = async () => {
    const currentStep = STATUS_FLOW[statusIndex];
    if (!currentStep) return;

    if (currentStep.status === 'delivered') {
      Alert.alert(
        'Confirm Delivery',
        'Have you successfully delivered the order?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Delivered!',
            onPress: async () => {
              // Socket will handle status broadcast
              const { getSocket } = require('../services/locationService');
              const s = getSocket();
              s?.emit('driver:order-status', { orderId: order._id, status: 'delivered' });
              navigation.replace('Dashboard', { driver });
            },
          },
        ]
      );
    } else {
      const { getSocket } = require('../services/locationService');
      const s = getSocket();
      s?.emit('driver:order-status', { orderId: order._id, status: currentStep.status });
      setStatusIndex((prev) => prev + 1);
    }
  };

  const deliveryCoords = order?.deliveryAddress?.coordinates;
  const currentStep = STATUS_FLOW[statusIndex] || STATUS_FLOW[STATUS_FLOW.length - 1];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.lat || 37.7749,
          longitude: currentLocation?.lng || -122.4194,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
            title="You"
          >
            <View style={styles.driverDot}>
              <Text style={{ fontSize: 24 }}>🚗</Text>
            </View>
          </Marker>
        )}
        {deliveryCoords && (
          <Marker
            coordinate={{ latitude: deliveryCoords.lat, longitude: deliveryCoords.lng }}
            title="Delivery Point"
          >
            <View style={styles.destDot}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Order Panel */}
      <View style={styles.panel}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Text style={styles.address}>
            📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
          </Text>
          <Text style={styles.customer}>
            👤 {order.customer?.name} • 📞 {order.customer?.phone}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{currentStep.label}</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleNextStatus}>
          <Text style={styles.actionBtnText}>{currentStep.btnLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  driverDot: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  destDot: {
    backgroundColor: '#2ecc71',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  panel: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  orderInfo: { gap: 4 },
  orderNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  address: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  customer: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  statusBadge: {
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2ecc71',
    alignItems: 'center',
  },
  statusText: { color: '#2ecc71', fontSize: 14, fontWeight: '700' },
  actionBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});

export default ActiveDeliveryScreen;
