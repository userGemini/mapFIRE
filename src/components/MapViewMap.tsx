// src/components/MapViewMap.tsx
// Peta menggunakan react-native-maps tanpa UrlTile OpenStreetMap

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
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

const getLatitude = (rumah: RumahSensor): number => {
  return (rumah as any).lat ?? (rumah as any).latitude ?? initialRegion.latitude;
};

const getLongitude = (rumah: RumahSensor): number => {
  return (rumah as any).lng ?? (rumah as any).longitude ?? initialRegion.longitude;
};

const isValidCoordinate = (latitude: number, longitude: number): boolean => {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export default function MapViewMap({
  markers,
  selectedId,
  onMarkerPress,
  onMapPress,
  onInfoPress,
}: Props): React.JSX.Element {
  const mapRef = useRef<MapView>(null);

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.id === selectedId) ?? null,
    [markers, selectedId],
  );

  useEffect(() => {
    if (!selectedMarker) {
      return;
    }

    const latitude = getLatitude(selectedMarker);
    const longitude = getLongitude(selectedMarker);

    if (!isValidCoordinate(latitude, longitude)) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      400,
    );
  }, [selectedMarker]);

  const markerViews = useMemo(
    () =>
      markers
        .filter((rumah) => {
          const latitude = getLatitude(rumah);
          const longitude = getLongitude(rumah);

          return isValidCoordinate(latitude, longitude);
        })
        .map((rumah) => {
          const latitude = getLatitude(rumah);
          const longitude = getLongitude(rumah);
          const isSelected = rumah.id === selectedId;
          const markerColor = getStatusColor(rumah.status);

          return (
            <Marker
            anchor={{ x: 0.5, y: 0.5 }}
              key={rumah.id}
              coordinate={{
                latitude,
                longitude,
              }}
              tracksViewChanges={true} //false untuk performa, true untuk marker yang dipilih agar animasi callout lancar
              onPress={() => onMarkerPress(rumah)}
            >
            <View style={styles.markerContainer}>
              <View style={styles.markerWrapper}>
                <View
                  style={[
                    styles.pin,
                    {
                      borderColor: markerColor,
                      backgroundColor: isSelected ? markerColor : '#111824',
                    },
                  ]}
                >
                  <Text style={styles.pinText}>🏠</Text>
                </View>

                {isSelected && (
                  <View style={styles.markerCoordinateBox}>
                    <Text style={styles.markerCoordinateText}>
                      {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

              <Callout tooltip onPress={() => onInfoPress?.(rumah)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{rumah.nama}</Text>
                  <Text style={styles.calloutSubtitle}>{rumah.alamat}</Text>

                  <View style={styles.coordinateBox}>
                    <Text style={styles.coordinateText}>
                      Lat: {latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.coordinateText}>
                      Lng: {longitude.toFixed(6)}
                    </Text>
                  </View>

                  <View style={styles.calloutRow}>
                    <View style={styles.calloutStatBox}>
                      <Text style={styles.calloutStatValue}>
                        {rumah.suhu != null ? rumah.suhu.toFixed(1) : '--'}
                      </Text>
                      <Text style={styles.calloutStatLabel}>°C</Text>
                    </View>

                    <View style={styles.calloutStatBox}>
                      <Text style={styles.calloutStatValue}>
                        {rumah.asap != null ? rumah.asap.toFixed(1) : '--'}
                      </Text>
                      <Text style={styles.calloutStatLabel}>Asap</Text>
                    </View>

                    <View style={styles.calloutStatBox}>
                      <Text style={styles.calloutStatValue}>
                        {rumah.co != null ? rumah.co.toFixed(2) : '--'}
                      </Text>
                      <Text style={styles.calloutStatLabel}>CO</Text>
                    </View>
                  </View>

                  <Text style={[styles.calloutStatus, { color: markerColor }]}>
                    {rumah.status.toUpperCase()}
                  </Text>

                  <View style={styles.calloutButtonRow}>
                    <View style={styles.calloutButtonMock}>
                      <Text style={styles.calloutButtonText}>ℹ️ Klik untuk Detail</Text>
                    </View>
                    {/* <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => onInfoPress?.(rumah)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.calloutButtonText}>ℹ️ Info Lokasi</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        }),
    [markers, selectedId, onMarkerPress, onInfoPress],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomControlEnabled={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        mapType="standard"
        loadingEnabled
      >
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

  calloutButtonMock: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30, 156, 118, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.4)',
    alignItems: 'center',
    marginTop: 8,
  },

  markerContainer: {
    padding: 5, 
    alignItems: 'center',
    justifyContent: 'center',
  },

  map: {
    flex: 1,
  },

  markerWrapper: {
    alignItems: 'center',
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

  markerCoordinateBox: {
    marginTop: 4,
    backgroundColor: 'rgba(17,24,36,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  markerCoordinateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  calloutContainer: {
    width: 210,
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

  coordinateBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },

  coordinateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
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