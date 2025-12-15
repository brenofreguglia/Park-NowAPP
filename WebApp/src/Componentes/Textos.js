import React, { useState } from "react";
import { Text, StyleSheet, Dimensions, TextInput, View, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de instalar @expo/vector-icons

const { width } = Dimensions.get('window');

const TextoInput = ({
  holder,
  tamanho,
  color,
  width,
  borda,
  height,
  lugar,
  margin,
  cor,
  descricao,
  value,
  secureTextEntry,
  label,
  padding,
  marginV
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, { width: width, margin: margin }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, { width: width }]}>
        <TextInput
          placeholder={holder}
          placeholderTextColor={cor}
          aria-label={label}
          style={[
            styles.textInput,
            {
              backgroundColor: color,
              borderRadius: borda,
              height: height,
              textAlign: lugar,
              fontSize: tamanho,
              padding: padding,
              marginVertical: marginV,
              cor: cor
            },
          ]}
          onChangeText={descricao}
          value={value}
          secureTextEntry={secureTextEntry && !isPasswordVisible} // Usa o estado para visibilidade
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const Texto = ({ msg, tamanho = 16, cor = '#000', margin = 0, acao, marginR = 0 , alinhamento, padding}) => {
  return (
    <Text
      onPress={acao}
      style={[styles.texto, { fontSize: tamanho, color: cor, margin: margin, marginRight: marginR, alignItems: alinhamento, padding: padding}]}
    >
      {msg}
    </Text>
  );
};

const styles = StyleSheet.create({
  texto: {
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 15,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative', // Para garantir que o ícone esteja posicionado corretamente
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: 10,
  },
  label: {
    color: '#000',
    marginBottom: 5,
    fontWeight: 'bold',
  },
});

export { Texto, TextoInput };
