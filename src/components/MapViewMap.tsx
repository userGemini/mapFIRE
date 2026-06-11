// src/components/MapViewMap.tsx
// Peta OpenStreetMap melalui Expo MapView dan OSM UrlTile

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
import type { RumahSensor } from '../types';
import { getStatusColor } from '../constants/colors';

interface Props {
  markers: RumahSensor[];
  selectedId: string | null;
  onMarkerPress: (rumah: RumahSensor) => void;
  onMapPress: () => void;
  onInfoPress?: (rumah: RumahSensor) => void;
}

const initialRegion = {
  latitude: -7.265,
  longitude: 112.752,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const OSM_TILE_URL = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function MapViewMap({
  markers,
  selectedId,
  onMarkerPress,
  onMapPress,
  onInfoPress,
}: Props): React.JSX.Element {
  const mapRef = useRef<MapView>(null);

  const selectedMarker = useMemo(
    () => markers.find(marker => marker.id === selectedId) ?? null,
    [markers, selectedId],
  );

  useEffect(() => {
    if (selectedMarker) {
      mapRef.current?.animateToRegion(
        {
          latitude: selectedMarker.lat,
          longitude: selectedMarker.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400,
      );
    }
  }, [selectedMarker]);

  const markerViews = useMemo(
    () => markers.map(rumah => {
      const isSelected = rumah.id === selectedId;
      const markerColor = getStatusColor(rumah.status);
      return (
        <Marker
          key={rumah.id}
          coordinate={{ latitude: rumah.lat, longitude: rumah.lng }}
          tracksViewChanges={false}
          onPress={() => onMarkerPress(rumah)}
        >
          <View style={[styles.pin, {
            borderColor: markerColor,
            backgroundColor: isSelected ? markerColor : '#111824',
          }]}
          >
            <Text style={styles.pinText}>🏠</Text>
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{rumah.nama}</Text>
              <Text style={styles.calloutSubtitle}>{rumah.alamat}</Text>
              <View style={styles.calloutRow}>
                <View style={styles.calloutStatBox}>
                  <Text style={styles.calloutStatValue}>{rumah.suhu != null ? rumah.suhu.toFixed(1) : '--'}</Text>
                  <Text style={styles.calloutStatLabel}>°C</Text>
                </View>
                <View style={styles.calloutStatBox}>
                  <Text style={styles.calloutStatValue}>{rumah.asap != null ? rumah.asap.toFixed(1) : '--'}</Text>
                  <Text style={styles.calloutStatLabel}>Asap</Text>
                </View>
                <View style={styles.calloutStatBox}>
                  <Text style={styles.calloutStatValue}>{rumah.co != null ? rumah.co.toFixed(2) : '--'}</Text>
                  <Text style={styles.calloutStatLabel}>CO</Text>
                </View>
              </View>
              <Text style={styles.calloutStatus}>{rumah.status.toUpperCase()}</Text>
              <View style={styles.calloutButtonRow}>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => onInfoPress?.(rumah)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calloutButtonText}>ℹ️ Info Lokasi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Callout>
        </Marker>
      );
    }),
    [markers, onMarkerPress, selectedId],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={() => onMapPress()}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomControlEnabled={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          tileSize={256}
          zIndex={-1}
        />
        {markerViews}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  pinText: {
    fontSize: 16,
  },
  calloutContainer: {
    width: 200,
    padding: 12,
    backgroundColor: '#1e2130',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  calloutTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 10,
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calloutStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  calloutStatValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  calloutStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  calloutStatus: {
    color: '#E24B4A',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 10,
  },
  calloutButtonRow: {
    marginTop: 8,
  },
  calloutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30, 156, 118, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.4)',
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#1D9E75',
    fontSize: 12,
    fontWeight: '600',
  },
});
