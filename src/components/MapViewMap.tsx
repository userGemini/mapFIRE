// src/components/MapViewMap.tsx
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
// Peta menggunakan react-native-maps tanpa UrlTile OpenStreetMap

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
<<<<<<< HEAD
=======
// Peta OpenStreetMap melalui Expo MapView dan OSM UrlTile

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD
=======
const OSM_TILE_URL = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)

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
<<<<<<< HEAD
    () => markers.find((marker) => marker.id === selectedId) ?? null,
=======
    () => markers.find(marker => marker.id === selectedId) ?? null,
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
    () => markers.find((marker) => marker.id === selectedId) ?? null,
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
    [markers, selectedId],
  );

  useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD
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
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
<<<<<<< HEAD
<<<<<<< HEAD
        onPress={onMapPress}
=======
        onPress={() => onMapPress()}
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
        onPress={onMapPress}
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
        pitchEnabled={false}
        rotateEnabled={false}
        zoomControlEnabled={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
<<<<<<< HEAD
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
=======
        mapType="standard"
        loadingEnabled
      >
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)

  map: {
    flex: 1,
  },

  markerWrapper: {
    alignItems: 'center',
  },

<<<<<<< HEAD
=======
  map: {
    flex: 1,
  },
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)

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
<<<<<<< HEAD
=======
  pinText: {
    fontSize: 16,
  },
  calloutContainer: {
    width: 200,
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
    padding: 12,
    backgroundColor: '#1e2130',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 10,
  },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)

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

<<<<<<< HEAD
=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutStatBox: {
    alignItems: 'center',
    flex: 1,
  },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutStatValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
<<<<<<< HEAD
<<<<<<< HEAD

  calloutStatus: {
=======
  calloutStatus: {
    color: '#E24B4A',
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

  calloutStatus: {
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 10,
  },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)

  calloutButtonRow: {
    marginTop: 8,
  },

<<<<<<< HEAD
=======
  calloutButtonRow: {
    marginTop: 8,
  },
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
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
<<<<<<< HEAD

=======
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
  calloutButtonText: {
    color: '#1D9E75',
    fontSize: 12,
    fontWeight: '600',
  },
<<<<<<< HEAD
<<<<<<< HEAD
});
=======
});
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329
=======
});
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
