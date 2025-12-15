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
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const rota = "http://192.168.46.146:3000";

export default function SelecionarVaga() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_lugar, nome } = route.params || {};

  const [vagas, setVagas] = useState([]);
  const [local, setLocal] = useState(null); // Para armazenar a informação do local
  const [isLoading, setIsLoading] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null); // Para armazenar a vaga selecionada

  useEffect(() => {
    const verificarReserva = async () => {
      const id_usuario = await AsyncStorage.getItem("userId");
      if (id_usuario) {
        try {
          const response = await fetch(
            `${rota}/api/verificar-reserva?id_usuario=${id_usuario}`
          );
          if (response.ok) {
            const reserva = await response.json();
            if (reserva?.Id_Estacionamento) {
              // console.log("Tem uma vaga reservada: "+reserva.Descricao)
              setVagaSelecionada({
                idEstacionamento: reserva.Id_Estacionamento,
                descricao: reserva.Descrição,
              });
            }
          }
        } catch {
          Alert.alert("Erro", "Falha ao verificar reserva.");
        }
      }
    };

    verificarReserva();
  }, []);

  // Função para buscar as vagas e a URL da imagem
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const responseVagas = await fetch(
            `${rota}/api/vagas?id_lugar=${id_lugar}`
          );
          const dataVagas = await responseVagas.json();

          const responseLocal = await fetch(
            `${rota}/api/local?id_lugar=${id_lugar}`
          );
          const dataLocal = await responseLocal.json();

          if (responseVagas.ok && dataVagas.length) {
            setVagas(dataVagas);
          } else {
            setVagas([]); // Evita erros de FlatList
          }

          if (responseLocal.ok) {
            setLocal(dataLocal);
          }
        } catch (error) {
          Alert.alert("Erro", "Falha ao buscar os dados.");
        }
      };

      fetchData();

      return () => {
        console.log("Saiu do useFocusEffect");
      };
    }, [id_lugar])
  );

  // Função para selecionar uma vaga
  const selecionarVaga = async (idEstacionamento, descricao) => {
    try {
      if (idEstacionamento === vagaSelecionada?.idEstacionamento) {
        setVagaSelecionada(null); // Desmarca a vaga se clicada novamente
        return;
      }

      const id_usuario = await AsyncStorage.getItem("userId");
      //console.log(id_usuario)

      const dados = {
        idEstacionamento,
        descricao,
        id_usuario,
      };

      const response = await fetch(`${rota}/api/selecionar-vaga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        const vaga = await response.json();
        setVagaSelecionada({ idEstacionamento, descricao }); // Atualiza o estado com a vaga selecionada
        navigation.navigate("Destino", {
          vagaId: idEstacionamento,
          nomeLocal: local?.nome || "Nome do Local",
        });

        console.log("Vaga selecionada com sucesso:", vaga);
      } else {
        const errorData = await response.json();
        console.error("Erro no backend:", errorData.message);
        Alert.alert(
          "Erro",
          errorData.message || "Não foi possível selecionar a vaga."
        );
      }
    } catch (error) {
      console.error("Erro ao tentar selecionar a vaga:", error);
      Alert.alert("Erro", "Houve um problema ao tentar selecionar a vaga.");
    }
  };

  const confirmarSelecao = () => {
    if (!vagaSelecionada) {
      Alert.alert("Erro", "Selecione uma vaga.");
      return;
    }
    Alert.alert("Confirmado", `Vaga ${vagaSelecionada.descricao} salva.`);
  };

  const liberarVaga = async () => {
    try {
      const id_usuario = await AsyncStorage.getItem("userId");
      if (id_usuario) {
        const response = await fetch(`${rota}/api/liberar-vaga`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_usuario }),
        });

        if (response.ok) {
          setVagaSelecionada(null); // Limpa a vaga selecionada
          Alert.alert("Sucesso", "Vaga liberada com sucesso.");
          navigation.navigate("Menu"); // Redireciona para a tela Menu
        } else {
          Alert.alert("Erro", "Não foi possível liberar a vaga.");
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar liberar a vaga.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nome}</Text>
      </View>

      <ImageBackground
        source={local?.url ? { uri: local.url } : null}
        style={styles.imageBackground}
        resizeMode="cover"
      />

      <View style={styles.card}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <>
            <FlatList
              data={vagas}
              numColumns={3}
              keyExtractor={(item) =>
                `${item.Id_Estacionamento}-${item.Descricao}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (vagaSelecionada) return; // Se já houver uma vaga reservada, não faz nada
                    if (
                      vagaSelecionada?.idEstacionamento ===
                      item.Id_Estacionamento
                    ) {
                      navigation.navigate("ChegarAoDestino", {
                        vagaId: item.Id_Estacionamento,
                        descricao: item.Descricao,
                      });
                    } else {
                      selecionarVaga(item.Id_Estacionamento, item.Descricao);
                    }
                  }}
                  disabled={!!vagaSelecionada} // Desabilita todos os botões se já houver uma vaga reservada
                  style={[
                    styles.vagaItem,
                    item.Status ? styles.vagaOcupada : styles.vagaLivre, // Aqui não precisa mais comparar o idEstacionamento, só desabilita
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
            {vagaSelecionada ? (
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "red" }]}
                onPress={liberarVaga}
              >
                <Text style={styles.confirmButtonText}>Liberar Vaga</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmarSelecao}
              >
                <Text style={styles.confirmButtonText}>Confirmar Seleção</Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: "#73D2C0", // Verde
  },
  vagaSelecionada: {
    backgroundColor: "#A9A9A9", // Cinza
  },
  vagaOcupada: {
    backgroundColor: "#000", // Preto
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
