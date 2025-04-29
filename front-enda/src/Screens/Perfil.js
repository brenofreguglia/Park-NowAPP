import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Texto } from '../Componentes/Textos';

const { height, width } = Dimensions.get('window');

const rota = "http://192.168.46.146:3000"; // Certifique-se de que a URL está correta!

export default function Perfil({ handleLogout }) {
  const [userName, setUserName] = useState('');
  const [recentRentals, setRecentRentals] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar nome de usuário
        const nome = await AsyncStorage.getItem('userName');
        if (nome) {
          setUserName(nome);
        }

        // Carregar aluguéis recentes
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${rota}/api/alugueis/${userId}`);
          if (!response.ok) {
            throw new Error('Erro ao buscar dados: ' + response.statusText);
          }
          const rentals = await response.json();
          console.log('Resposta da API:', rentals);
          if (Array.isArray(rentals)) {
            setRecentRentals(rentals);
          } else {
            throw new Error('A resposta da API não contém um array válido.');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os aluguéis recentes. Por favor, tente novamente mais tarde.');
      }
    };

    fetchData();
  }, []);

  const VoltarTela = () => {
    navigation.navigate("Menu");
  };

  const handleEditPress = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        navigation.navigate('EditarPerfil', { userId: id });
      } else {
        Alert.alert('Erro', 'Não foi possível obter o ID do usuário');
      }
    } catch (error) {
      console.error('Erro ao obter o userId do AsyncStorage:', error);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await handleLogout();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.backButton} onPress={VoltarTela}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={require("../../assets/Imgs/Avatar.png")} style={styles.image} />
        <View style={styles.profileDetails}>
          <Texto cor={"#000000"} tamanho={24} marginR={10} msg={userName} />
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.recentRentalsTitle}>Aluguéis Recentes</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentRentals.length > 0 ? (
            recentRentals.map((rental, index) => (
              <View key={index} style={styles.rentalCard}>
                <Text style={styles.rentalText}>Local: {rental.nome_local}</Text>
                <Text style={styles.rentalText}>Vaga: {rental.vaga_selecionada}</Text>
                <Text style={styles.rentalText}>Data: {new Date(rental.data_aluguel).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRentalsText}>Nenhum aluguel recente.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#73D2C0',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#73D2C0',
    width: '100%',
    alignItems: 'center',
    paddingVertical: height * 0.05,
    position: 'absolute',
    top: 0,
    paddingTop: height * 0.05 + 20,
  },
  backButton: {
    position: 'absolute',
    left: width * 0.05,
    top: height * 0.05,
  },
  image: {
    height: width * 0.35,
    width: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    margin: 20,
    resizeMode: 'cover',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#D2F0EE',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#060606',
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#D2F0EE',
    borderRadius: 20,
    position: 'absolute',
    right: width * 0.05,
    top: height * 0.05,
  },
  logoutButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: height * 1,
    position: 'absolute',
    top: height * 0.4,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 20,
  },
  recentRentalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rentalCard: {
    backgroundColor: '#f2f2f2',
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
  },
  rentalText: {
    fontSize: 14,
    color: '#333',
  },
  noRentalsText: {
    fontSize: 16,
    color: '#888',
  },
});
