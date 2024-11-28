const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const { errorMonitor } = require("events");
const multer = require('multer');
const fs = require("fs");
const path = require("path");

const app = express();

require("dotenv").config();

const porta = 3000;
app.use(cors());
app.use(bodyparser.json());
app.use(express.json({ limit: '1000mb' }));

const pool = mysql.createPool({
  host: `localhost`,
  user: `root`,
  password: ``,
  database: `parknow`,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
});

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Gera um nome único
  },
});

// Configuração para servir arquivos estáticos da pasta "uploads"
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir)); // Agora as imagens serão servidas em /uploads


const upload = multer({ storage });


// Rota para upload de imagem
app.post('/uploads/criar/', upload.single('file'), async (req, res) => {
  const userId = req.body.userId; // Assuma que o ID do usuário é enviado no body
  const uploadedFile = req.file;

  console.log('Caiu aqui vei')

  if (!uploadedFile) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado!' });
  }

  const newFilePath = `/uploads/${uploadedFile.filename}`;

  try {
    // Obtém conexão do pool
    const connection = await pool.getConnection();

    try {
      // Verifica se já existe uma foto para o usuário
      const [rows] = await connection.query('SELECT foto FROM cadastro WHERE id = ?', [userId]);

      if (rows.length > 0) {
        // Substitui a imagem existente
        const oldFilePath = rows[0].foto ? path.join(__dirname, rows[0].foto) : null;

        await connection.query('UPDATE cadastro SET foto = ? WHERE id = ?', [newFilePath, userId]);

        // Remove o arquivo antigo, se existir
        if (oldFilePath && fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }

        res.status(200).json({ message: 'Foto atualizada com sucesso!', path: newFilePath });
      } else {
        // Insere o novo registro
        await connection.query('INSERT INTO cadastro (id, foto) VALUES (?, ?)', [userId, newFilePath]);

        res.status(201).json({ message: 'Foto salva com sucesso!', path: newFilePath });
      }
    } finally {
      connection.release(); // Libera a conexão de volta para o pool
    }
  } catch (error) {
    console.error('Erro ao acessar o banco de dados:', error);
    res.status(500).json({ error: 'Erro ao processar a solicitação!' });
  }
});

app.post('/upload', async (req, res) => {
  const { id, foto } = req.body;

  if (!foto) {
    return res.status(400).send('O campo "foto" precisa ser uma string Base64.');
  }

  try {
    const conexao = await pool.getConnection();
    const query = 'UPDATE cadastro SET foto = ? WHERE id = ?';

    await conexao.execute(query, [foto, id]);

    res.status(200).send('Foto salva com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar no banco:', err);
    res.status(500).send('Erro ao salvar no banco.');
  } finally {
    conexao.release();
  }
});

// Rota pra consulta
app.get("api/parknow/consulta", async (req, res) => {
  try {
    const conexao = await pool.getConnection();
    const sql = `SELECT c.nome, c.id, c.ibge, i.nome AS nome_cidade, c.cep, i.uf
        FROM clientes c, ibge i
        WHERE i.codigo = c.ibge`;
    const [linha] = await conexao.execute(sql);
    conexao.release();
    res.json(linha);
  } catch (error) {
    console.log(`O erro que ocorreu foi: ${error}`);
    res.status(500).json({ error: "Deu algum erro na busca" });
  }
});

// Rota para gerar e retornar o hash SHA-256 de uma string
app.get("/hash", (req, res) => {
  const { string } = req.query;

  if (!string) {
    return res
      .status(400)
      .json({ msg: "Informe uma string para gerar o hash" });
  }

  const hash = crypto.createHash("SHA256").update(string).digest("hex");
  res.json({ msg: hash });
});

