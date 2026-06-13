// src/components/MapViewMap.tsx
<<<<<<< HEAD
// Peta menggunakan react-native-maps tanpa UrlTile OpenStreetMap

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
=======
// Peta OpenStreetMap melalui Expo MapView dan OSM UrlTile

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
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

<<<<<<< HEAD
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
=======
const OSM_TILE_URL = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329

export default function MapViewMap({
  markers,
  selectedId,
  onMarkerPress,
  onMapPress,
  onInfoPress,
}: Props): React.JSX.Element {
  const mapRef = useRef<MapView>(null);

  const selectedMarker = useMemo(
<<<<<<< HEAD
    () => markers.find((marker) => marker.id === selectedId) ?? null,
=======
    () => markers.find(marker => marker.id === selectedId) ?? null,
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
    [markers, selectedId],
  );

  useEffect(() => {
<<<<<<< HEAD
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
              key={rumah.id}
              coordinate={{
                latitude,
                longitude,
              }}
              tracksViewChanges={false}
              onPress={() => onMarkerPress(rumah)}
            >
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
    [markers, selectedId, onMarkerPress, onInfoPress],
=======
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
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
<<<<<<< HEAD
        onPress={onMapPress}
=======
        onPress={() => onMapPress()}
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
        pitchEnabled={false}
        rotateEnabled={false}
        zoomControlEnabled={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
<<<<<<< HEAD
        mapType="standard"
        loadingEnabled
      >
=======
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          tileSize={256}
          zIndex={-1}
        />
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
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
<<<<<<< HEAD

  map: {
    flex: 1,
  },

  markerWrapper: {
    alignItems: 'center',
  },

=======
  map: {
    flex: 1,
  },
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
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
<<<<<<< HEAD

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
=======
  pinText: {
    fontSize: 16,
  },
  calloutContainer: {
    width: 200,
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
    padding: 12,
    backgroundColor: '#1e2130',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 10,
  },
<<<<<<< HEAD

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

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutStatBox: {
    alignItems: 'center',
    flex: 1,
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutStatValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
<<<<<<< HEAD

  calloutStatus: {
=======
  calloutStatus: {
    color: '#E24B4A',
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 10,
  },
<<<<<<< HEAD

  calloutButtonRow: {
    marginTop: 8,
  },

=======
  calloutButtonRow: {
    marginTop: 8,
  },
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30, 156, 118, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.4)',
    alignItems: 'center',
  },
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
  calloutButtonText: {
    color: '#1D9E75',
    fontSize: 12,
    fontWeight: '600',
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
