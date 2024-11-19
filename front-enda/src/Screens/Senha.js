import React, { useState, useEffect } from 'react';
import { View, Image, TextInput, StyleSheet, Alert, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const EsqueceuSenha = ({ navigation }) => {
    const rota = "http://192.168.0.222:3000"; // Certifique-se de que esta URL está correta

    const [email, setEmail] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [borderColor] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        Animated.timing(borderColor, {
            toValue: isFocused ? 1 : 0,
            duration: 0,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePasswordReset = async () => {
        if (!validateEmail(email)) {
            Alert.alert('Email inválido', 'Por favor, insira um endereço de email válido.');
            return;
        }

        try {
            await axios.post(`${rota}/forgot-password`, { email }); // Ajustado o endpoint para `/forgot-password`
            Alert.alert(
                'Email Enviado',
                'Um link de recuperação de senha foi enviado para o seu email.',
                [
                    { text: 'OK', onPress: () => navigation.navigate('VerificarCodigo', { email: email }) }
                ]
            );
        } catch (error) {
            console.error('Erro ao enviar o email de recuperação:', error);
            let errorMessage = 'Ocorreu um erro ao enviar o email de recuperação.';
            if (error.response) {
                errorMessage += ` Detalhes: ${error.response.data.message || error.response.data.error}`;
            }
            Alert.alert('Erro', errorMessage);
        }
    };

    const borderColorInterpolated = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D2F0EE', '#D2F0EE'],
    });

    return (
        <Animated.View View style={[styles.container, { opacity: fadeAnim }]}>
            <Image style={styles.logo} source={require('../../assets/Imgs/Avatar Home.png')} />
            <View  style={styles.container_2}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <View style={styles.inputContainer}>
                <Animated.View style={[styles.inputWrapper, { borderColor: borderColorInterpolated }]}>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Email"
                        placeholderTextColor="#000000"
                        
                    />
                </Animated.View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
                <Text style={styles.buttonText}>Enviar Link de Recuperação</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Voltar para o Login</Text>
            </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D2F0EE',
        justifyContent: 'center',
        alignItems: 'center',
        height: height *  0.9,

    },
    container_2: {
        backgroundColor: '#73D2C0',
        width: width ,
        height: height *  0.65 ,
        alignItems: 'center',
        paddingVertical: "20%",
        borderTopLeftRadius: 45,
        borderTopRightRadius: 45,
        shadowColor: '#000',
      },
    logo: {
        height: 150,
        width: 150,
        marginBottom: 20,
        marginTop: 350
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#090909',
        marginBottom: 20,
    },
    inputContainer: {
        width: '90%',
        marginBottom: 20,
    },
    inputWrapper: {
        borderWidth: 1,
        borderRadius: 30,
    },
    input: {
        width: width * 0.8,
        borderRadius:  30,
        height: 60,
        alignItems: "center",
        padding: 15,
        fontSize: 15,
        color: '#000000',
    },
    button: {
        backgroundColor: '#000000',
        width: '90%',
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 45,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 15,
    },
    linkText: {
        color: 'black',
        fontSize: 14,
    },
});

export default EsqueceuSenha;
