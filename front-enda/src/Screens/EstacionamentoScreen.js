import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const rota = "http://10.111.9.20:3000";

export default function EstacionamentoScreen({ route }) {
  const { id_lugar } = route.params;
  const [localData, setLocalData] = useState(null);
  const [vagas, setVagas] = useState([]);

  useEffect(() => {
    const fetchEstacionamentoData = async () => {
      try {
        const response = await fetch(`${rota}/api/locais/${id_lugar}`);
        const data = await response.json();
        setLocalData(data.local);
        setVagas(data.vagas);
      } catch (error) {
        console.error('Erro ao buscar detalhes do estacionamento:', error);
      }
    };

    fetchEstacionamentoData();
  }, [id_lugar]);

  const renderVaga = ({ item }) => (
    <View style={styles.vaga}>
      {item.Status === 'O' ? (  // Exemplo: "O" para ocupado e "L" para livre
        <Image source={require('../../assets/Imgs/carroOcupado.png')} style={styles.carIcon} />
      ) : (
        <Image source={require('../../assets/Imgs/vagaLivre.png')} style={styles.vagaIcon} />
      )}
    </View>
  );

  if (!localData) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{localData.nome}</Text>
      <Text style={styles.details}>Cidade: {localData.cidade}</Text>
      <Text style={styles.details}>Endereço: {localData.endereco}</Text>
      <Text style={styles.details}>Total de Vagas: {localData.vagas}</Text>

      <FlatList
        data={vagas}
        renderItem={renderVaga}
        keyExtractor={(item) => item.Descricao}
        numColumns={5}  // Exibindo as vagas em uma matriz com 5 colunas
        contentContainerStyle={styles.vagaContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#D2F0EE",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    marginBottom: 5,
  },
  vagaContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  vaga: {
    width: 60,
    height: 60,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#73D2C0',
    borderRadius: 10,
  },
  carIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  vagaIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
