import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ChegarAoDestino() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vagaId = "" } = route.params || {}; // Verifica valores padrão

  const [tempo, setTempo] = useState(3600); // Inicializando com 1 hora (3600 segundos)

  useEffect(() => {
    if (tempo <= 0) {
      liberarVaga();
      Alert.alert(
        "Tempo Esgotado",
        "O tempo para chegar ao destino acabou, a vaga foi liberada."
      );
      navigation.navigate("Estacionamento");
      return;
    }

    const interval = setInterval(() => {
      setTempo((prev) => prev - 1); // Decrementa o tempo a cada segundo
    }, 1000);

    return () => clearInterval(interval); // Limpa o intervalo quando o componente for desmontado ou o tempo acabar
  }, [tempo, navigation, vagaId]);

  const liberarVaga = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.222:3000/api/liberar-vaga?id=${vagaId}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Erro ao liberar a vaga.");
    } catch (error) {
      console.error("Erro ao liberar a vaga:", error);
    }
  };

  const formatarTempo = (segundos) => {
    if (typeof segundos !== "number") return "00:00";
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segundosRestantes
      .toString()
      .padStart(2, "0")}`;
  };

  // Função que será chamada quando o usuário confirmar que estacionou
  const confirmarEstacionamento = () => {
    Alert.alert(
      "Estacionar",
      "Você chegou ao destino e a vaga foi confirmada!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Menu"), // Navega para a tela de Menu
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Menu")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Nome do Local */}
      <Text style={styles.headerText}>Nome do Local:</Text>

      {/* Ícone de carro */}
      <Ionicons name="car-outline" size={100} color="#73D2C0" />

      {/* Informações */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Chegar ao Destino:</Text>
        {/* Mostra o tempo formatado */}
        <Text style={styles.timerText}>{formatarTempo(tempo)}</Text>
        <Text style={styles.priceText}>R$ 15.00</Text>

        {/* Botão para estacionar */}
        <TouchableOpacity
          style={styles.button}
          onPress={confirmarEstacionamento} // Chama a função de confirmação
        >
          <Text style={styles.buttonText}>Estacionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#73D2C0",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 80,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#73D2C0",
  },
  priceText: {
    fontSize: 18,
    color: "#73D2C0",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#73D2C0",
    padding: 15,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
