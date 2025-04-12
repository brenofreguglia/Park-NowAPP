import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Dimensions, Alert, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rota = "http://192.168.15.17:3000";
const screenHeight = Dimensions.get('window').height; // Use 'window' para obter a área disponível sem status bar
const screenWidth = Dimensions.get('window').width;

export default function EditarPerfil() {
  const [name, setName] = useState('');
  const [sobrenome, setsobrenome] = useState(''); 
  const [numero, setnumero] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState(''); 
  const [endereco, setendereco] = useState(''); 
  const [cep, setCep] = useState(''); 
  const [senha, setsenha] = useState('');
  const [confirmsenha, setConfirmsenha] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const id = await AsyncStorage.getItem('userId'); 
            if (id) {
                setUserId(id);

                let resposta = await fetch(`${rota}/buscar/${id}`); 

                if (resposta.ok) {
                    let dados = await resposta.json();
                    setName(dados.nome);
                    setsobrenome(dados.sobrenome);
                    setnumero(dados.telefone);
                    setEmail(dados.email);
                    setCpf(dados.cpf);
                    setendereco(dados.endereco);
                    setCep(dados.cep);
                } else {
                    Alert.alert('Erro', 'Usuário não encontrado');
                }
            } else {
                Alert.alert('Erro', 'ID do usuário não encontrado');
            }
        } catch (erro) {
            Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
        }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const validateFields = () => {
    const newErrors = {};
       // Validação do nome
       if (!name) {
        newErrors.name = 'Nome é obrigatório.';
    } else if (/\d/.test(name)) {
        newErrors.name = 'Nome não pode conter números.';
    }

    // Validação do sobrenome
    if (!sobrenome) {
        newErrors.sobrenome = 'Sobrenome é obrigatório.';
    } else if (/\d/.test(sobrenome)) {
        newErrors.sobrenome = 'Sobrenome não pode conter números.';
    }
    if (!email.includes('@')) newErrors.email = 'E-mail inválido.';
    if (senha.length < 8) newErrors.senha = 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.';
    if (!/^\d{11}$/.test(numero)) newErrors.numero = 'Telefone inválido.';
    if (!/^\d{11}$/.test(cpf)) newErrors.cpf = 'CPF inválido.';
    if (!endereco) newErrors.endereco = 'Endereço é obrigatório.';
    if (!/^\d{8}$/.test(cep)) newErrors.cep = 'CEP inválido.';

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (senha !== confirmsenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch(`${rota}/atualizar/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          nome: name,
          sobrenome: sobrenome,
          telefone: numero,
          email: email,
          senha: senha,
          cpf: cpf,
          endereco: endereco,
          cep: cep,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      navigation.navigate("Perfil");
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar os dados');
    }
  };

  const campos = [
    { key: 'name', label: 'Nome', placeholder: 'Digite seu nome', value: name, onChange: setName, error: errors.name },
    { key: 'sobrenome', label: 'Sobrenome', placeholder: 'Digite seu sobrenome', value: sobrenome, onChange: setsobrenome, error: errors.sobrenome },
    { key: 'email', label: 'E-mail', placeholder: 'Digite seu e-mail', value: email, onChange: setEmail, error: errors.email },
    { key: 'senha', label: 'Senha', placeholder: 'Digite sua senha', value: senha, onChange: setsenha, secureTextEntry: !showPassword, error: errors.senha, toggleShow: () => setShowPassword(!showPassword) },
    { key: 'confirmsenha', label: 'Confirmar Senha', placeholder: 'Confirme sua senha', value: confirmsenha, onChange: setConfirmsenha, secureTextEntry: !showConfirmPassword, toggleShow: () => setShowConfirmPassword(!showConfirmPassword), error: null },
    { key: 'numero', label: 'Telefone', placeholder: 'Digite seu telefone', value: numero, onChange: setnumero, keyboardType: 'number-pad', error: errors.numero },
    { key: 'cpf', label: 'CPF', placeholder: 'Digite seu CPF', value: cpf, onChange: setCpf, error: errors.cpf },
    { key: 'endereco', label: 'Endereço', placeholder: 'Digite seu endereço', value: endereco, onChange: setendereco, error: errors.endereco },
    { key: 'cep', label: 'CEP', placeholder: 'Digite seu CEP', value: cep, onChange: setCep, error: errors.cep },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Perfil")}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={profileImage ? { uri: profileImage } : require('../../assets/Imgs/Avatar.png')} style={styles.image} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <FlatList
          data={campos}
          renderItem={({ item }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={item.placeholder}
                  value={item.value}
                  onChangeText={item.onChange}
                  secureTextEntry={item.secureTextEntry}
                  keyboardType={item.keyboardType}
                />
                {(item.key === 'senha' || item.key === 'confirmsenha') && (
                  <TouchableOpacity onPress={item.toggleShow} style={styles.eyeIcon}>
                    <MaterialIcons name={item.secureTextEntry ? 'visibility-off' : 'visibility'} size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
              {item.error && <Text style={styles.errorText}>{item.error}</Text>}
            </View>
          )}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.scrollContainer}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    left: 20,
    top: screenHeight * 0.05, // Ajustado com base na altura da tela
    zIndex: 1,
  },
  profileHeader: {
    backgroundColor: '#73D2C0',
    width: '100%',
    alignItems: 'center',
    paddingVertical: screenHeight * 0.02, // Ajustado com base na altura da tela
    position: 'absolute',
    top: 0,
    paddingTop: screenHeight * 0.1, // Ajustado para mover a imagem mais para cima com base na altura da tela
  },
  image: {
    width: screenWidth * 0.4, // 40% da largura da tela
    height: screenWidth * 0.4, // Mantém a proporção 1:1
    borderRadius: (screenWidth * 0.4) / 2, // Torna a imagem circular
    marginBottom: 10,
  },
  card: {
    width: screenWidth, 
    backgroundColor: 'white',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    marginTop: screenHeight * 0.325,
    padding: 25,
    elevation: 5,
    flex: 1, 
  },
  inputContainer: {
    marginBottom: screenHeight * 0.02, // Ajuste do espaçamento entre inputs
  },
  label: {
    fontSize: screenWidth * 0.045, // Ajusta o tamanho da fonte com base na largura da tela
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: screenWidth * 0.03, // Ajusta o padding dos inputs com base na largura da tela
    borderRadius: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: screenWidth * 0.03, // Ajusta o tamanho da fonte dos erros com base na largura da tela
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#73D2C0',
    padding: screenHeight * 0.02, // Ajusta o padding do botão com base na altura da tela
    borderRadius: 10,
    alignItems: 'center',
    marginTop: screenHeight * 0.03, // Ajusta o espaçamento acima do botão com base na altura da tela
  },
  saveButtonText: {
    color: 'white',
    fontSize: screenWidth * 0.04, // Ajusta o tamanho da fonte do botão com base na largura da tela
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1, 
    justifyContent: 'center',
  },
});