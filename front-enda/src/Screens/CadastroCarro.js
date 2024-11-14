import React, { useState } from "react";
import { Image, View, Text, TextInput, Switch,Dimensions ,TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

const rota = "http://10.111.9.26"

export default function CadastroVeiculo() {
  const navigation = useNavigation();
  const [isCar, setIsCar] = useState(true);  // Estado para controlar tipo de veículo (carro ou moto)
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [cor, setCor] = useState('');

  // Função para retornar ao menu anterior
  const VoltarTela = () => {
    navigation.navigate("Menu");
  };

  // Função para validar os campos
  const validateFields1 = () => {
    const errors = {};
    if (!placa) errors.placa = "Placa é obrigatória";
    if (!modelo) errors.modelo = "Modelo é obrigatório";
    if (!marca) errors.marca = "Marca é obrigatória";
    if (!cor) errors.cor = "Cor é obrigatória";
    return errors;
  };

  // Função para enviar os dados ao backend
  const handleCadastroVeiculo = async () => {
    const tipo_veiculo = isCar ? 1 : 2;
    const validationError1 = validateFields1();
    
    if (Object.keys(validationError1).length > 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
        console.log("clicou");
      const response = await fetch(`${rota}:3000/cadastro_veiculo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo_veiculo, placa, marca, modelo, cor }),
      });

      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.error || 'Erro ao realizar cadastro');
        }
        
        Alert.alert('Sucesso', 'Veículo cadastrado com sucesso!');
        navigation.navigate('Menu');
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error.message);
      Alert.alert('Erro', 'Erro ao realizar o cadastro. Por favor, tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={VoltarTela}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      <Text style={styles.title}>CADASTRE SEU VEÍCULO</Text>

      <Text style={styles.subtitle}>Selecione seu tipo de veículo</Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchItem}>
          <Image source={require("../../assets/Imgs/carroMenu.jpg")} style={styles.vehicleImage} />
          <Text style={styles.switchLabel}>CARRO</Text>
          <Switch
            value={isCar}
            onValueChange={(value) => setIsCar(value)}
            trackColor={{ false: '#000', true: '#48d1cc' }}
            thumbColor={isCar ? '#d2f0ee' : '#d2f0ee'}
          />
        </View>

        <View style={styles.switchItem}>
          <Image source={require("../../assets/Imgs/motoMenu.jpg")} style={styles.vehicleImage} />
          <Text style={styles.switchLabel}>MOTO</Text>
          <Switch
            value={!isCar}
            onValueChange={() => setIsCar(!isCar)}
            trackColor={{ false: '#000', true: '#48d1cc' }}
            thumbColor={!isCar ? '#d2f0ee' : '#d2f0ee'}
          />
        </View>
      </View>

      <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Informe a Placa"
        value={placa}
        onChangeText={setPlaca}
      />
      <TextInput
        style={styles.input}
        placeholder="Informe a Marca"
        value={marca}
        onChangeText={setMarca}
      />
      <TextInput
        style={styles.input}
        placeholder="Informe o Modelo"
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        style={styles.input}
        placeholder="Informe a Cor"
        value={cor}
        onChangeText={setCor}
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastroVeiculo}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2f0ee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 20,
    padding: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
    marginBottom: 30,
    margin: 20,
    backgroundColor: "#d2f0ee",
    padding: 10,
    borderRadius: 20,
  },
  switchItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
  },
  vehicleImage: {
    width: 130,
    height: 60,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#73D2C0', // Cor de fundo do formulário
    padding: 35,
    width: width,
    height: height * 0.63,
    borderRadius: 50,
  },
});
