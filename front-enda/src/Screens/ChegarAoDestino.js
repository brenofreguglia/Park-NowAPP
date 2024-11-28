import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Progress from 'react-native-progress';

const { width, height } = Dimensions.get("window");

const rota = "http://10.111.9.114:3000";

export default function ChegarAoDestino() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vagaId = "", nomeLocal = "Local Não Informado" } = route.params || {};

  const [tempo, setTempo] = useState(1200);

  useEffect(() => {
    if (vagaId) {
      setTempo(1200);
    }
  }, [vagaId]);

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
      setTempo((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [tempo, navigation, vagaId]);

  const liberarVaga = async () => {
    try {
      const response = await fetch(`${rota}/api/liberar-vaga?id=${vagaId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Erro ao liberar a vaga.");
    } catch (error) {
      console.error("Erro ao liberar a vaga:", error);
      Alert.alert("Erro", "Falha ao liberar a vaga.");
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

  const calcularProgresso = () => tempo / 1200;

  const confirmarEstacionamento = () => {
    Alert.alert(
      "Estacionar",
      "Você chegou ao destino e a vaga foi confirmada!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Menu"),
        },
      ]
    );
  };

  const calcularCorProgresso = () => {
    const progress = calcularProgresso();
    if (progress > 0.5) return "#fffdfd";
    if (progress > 0.2) return "#FFCC00";
    return "#FF6347";
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Menu")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Nome do Local no Topo */}
      <Text style={styles.localName}>{nomeLocal}</Text>

      <View style={styles.progressContainer}>
        <Progress.Circle
          progress={calcularProgresso()}
          size={200}
          color={calcularCorProgresso()}
          unfilledColor="#000000"
          borderWidth={0}
          thickness={10}
          style={styles.circularProgress}
        />
        <View style={styles.iconContainer}>
          <Image
            style={styles.img}
            source={require("../../assets/Imgs/carrinho.png")}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Chegar ao Destino:</Text>
          <Text style={styles.timerText}>{formatarTempo(tempo)}</Text>
          <Text style={styles.priceText}>R$ 15.00</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={confirmarEstacionamento}
          >
            <Text style={styles.buttonText}>Estacionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#73D2C0",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  localName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 90,
    textAlign: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 200,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  circularProgress: {
    marginVertical: 20,
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    height: 120,
    width: 120,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    backgroundColor: "#fff",
    width: width,
    height: height * 0.6,
    padding: 20,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  timerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#73D2C0",
    marginVertical: 10,
  },
  priceText: {
    fontSize: 18,
    color: "#73D2C0",
    marginVertical: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#73D2C0",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
