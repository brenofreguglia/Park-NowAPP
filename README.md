# Park-Now

**Park-Now** é um aplicativo desenvolvido em **Expo Go** e **React Native**, focado em facilitar a busca e reserva de vagas de estacionamento. O app oferece uma interface intuitiva e prática, permitindo que os usuários realizem todo o processo de busca e reserva diretamente pelo celular, de forma simples e segura.

  ```bash
   O Aplicativo esta em fase de Desenvolvimento ainda, não chegou na sua versão final!!!!!
   ```

## Funcionalidades

- **Autenticação de Usuários**: 
  - O aplicativo oferece telas de login e cadastro, onde o usuário pode fornecer informações como:
    - Nome
    - Sobrenome
    - CPF
    - Endereço
    - CEP
    - Telefone
    - E-mail
    - Senha
  - O cadastro garante a segurança dos dados e facilita o acesso ao sistema.

- **Busca de Estacionamentos**:
  - Após o login, o usuário é direcionado para a tela inicial, onde pode buscar por endereços de interesse.
  - O usuário também pode escolher o tipo de veículo, seja **carro** ou **moto**, otimizando a busca por vagas adequadas.

- **Registro de Veículos**:
  - O app permite o registro de veículos, armazenando informações importantes como:
    - Placa
    - Modelo
    - Marca
    - Cor
  - Isso facilita o processo de seleção de vagas e reserva, garantindo que todas as informações estejam organizadas.

- **Seleção de Vagas**:
  - O usuário pode visualizar e selecionar vagas disponíveis no estacionamento escolhido.
  - A interface gráfica oferece uma visão clara das vagas, tornando o processo ágil e intuitivo.

- **Canal de Comunicação ('Fale Conosco')**:
  - O app conta com uma funcionalidade para o usuário entrar em contato diretamente com a administração ou suporte, com uma interface que permite o envio de mensagens e acompanhamento das respostas.

- **Edição de Perfil**:
  - O usuário pode atualizar seus dados pessoais, como nome, e-mail, telefone, e também realizar alterações no cadastro de veículos.
  - O histórico de aluguéis recentes também fica disponível na tela de perfil, oferecendo uma visão clara dos últimos estacionamentos utilizados.

## Tecnologias Utilizadas

- **Frontend**: Desenvolvido com **React Native**, oferecendo uma experiência fluida e nativa para usuários tanto de Android.
- **Mobile Framework**: O aplicativo é desenvolvido e gerenciado utilizando **Expo Go**, facilitando o desenvolvimento, teste e deploy do app.
- **Backend**: O backend do aplicativo é feito em **Node.js**, com integração de APIs para autenticação e gerenciamento de dados do usuário.

## Como Executar o Projeto

### Pré-requisitos:

- Node.js e npm instalados
- Expo instalado

### Passos para rodar o app:

1. Clone este repositório:
   ```bash
   git clone https://github.com/brenofreguglia/Park-Now
   ```

2. Instale as dependências:
   ```bash
   cd park-now
   npm install
   ```

3. Inicie o aplicativo:
   ```bash
   npx expo start -c
   ```

4. Utilize o app no seu dispositivo mobile:
   - Escaneie o QR code gerado pelo **Expo Go** usando o aplicativo **Expo** no seu celular.

## Contribuição

Sinta-se à vontade para enviar pull requests, relatar problemas ou sugerir melhorias. O objetivo é tornar o Park-Now cada vez mais eficiente para os usuários. 

---

**Park-Now** – Facilitando sua busca por vagas de estacionamento, de maneira simples e prática!
