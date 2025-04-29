    import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert,Dimensions, Text, TouchableOpacity, Animated, Image } from 'react-native';
import axios from 'axios';


const { width, height } = Dimensions.get('window');

const VerificarCodigo = ({ navigation, route }) => {
    const rota = "http://192.168.46.146:3000"; // Certifique-se de que esta URL está correta
    const [codigo, setCodigo] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [borderColor] = useState(new Animated.Value(0));

    const email = route.params?.email; // Assume que o email foi passado pela navegação

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        Animated.timing(borderColor, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleVerifyCode = async () => {
        if (!codigo) {
            Alert.alert('Código inválido', 'Por favor, insira o código de verificação.');
            return;
        }

        if (!email) {
            Alert.alert('Erro', 'O email não foi fornecido. Volte e tente novamente.');
            return;
        }

        try {
            // Envia o código e o email para o backend
            const response = await axios.post(`${rota}/verify-code`, { code: codigo, email });

            if (response.data.success) {
                Alert.alert(
                    'Código Verificado',
                    'O código foi verificado com sucesso. Agora você pode redefinir sua senha.',
                    [
                        { text: 'OK', onPress: () => navigation.navigate('RedefinirSenha', { email }) }
                    ]
                );
            } else {
                Alert.alert('Erro', 'Código de verificação inválido ou expirado.');
            }
        } catch (error) {
            console.error('Erro ao verificar o código:', error);
            let errorMessage = 'Ocorreu um erro ao verificar o código.';
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
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Image style={styles.logo} source={require('../../assets/Imgs/Email.png')} />
            <View style={styles.container_2}>

            <Text style={styles.title}>Verificar Código</Text>
            <View style={styles.inputContainer}>
                <Animated.View style={[styles.inputWrapper, { borderColor: borderColorInterpolated }]}>
                    <TextInput
                        style={styles.input}
                        value={codigo}
                        onChangeText={setCodigo}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Digite o código de verificação"
                        placeholderTextColor="#000000"
                        />
                </Animated.View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>Verificar Código</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('EsqueceuSenha')}>
                <Text style={styles.linkText}>Voltar para Esqueceu a Senha</Text>
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

export default VerificarCodigo;
