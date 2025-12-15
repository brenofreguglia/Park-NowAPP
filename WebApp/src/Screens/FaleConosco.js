import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Text, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 

const rota = "http://192.168.144.172:3000"
// const rota = "http://10.111.9.20:3000"

const { height, width } = Dimensions.get('window'); // Obter altura e largura da tela

const SendEmail = () => {
  const navigation = useNavigation();  // Move useNavigation para dentro do componente
  const [subject, setSubject] = useState(''); // Assunto do e-mail
  const [text, setText] = useState(''); // Corpo da mensagem
  const [clientEmail, setClientEmail] = useState(''); // E-mail do cliente
  const [loading, setLoading] = useState(false);

  const VoltarTela = () => {
    navigation.navigate("Menu");
  };

  const handleSendEmail = async () => {
    // Validação do e-mail do cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!subject || !text || !clientEmail) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    if (!emailRegex.test(clientEmail)) {
      Alert.alert('Erro', 'O e-mail fornecido é inválido.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${rota}/send-email`, { // mudar conforme o ip da máquina
        subject,
        text,
        clienteEmail: clientEmail // Enviando o e-mail do cliente
      });
      Alert.alert('Sucesso', response.data);
    } catch (error) {
      // Logando o erro para depuração
      console.error('Erro ao enviar o e-mail:', error.response || error.message);
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique os detalhes e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={VoltarTela}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.faleTextTitle}>Fale Conosco</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={require('../../assets/Imgs/oi.png')} style={styles.carIcon} />
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Erro, Falha ou Outro Assunto "
          value={subject}
          onChangeText={setSubject}
          placeholderTextColor="#000000"
        />
        <TextInput
          style={styles.input}
          placeholder="Seu E-mail"
          value={clientEmail}
          onChangeText={setClientEmail}
          keyboardType="email-address" // Facilita a entrada de e-mail
          autoCapitalize="none" // Evita que o e-mail seja capitalizado
          placeholderTextColor="#000000"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mensagem"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          placeholderTextColor="#000000"
        />

        <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
          <Text style={styles.buttonText}>Enviar E-mail</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Move o conteúdo para o topo
    backgroundColor: '#d2f0ee', // Fundo do formulário verde menta
  },
  header: {
    marginBottom: 20,
    marginTop: 40, // Move a seção para mais perto do topo
    alignItems: 'center',
  },
  faleTextTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Texto preto para contraste
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    left: width * 0.05, // 5% da largura da tela
    top: height * 0.02, // 2% da altura da tela
  },
  imageContainer: {
    alignItems: 'center', // Centraliza a imagem horizontalmente
    justifyContent: 'center', // Centraliza a imagem verticalmente
    marginBottom: 40, // Espaço entre a imagem e o formulário
  },
  carIcon: {
    width: 220, // Largura do ícone da imagem
    height: 220, // Altura do ícone da imagem
    resizeMode: 'contain', // Redimensiona a imagem sem distorcer
  },
  form: {
    backgroundColor: '#73D2C0', // Cor de fundo do formulário
    padding: 25,
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  input: {
    height: 50,
    borderColor: '#fff', // Borda branca
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#d2f0ee", // Fundo transparente para dar contraste ao placeholder
    color: '#000000', // Texto preto
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#000000', // Cor do botão
    padding: 12,
    borderRadius: 8,
    alignItems: 'center', // Centraliza o texto do botão
  },
  buttonText: {
    color: '#fff', // Cor do texto do botão
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 16,
  },
});

export default SendEmail;
