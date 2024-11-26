import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const rota = "http://10.111.9.84:3000";

export default function SelecionarVaga() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_lugar, nome } = route.params || {};

  const [vagas, setVagas] = useState([]);
  const [local, setLocal] = useState(null); // Para armazenar a informação do local
  const [isLoading, setIsLoading] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null); // Para armazenar a vaga selecionada

  // Função para buscar as vagas e a URL da imagem
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          console.log("Buscando dados do local:", id_lugar);
          // Buscando as vagas
          const responseVagas = await fetch(
            `${rota}/api/vagas?id_lugar=${id_lugar}`
          );
          const dataVagas = await responseVagas.json(); 

          // Buscando o local, incluindo a URL da imagem
          const responseLocal = await fetch(
            `${rota}/api/local?id_lugar=${id_lugar}`
          );
          const dataLocal = await responseLocal.json();

          if (responseVagas.ok && responseLocal.ok) {
            setVagas(dataVagas);
            setLocal(dataLocal); // Salvando o local (com a URL da imagem)
          } else {
            Alert.alert(
              "Erro",
              dataVagas.message || "Não foi possível carregar as vagas."
            );
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
          Alert.alert("Erro", "Houve um problema ao buscar os dados.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        console.log("Saiu do useFocusEffect");
      };
    }, [id_lugar])
  );

  // Função para selecionar uma vaga
  const selecionarVaga = (id) => {
    setVagaSelecionada(id === vagaSelecionada ? null : id); // Desmarca se clicar novamente
  };

  // Função para confirmar a seleção
  const confirmarSelecao = () => {
    if (!vagaSelecionada) {
      Alert.alert("Atenção", "Selecione uma vaga antes de confirmar.");
      return;
    }

    Alert.alert(
      "Confirmar Seleção",
      `Você selecionou a vaga ${vagaSelecionada}. Deseja confirmar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            setVagas((prevVagas) =>
              prevVagas.map((vaga) =>
                vaga.Id_Estacionamento === vagaSelecionada
                  ? { ...vaga, Status: true } // Marca como ocupada
                  : vaga
              )
            );
            setVagaSelecionada(null); // Limpa a seleção após confirmar
            Alert.alert("Sucesso", "A vaga foi confirmada e está ocupada.");

            // Redireciona para a tela "Chegada ao Destino"
            navigation.navigate("Destino", { vagaId: vagaSelecionada });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho fixo no topo */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nome}</Text>
      </View>

      {/* Imagem de fundo */}
      <ImageBackground
        source={local?.url ? { uri: local.url } : null}
        style={styles.imageBackground}
        resizeMode="cover"
      />

      {/* Card contendo a lista de vagas */}
      <View style={styles.card}>
        {/* Restante do código permanece igual */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <>
            <FlatList
              data={vagas}
              numColumns={3}
              keyExtractor={(item, index) =>
                `${item.Id_Estacionamento}-${item.Descricao}-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selecionarVaga(item.Id_Estacionamento)}
                  style={[
                    styles.vagaItem,
                    item.Status
                      ? styles.vagaOcupada
                      : vagaSelecionada === item.Id_Estacionamento
                      ? styles.vagaSelecionada
                      : styles.vagaLivre,
                  ]}
                >
                  {item.Status ? (
                    <Ionicons
                      name="car-sport-sharp"
                      size={24}
                      color="#73D2C0"
                    />
                  ) : (
                    <Text style={styles.vagaText}>{item.Descricao}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyMessage}>
                  Nenhuma vaga disponível.
                </Text>
              }
              contentContainerStyle={styles.listContent}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmarSelecao}
            >
              <Text style={styles.confirmButtonText}>Confirmar Seleção</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7F9",
  },
  header: {
    position: "absolute",
    top: 30,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
  },
  backButton: {
    marginRight: width * 0.03,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageBackground: {
    width: width,
    height: height * 0.4,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    height: height * 0.7,
    position: "absolute",
    top: height * 0.36,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 20,
  },
  vagaItem: {
    flex: 1,
    padding: height * 0.02,
    borderRadius: 10,
    margin: width * 0.01,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  vagaLivre: {
    backgroundColor: "#73D2C0",
  },
  vagaSelecionada: {
    backgroundColor: "#FFD700",
  },
  vagaOcupada: {
    backgroundColor: "#000",
  },
  vagaText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#73D2C0",
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
