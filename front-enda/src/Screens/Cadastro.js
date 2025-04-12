import React, { useState } from "react";
import { StyleSheet, View, Image, FlatList, Dimensions, Text, TouchableOpacity } from "react-native";
import { Button } from "../Componentes/Buttons";
import { Texto, TextoInput } from "../Componentes/Textos";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // Importação para os ícones

const { width, height } = Dimensions.get("window");
const rota = "http://192.168.15.17"

export default function Cadastro({}) {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    telefone: '',
    cpf: '',
    endereco: '',
    cep: ''
  });

  const [errors, setErrors] = useState({});
  const [senhaVisivel, setSenhaVisivel] = useState(false); // Estado para controlar a visibilidade da senha

  const toggleSenhaVisivel = () => {
    setSenhaVisivel(!senhaVisivel); // Alterna a visibilidade
  };

  const validateFields = () => {
    const newErrors = {};

    if (!form.nome) newErrors.nome = 'Nome é obrigatório.';
    if (!form.sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório.';
    if (!form.email.includes('@')) newErrors.email = 'E-mail inválido.';
    if (form.senha.length < 8) newErrors.senha = 'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.';
    if (!/^\d{11}$/.test(form.telefone)) newErrors.telefone = 'Telefone inválido.';
    if (!/^\d{11}$/.test(form.cpf)) newErrors.cpf = 'CPF inválido.';
    if (!form.endereco) newErrors.endereco = 'Endereço é obrigatório.';
    if (!/^\d{8}$/.test(form.cep)) newErrors.cep = 'CEP inválido.';

    return newErrors;
  };

  const handleInputChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleCadastro = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${rota}:3000/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro');
      }

      alert(data.msg);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error.message);
    }
  };

  const campos = [
    { key: 'nome', label: 'Nome', placeholder: `Digite seu nome`, value: form.nome, error: errors.nome },
    { key: 'sobrenome', label: 'Sobrenome', placeholder: `Digite seu sobrenome`, value: form.sobrenome, error: errors.sobrenome },
    { key: 'email', label: 'E-mail', placeholder: 'Digite seu e-mail', value: form.email, error: errors.email },
    { key: 'senha', label: 'Senha', placeholder: 'Digite sua senha', value: form.senha, error: errors.senha },
    { key: 'telefone', label: 'Telefone', placeholder: 'Digite seu telefone', value: form.telefone, error: errors.telefone },
    { key: 'cpf', label: 'CPF', placeholder: 'Digite seu CPF', value: form.cpf, error: errors.cpf },
    { key: 'endereco', label: 'Endereço', placeholder: 'Digite seu endereço', value: form.endereco, error: errors.endereco },
    { key: 'cep', label: 'CEP', placeholder: 'Digite seu CEP', value: form.cep, error: errors.cep }
  ];

  const navigateToLogin = () => {
    navigation.navigate("Login", { screen: "Login" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.container_img}>
        <Image
          style={styles.img}
          source={require("../../assets/Imgs/carrinho.png")}
        />
      </View>

      <FlatList
        data={campos}
        renderItem={({ item }) => (
          <View style={styles.inputContainer}>
            <Texto msg={item.label} cor={"#000000"} tamanho={20} margin={0} />
            
            {item.key === 'senha' ? (
              <View style={styles.passwordContainer}>
                <TextoInput
                  tamanho={20}
                  width={330}
                  borda={25}
                  height={45}
                  lugar={"left"}
                  margin={3}
                  cor={"#ffffff"}
                  color={"#ffffff7c"}
                  secureTextEntry={!senhaVisivel} // Utilizando seu componente TextoInput
                  value={item.value}
                  descricao={(text) => handleInputChange(item.key, text)}
                  placeholder={item.placeholder}
                />
              </View>              
            ) : (
              <TextoInput
                tamanho={20}
                width={330}
                borda={25}
                height={45}
                lugar={"left"}
                margin={3}
                cor={"#ffffff"}
                color={"#ffffff7c"}
                value={item.value}
                descricao={(text) => handleInputChange(item.key, text)}
                placeholder={item.placeholder}
              />
            )}
            {item.error && <Text style={styles.errorText}>{item.error}</Text>}
          </View>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.Componentes}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Button
              color={"#d2f0eee0"}
              texto={"Cadastrar"}
              texcolor={"#000000"}
              tamanho={330}
              borda={30}
              height={50}
              width={200}
              margin={10}
              acao={handleCadastro}
            />

            <View style={styles.container_2}>
              <Texto
                acao={navigateToLogin}
                msg={"Já possui uma conta? Faça o login"}
                cor={"#000000"}
                tamanho={15}
                margin={20}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#73D2C0",
  },
  img: {
    height: 70,
    width: 70,
    margin: 10,
    alignItems: "flex-end"
  },
  container_img: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 20,
  },
  Componentes: {
    alignItems: "center",
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  errorText: {
    color: '#000000',
    marginTop: 5,
    marginLeft: 10,
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
  },
  container_2: {
    backgroundColor: "#D2F0EE",
    width: width,
    height: 100,
    alignItems: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    shadowColor: '#000',
  },
});