// Função de validação de senha
const validatePassword = (password) => {
  // Verifica se a senha tem no mínimo 8 caracteres e contém pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

// Função de validação de campos
const validateFields = (data) => {
  const { nome, sobrenome, cpf, endereco, cep, telefone, email } = data;

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  const cpfRegex = /^\d{11}$/;
  const cepRegex = /^\d{8}$/;
  const phoneRegex = /^\d{10,11}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(nome) || !nameRegex.test(sobrenome)) {
    return "Nome ou Sobrenome inválido. Não deve conter números ou caracteres especiais.";
  }
  if (!cpfRegex.test(cpf)) {
    return "CPF inválido. Deve conter apenas 11 dígitos numéricos.";
  }
  if (!cepRegex.test(cep)) {
    return "CEP inválido. Deve conter 8 dígitos numéricos.";
  }
  if (!phoneRegex.test(telefone)) {
    return "Telefone inválido. Deve conter 10 ou 11 dígitos numéricos.";
  }
  if (!emailRegex.test(email)) {
    return "Email inválido. Deve ser um email válido com domínio.";
  }

  return null;
};

const validateFields1 = (data) => {
  const { tipo_veiculo, placa, marca, modelo, cor } = data;

  const placaRegex = /^[A-Z]{3}-\d{4}$/; // Padrão de placas: 3 letras e 4 números
  const modeloMarcaCorRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/; // Apenas letras, números e espaços permitidos

  if (!tipo_veiculo || (tipo_veiculo !== 1 && tipo_veiculo !== 2)) {
    return "Tipo de veículo inválido. Deve ser carro ou moto.";
  }
  if (!placaRegex.test(placa)) {
    return "Placa inválida. Deve estar no formato ABC-1234.";
  }
  if (!modeloMarcaCorRegex.test(marca)) {
    return "Marca inválida. Não deve conter caracteres especiais.";
  }
  if (!modeloMarcaCorRegex.test(modelo)) {
    return "Modelo inválido. Não deve conter caracteres especiais.";
  }
  if (!modeloMarcaCorRegex.test(cor)) {
    return "Cor inválida. Não deve conter caracteres especiais.";
  }

  return null; // Retorna null se não houver erros
};

