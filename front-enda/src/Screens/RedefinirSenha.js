import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Dimensions, Alert, Image} from 'react-native';
import { Button } from '../Componentes/Buttons';
import { TextoInput } from '../Componentes/Textos'; // Atualize se houver outros componentes necessários
import { useNavigation, useRoute } from '@react-navigation/native'; // Importa useRoute para acessar parâmetros da navegação

const { width, height } = Dimensions.get('window');
const rota = "http://192.168.15.17:3000";

export default function RedefinirSenha() {
  const navigation = useNavigation();
  const route = useRoute(); // Usa useRoute para acessar parâmetros da navegação
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');

  // Obtém o e-mail passado como parâmetro
  const { email } = route.params || {}; 

  const handleRedefinirSenha = async () => {
    if (!senha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
  
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
  
    try {
      // Envia o e-mail do usuário e a nova senha para o backend
      const response = await fetch(`${rota}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
  
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json(); // Parse do JSON
        if (response.ok) {
          Alert.alert(
            'Sucesso',
            'Sua senha foi redefinida com sucesso!',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        } else {
          setError(data.error || 'Erro ao redefinir a senha');
        }
      } else {
        const text = await response.text(); // Obtém a resposta como texto
        console.error('Resposta inesperada do servidor:', text);
        setError('Resposta inesperada do servidor');
      }
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error.message);
      setError('Erro ao se conectar ao servidor');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/Imgs/Crip.png')} />
        <View style={styles.container_2}>
          <TextoInput
            color={"#D2F0EE"}
            width={width * 0.8}
            borda={30}
            margin={20}
            height={60}
            lugar={"center"}
            tamanho={20}
            holder={"Nova Senha"}
            secureTextEntry={true}
            value={senha}
            descricao={setSenha}
          />
          <TextoInput
            color={"#D2F0EE"}
            width={width * 0.8}
            borda={30}
            height={60}
            lugar={"center"}
            tamanho={20}
            holder={"Confirmar Nova Senha"}
            secureTextEntry={true}
            value={confirmarSenha}
            descricao={setConfirmarSenha}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            texto={` Redefinir Senha`}
            texcolor={"white"}
            acao={handleRedefinirSenha}
            width={width * 0.8 * 0.5}
            margin={20}
            padding={10}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    height: height * 1,
    width: width * 1
  },
  container: {
    flex: 1,
    backgroundColor: '#D2F0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container_2: {
    backgroundColor: '#73D2C0',
    width: width ,
    height: height *  0.65 ,
    alignItems: 'center',
    paddingVertical: "40%",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    shadowColor: '#000',
  },
  errorText: {
    color: '#000000',
    fontWeight: 'bold',
    marginVertical: 10,
    fontSize: 16,
  },
  logo: {
    height: 310,
    width: 310,
    marginBottom: 0,
},
});
