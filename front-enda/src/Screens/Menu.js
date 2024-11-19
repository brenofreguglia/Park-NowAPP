import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, ScrollView, TextInput, TouchableOpacity, Alert, Text, Linking } from "react-native";
import { Button } from "../Componentes/Buttons";
import { Texto } from "../Componentes/Textos";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';

const rota = "http://192.168.0.222:3000";

export default function Menu() {
  const route = useRoute();
  const { user } = route.params || {};
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState({
    latitude: -22.121265,
    longitude: -51.383400,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerLocation, setMarkerLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [locais, setLocais] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (user) {
      Toast.show({
        type: 'success',
        text1: `Seja bem-vindo, ${user}!`,
        position: 'center',
        visibilityTime: 4000,
      });
    }
  }, [user]);

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'A permissão para acessar a localização foi negada.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setMarkerLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchLocais = async () => {
      try {
        const response = await fetch(`${rota}/api/locais`); // URL do seu backend
        const data = await response.json();
        setLocais(data);
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
        Alert.alert('Erro', 'Não foi possível carregar os locais.');
      }
    };

    fetchLocais();
  }, []);

  const Busca = async () => {
    try {
      const geocoding = await Location.geocodeAsync(search);
      if (geocoding.length > 0) {
        const { latitude, longitude } = geocoding[0];
        const searchRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(searchRegion);
        setMarkerLocation({ latitude, longitude });

        if (mapRef.current) {
          mapRef.current.animateToRegion(searchRegion, 1000);
        }
      } else {
        Alert.alert('Local não encontrado', 'Não foi possível encontrar o local pesquisado.');
      }
    } catch (error) {
      Alert.alert( 'Não foi possível realizar a busca, coloque o nome do local');
    }
  };

  // const openGoogleMaps = (local) => {
  //   if (origin && local) {
  //     const originLatLng = `${origin.latitude},${origin.longitude}`;
  //     const destinationLatLng = `${local.latitude},${local.longitude}`;
  //     // const url = `https://www.google.com/maps/dir/?api=1&origin=${originLatLng}&destination=${destinationLatLng}`;
  //     // Linking.openURL(url).catch((err) => {
  //     //   Alert.alert('Erro', 'Não foi possível abrir o Google Maps: ' + err.message);
  //     // });
  //   } else {
  //     Alert.alert('Erro', 'Defina um ponto de origem e um destino antes de tentar navegar.');
  //   }
  // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.searchContainer}>
    <TextInput 
      style={styles.searchInput}
      placeholder="🔎 Busca"
      value={search}
      onChangeText={setSearch}
    />
    <TouchableOpacity style={styles.searchButton} onPress={Busca}>
      <Text style={styles.searchButtonText}>OK</Text>
    </TouchableOpacity>
  </View>
      <View style={styles.container_geo}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation={true}
        >
          {/* Marcadores dos locais */}
          {locais.map((local) => (
            <Marker
              key={local.id_lugar}
              coordinate={{ latitude: parseFloat(local.latitude), longitude: parseFloat(local.longitude)  }}
              title={local.nome}
              // onPress={() => openGoogleMaps(local)} 
            >
              <Image
                source={require('../../assets/Imgs/customMarker.png')} 
                style={styles.markerImage}
              />
            </Marker>
          ))}

          {/* Marcador da localização pesquisada */}
          {markerLocation && (
            <Marker
              coordinate={markerLocation}
              title="Localização Pesquisada"
            >
              <Image
                source={require('../../assets/Imgs/customMarker.png')} 
                style={styles.markerImage}
              />
            </Marker>
          )}
        </MapView>
      </View>

      <Texto 
        cor={"black"} 
        msg={"Estacionamentos Disponiveis:"}
        tamanho={20}
        margin={20}
      />

     {/* Lista de vagas */}
<View style={styles.vagasContainer}>
  <Text style={styles.sectionTitle}>Vagas Disponíveis:</Text>
  {locais.map((local) => (
    <TouchableOpacity
      key={local.id_lugar}
      style={styles.vagaItem}
      onPress={() => navigation.navigate('Estacionamento', { id_lugar: local.id_lugar, nome: local.nome })}
    >
      <Image
        source={require('../../assets/Imgs/customMarker.png')}
        style={styles.markerImageText}
      />
      <Text style={styles.vagaText}>{local.nome}</Text>
    </TouchableOpacity>
  ))}
</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#D2F0EE",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  markerImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  markerImageText: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  vagaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  searchButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#73D2C0',
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container_geo: {
    borderRadius: 10,
    borderWidth: 6,
    borderColor: '#fff',
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e1d1d1",
    height: 240,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  vehiclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: '100%',
  },
  vehicle: {
    backgroundColor: "#fff",
    width: 150,
    height: 200,
    margin: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  vehicleImage: {
    width: 120,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  vagasContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  vagaText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