// Rota para cadastrar o veiculo do cliente
app.post("/cadastro_veiculo", async (req, res) => {
  try {
    const { tipo_veiculo, placa, marca, modelo, cor } = req.body;

    // Verificação de campos vazios
    if (!tipo_veiculo || !placa || !marca || !modelo || !cor) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // Validação dos dados
    const validationError1 = validateFields1({
      tipo_veiculo,
      placa,
      marca,
      modelo,
      cor,
    });
    if (validationError1) {
      return res.status(400).json({ error: validationError1 });
    }

    // Obtém uma conexão do pool
    const conect = await pool.getConnection();

    // Prepara e executa a consulta SQL com parâmetros

    // const sql = `INSERT INTO automovel (tipo_veiculo, placa, marca, modelo, cor) VALUES (?, ?, ?, ?, ?)`;
    const sql = `INSERT INTO automovel (tipo_veiculo, placa, marca, modelo, cor) VALUES (?, ?, ?, ?, ?)`;
    console.log(sql);
    const [result] = await conect.execute(sql, [
      tipo_veiculo,
      placa,
      marca,
      modelo,
      cor,
    ]);

    // Libera a conexão
    conect.release();

    // Retorna uma resposta de sucesso
    res.json({ msg: "Registro gravado com sucesso!" });
  } catch (error) {
    console.error(`Ocorreu um erro: ${error}`);
    res.status(500).json({
      error:
        "Erro ao realizar o cadastro. Por favor, tente novamente mais tarde.",
    });
  }
});

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, sobrenome, cpf, endereco, cep, telefone, email, senha } =
      req.body;

    // Verificação de campos vazios
    if (
      !nome ||
      !sobrenome ||
      !cpf ||
      !endereco ||
      !cep ||
      !telefone ||
      !email ||
      !senha
    ) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // Validação dos dados
    const validationError = validateFields({
      nome,
      sobrenome,
      cpf,
      endereco,
      cep,
      telefone,
      email,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Validação da senha
    if (!validatePassword(senha)) {
      return res.status(400).json({
        error:
          "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
      });
    }

    // Criptografa a senha
    const hash = crypto.createHash("SHA256").update(senha).digest("hex");

    // Obtém uma conexão do pool
    const conect = await pool.getConnection();

    // Prepara e executa a consulta SQL com parâmetros
    const sql = `INSERT INTO cadastro (nome, sobrenome, cpf, endereco, cep, telefone, email, senha) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await conect.execute(sql, [
      nome,
      sobrenome,
      cpf,
      endereco,
      cep,
      telefone,
      email,
      hash,
    ]);

    // Libera a conexão
    conect.release();

    // Retorna uma resposta de sucesso
    res.json({ msg: "Registro gravado com sucesso!" });
  } catch (error) {
    console.error(`Ocorreu um erro: ${error}`);
    res.status(500).json({
      error:
        "Erro ao realizar o cadastro. Por favor, tente novamente mais tarde.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log("Recebido:", email, senha);

    // Validação dos dados recebidos
    if (!email || !senha) {
      return res.status(400).json({ msg: "Email e Senha são obrigatórios" });
    }

    const hash = crypto.createHash("SHA256").update(senha).digest("hex");

    // Definição da consulta SQL para buscar o ID, email e nome do usuário
    const sql = `SELECT id, email, nome FROM cadastro WHERE email = "${email}" AND senha = "${hash}"`;

    console.log(sql);

    // Tentativa de conexão com o banco de dados
    let connection;
    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error("Erro ao conectar ao banco de dados:", dbError);
      return res
        .status(500)
        .json({ error: "Erro ao conectar ao banco de dados" });
    }

    try {
      const [rows] = await connection.execute(sql, [email, hash]);
      connection.release();

      if (rows.length === 1) {
        // Se o login for bem-sucedido, retorna o ID, email e nome do usuário
        res.status(200).json({
          msg: "Login realizado com sucesso",
          id: rows[0].id, // Retorna o ID do usuário
          email: rows[0].email, // Retorna o email do usuário
          nome: rows[0].nome, // Retorna o nome do usuário
        });
      } else {
        res.status(401).json({ msg: "Email ou Senha incorreta" });
      }
    } catch (queryError) {
      console.error("Erro ao executar a query:", queryError);
      res.status(500).json({ error: "Erro interno ao processar login" });
    } finally {
      if (connection) connection.release(); // Garante que a conexão será liberada
    }
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    res.status(500).json({ error: "Erro interno ao processar login" });
  }
});

// Rota para atualizar perfil
app.put("/atualizar/:id", async (req, res) => {
  const id = req.params.id; // Obtém o ID da URL
  const { nome, sobrenome, telefone, email, senha, cpf, endereco, cep } =
    req.body;

  if (
    !id ||
    !nome ||
    !sobrenome ||
    !telefone ||
    !email ||
    !senha ||
    !cpf ||
    !endereco ||
    !cep
  ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    // Criptografar a senha usando SHA-256
    const hash = crypto.createHash("SHA256").update(senha).digest("hex");

    // Atualizar o perfil no banco de dados
    const [result] = await pool.execute(
      `UPDATE cadastro SET nome = ?, sobrenome = ?, telefone = ?, email = ?, senha = ?, cpf = ?, endereco = ?, cep = ? WHERE id = ?`,
      [nome, sobrenome, telefone, email, hash, cpf, endereco, cep, id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, msg: "Perfil atualizado com sucesso!" });
    } else {
      res.status(400).json({ error: "Erro ao atualizar o perfil" });
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para buscar usuário por ID
app.get("/buscar/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.execute(
      `SELECT nome, sobrenome, telefone, email, cpf, endereco, cep FROM cadastro WHERE id = ?`,
      [id]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para obter a quantidade de vagas de um local específico pelo nome
app.get("/local/:nome/vagas", (req, res) => {
  const localNome = req.params.nome;

  const query = "SELECT vagas FROM local WHERE nome = ?";

  pool.query(query, [localNome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar vagas:", err);
      res.status(500).json({ error: "Erro ao buscar vagas." });
      return;
    }

    if (results.length > 0) {
      res.json({ vagas: results[0].vagas });
    } else {
      res.status(404).json({ error: "Local não encontrado." });
    }
  });
});

// Função para gerar código de verificação
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Gera um código de 6 dígitos
}

// Configuração de envio de e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "parknowempresa@gmail.com",
    pass: "bvvt uwxl qbhj gcpt", // Certifique-se de usar a senha correta
  },
  secure: true, // Use SSL
  port: 465, // Porta para SSL
  timeout: 10000, // Aumente o timeout para 10 segundos
});

app.post("/send-email", (req, res) => {
  // Logs para depuração
  console.log("Dados recebidos:", req.body);

  const { subject, text, clienteEmail } = req.body;

  if (!subject || !text || !clienteEmail) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  // Aqui deve-se ter um identificador único do cliente (como clienteId ou o ID de login da sessão)
  const clienteId = 1; // Este é um exemplo fixo. Pode vir de uma sessão ou de outro sistema.

  // Consulta SQL para buscar o nome do cliente no banco de dados usando o ID do cliente
  const query = "SELECT nome FROM cadastro WHERE id = ?";

  console.log("Consultando banco de dados com clienteId:", clienteId);

  db.query(query, [clienteId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar dados do cliente:", err);
      return res.status(500).send("Erro ao buscar dados do cliente.");
    }

    // Se o cliente não for encontrado
    if (results.length === 0) {
      return res.status(404).send("Cliente não encontrado.");
    }

    const senderName = results[0].nome;

    // Configuração do e-mail
    const mailOptions = {
      from: clienteEmail, // Remetente fornecido pelo cliente
      to: empresaEmail, // Destinatário fixo (empresa)
      replyTo: clienteEmail, // Endereço do cliente para resposta
      subject,
      text: `Mensagem de ${senderName} (${clienteEmail}):\n\n${text}`, // Incluindo o nome e e-mail do cliente no corpo do e-mail
    };

    console.log("Configuração do e-mail:", mailOptions);

    // Envio do e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar o e-mail:", error);
        return res.status(500).send("Erro ao enviar o e-mail.");
      }
      console.log("E-mail enviado:", info.response);
      res.status(200).send("E-mail enviado com sucesso!");
    });
  });
});

// Rota para solicitar redefinição de senha
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const verificationCode = generateVerificationCode();
  const expirationTime = new Date(Date.now() + 3600000); // expira em 1 hora

  try {
    const connection = await pool.getConnection();
    const query =
      "UPDATE cadastro SET verification_code = ?, verification_expires = ? WHERE email = ?";
    const [result] = await connection.execute(query, [
      verificationCode,
      expirationTime,
      email,
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const mailOptions = {
      from: "parknowempresa@gmail.com",
      to: email,
      subject: "Redefinição de Senha - Park Now",
      text: `Redefinição de Senha - Park Now\n\nVocê solicitou a redefinição de senha para sua conta no Park Now.\n\nCódigo de verificação: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar e-mail:", error);
        return res
          .status(500)
          .json({ error: "Erro ao enviar e-mail", message: error.message });
      }
      console.log("E-mail enviado:", info.response);
      res.json({ message: "Código de verificação enviado para o seu e-mail" });
    });
  } catch (err) {
    console.error("Erro ao enviar código de verificação:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para verificar o código e redefinir senha
app.post("/verify-code", async (req, res) => {
  console.log(req.body);
  const { code, email } = req.body;

  // Verifica se email e código estão presentes
  if (!email || !code) {
    return res
      .status(400)
      .json({ error: "Email e código de verificação são obrigatórios" });
  }

  try {
    const connection = await pool.getConnection();
    try {
      const query =
        "SELECT * FROM cadastro WHERE email = ? AND verification_code = ? AND verification_expires > ?";
      const [results] = await connection.execute(query, [
        email,
        code,
        new Date(),
      ]);

      if (results.length === 0) {
        return res
          .status(400)
          .json({ error: "Código de verificação inválido ou expirado" });
      }

      res.json({ success: true, message: "Código verificado com sucesso" });
    } finally {
      connection.release(); // Libera a conexão, independentemente do sucesso ou erro
    }
  } catch (error) {
    console.error("Erro ao verificar código de verificação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ error: "Campos de e-mail e senha são obrigatórios." });
  }

  try {
    const connection = await pool.getConnection();

    // Verifica se o e-mail existe no banco de dados
    const [user] = await connection.execute(
      "SELECT * FROM cadastro WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Criptografa a senha usando SHA-256
    const hash = crypto.createHash("SHA256").update(senha).digest("hex");

    // Atualiza a senha criptografada no banco de dados
    const query = "UPDATE cadastro SET senha = ? WHERE email = ?";
    await connection.execute(query, [hash, email]);

    connection.release();

    res.json({ success: true, message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Express route to get parking spots
app.get("/vagas", async (req, res) => {
  const query =
    "SELECT v.Id_Estacionamento, l.latitude, l.longitude FROM vagas v JOIN local l ON v.Id_Estacionamento = l.id_lugar";

  try {
    const vagas = await db.query(query);
    res.status(200).json(vagas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar vagas" });
  }
});

app.get("/api/vagas", async (req, res) => {
  const { id_lugar } = req.query;

  // Validação extra para garantir que id_lugar é um número válido
  if (!id_lugar || isNaN(id_lugar)) {
    return res.status(400).json({
      message: "ID do local é obrigatório e deve ser um número válido.",
    });
  }

  try {
    // Query usando placeholders para evitar SQL Injection
    const query = `
        SELECT 
          Descricao, 
          Status, 
          Id_Estacionamento
        FROM vagas 
        WHERE Id_Estacionamento = ?;
      `;

    // Executar a consulta usando o valor do parâmetro `id_lugar` de forma segura
    const [rows] = await pool.query(query, [id_lugar]);

    // Retornar os resultados como JSON
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    res.status(500).json({ message: "Erro ao buscar vagas." });
  }
});

// Rota para buscar locais
app.get("/api/locais", async (req, res) => {
  console.log("Requisição recebida para /api/locais");
  try {
    // Usando promises
    const [results] = await pool.query("SELECT * FROM local");
    res.status(200).json(results); // Retorna os resultados diretamente
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).json({ error: "Erro ao buscar locais." });
  }
});

app.get("/api/local", async (req, res) => {
  try {
    const { id_lugar } = req.query;
    const conexao = await pool.getConnection();
    const [rows] = await conexao.execute(
      "SELECT * FROM local WHERE id_lugar = ?",
      [id_lugar]
    );
    conexao.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "Local não encontrado" });
    }

    const local = rows[0]; // Assumindo que o id_lugar é único
    res.json(local);
  } catch (error) {
    console.error("Erro ao buscar local:", error);
    res.status(500).json({ error: "Erro ao buscar o local." });
  }
});

app.post("/api/selecionar-vaga", async (req, res) => {
  const { idEstacionamento, descricao, id_usuario } = req.body;
  console.log(req.body);

  if (!idEstacionamento || !descricao) {
    return res.status(400).json({ message: "Dados incompletos." });
  }
  const connection = await pool.getConnection();

  // Query para buscar a vaga no banco de dados
  const query = `UPDATE vagas SET STATUS = "1", id_usuario = ${id_usuario} WHERE Id_Estacionamento = ${idEstacionamento} 
  AND Descricao = "${descricao}"`;

  console.log(query);

  const [linhas] = await connection.execute(query);
  connection.release();
  res.status(200).json({ msg: "Registro gravado!" });
});

// ROTA PRA CADASTRAR O LOCAL
app.post("/cadastro/local", async (req, res) => {
  try {
    const { id_lugar, nome, cidade, endereco, cep, vagas, func_horarios } =
      req.body;
    const conexao = await pool.getConnection();
    let sql = `INSERT INTO local (id_lugar, nome, cidade, endereco, cep, vagas, func_horarios) VALUE 
        ('${id_lugar}', '${nome}', '${cidade}', '${endereco}', '${cep}', '${vagas}', '${func_horarios}')`;
    console.log(sql);
    const [linhas] = await conexao.execute(sql);
    conexao.release();
    res.json({ msg: "Registro gravado!" });
  } catch (error) {
    console.log(`O Erro que ocorreu foi :${error}`);
    res.status(500).json({ error: "Deu algum erro no cadastro" });
  }
});

app.put("/api/liberar-vaga", async (req, res) => {
  const { id } = req.query;

  try {
    await pool.query(
      "UPDATE vagas SET Status = false WHERE Id_Estacionamento = ?",
      [id]
    );
    res.status(200).send({ message: "Vaga liberada com sucesso." });
  } catch (error) {
    console.error("Erro ao liberar vaga:", error);
    res.status(500).send({ error: "Erro ao liberar a vaga." });
  }
});

app.put("/api/alugar-vaga", async (req, res) => {
  const { id } = req.query;

  try {
    // Atualiza a vaga para 'alugada' no banco de dados
    await pool.query("UPDATE vagas SET status = ? WHERE id = ?", ["1", id]);
    res.status(200).send({ message: "Vaga alugada com sucesso." });
  } catch (error) {
    console.error("Erro ao alugar a vaga:", error);
    res.status(500).send({ error: "Erro ao alugar a vaga." });
  }
});

// Rota para verificar vaga reservada
app.get("/api/verificar-reserva", async (req, res) => {
  const { id_usuario } = req.query;
  // console.log("Rota de verificar-reserva")
  if (!id_usuario) {
    return res.status(400).json({ message: "ID do usuário não informado." });
  }

  try {
    const connection = await pool.getConnection();
    const query = `SELECT Id_Estacionamento, Descricao, Status, id_usuario 
                   FROM vagas WHERE id_usuario = ? AND Status = "1"`;
    const [results] = await connection.execute(query, [id_usuario]);
    connection.release();

    if (results.length === 0) {
      return res.status(404).json({ message: "Nenhuma vaga reservada." });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Erro ao buscar reserva:", error);
    res.status(500).json({ message: "Erro ao verificar reserva." });
  }
});

// Rota para selecionar vaga
app.post("/api/selecionar-vaga", async (req, res) => {
  const { idEstacionamento, descricao, id_usuario } = req.body;

  if (!idEstacionamento || !descricao || !id_usuario) {
    return res.status(400).json({ message: "Dados incompletos." });
  }

  try {
    const connection = await pool.getConnection();
    const query = `UPDATE vagas SET STATUS = "1", id_usuario = ? 
                   WHERE Id_Estacionamento = ? AND Descricao = ?`;
    const [result] = await connection.execute(query, [
      id_usuario,
      idEstacionamento,
      descricao,
    ]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }

    res.status(200).json({ message: "Vaga selecionada com sucesso!" });
  } catch (error) {
    console.error("Erro ao selecionar vaga:", error);
    res.status(500).json({ message: "Erro ao selecionar vaga." });
  }
});

// Rota para liberar vaga
app.post("/api/liberar-vaga", async (req, res) => {
  const { id_usuario } = req.body;
  console.log(req.body)
  if (!id_usuario) {
    return res.status(400).json({ message: "Dados incompletos." });
  }

  try {
    const connection = await pool.getConnection();
    const query = `UPDATE vagas SET STATUS = NULL, id_usuario = NULL 
                   WHERE id_usuario = ?`;
    const [result] = await connection.execute(query, [
      id_usuario,
    ]);
    connection.release();

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          message:
            "Vaga não encontrada ou não está reservada para este usuário.",
        });
    }

    res.status(200).json({ message: "Vaga liberada com sucesso!" });
  } catch (error) {
    console.error("Erro ao liberar vaga:", error);
    res.status(500).json({ message: "Erro ao liberar vaga." });
  }
});


app.listen(process.env.SERVE, () =>
  console.log(`ver rodando em porta ${process.env.SERVE}`)
);
