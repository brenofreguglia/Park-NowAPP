import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const rota = "http://10.111.9.114:3000";

export default function ChegarAoDestino() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vagaId = "" } = route.params || {};

  const [tempo, setTempo] = useState(3600);

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Menu")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Nome do Local:</Text>

      <Ionicons name="car-outline" size={100} color="#000" />

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
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 200,
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
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
