-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para parknow
CREATE DATABASE IF NOT EXISTS `parknow` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `parknow`;

-- Copiando estrutura para tabela parknow.automovel
CREATE TABLE IF NOT EXISTS `automovel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_veiculo` int(11) NOT NULL,
  `placa` varchar(100) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `cor` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_automovel_tipo_automovel` (`tipo_veiculo`),
  CONSTRAINT `FK_automovel_tipo_automovel` FOREIGN KEY (`tipo_veiculo`) REFERENCES `tipo_automovel` (`id_veiculo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Copiando dados para a tabela parknow.automovel: ~1 rows (aproximadamente)
INSERT INTO `automovel` (`id`, `tipo_veiculo`, `placa`, `marca`, `modelo`, `cor`) VALUES
	(1, 1, 'BRA2E19', 'Marca Exemplo', 'Modelo Exemplo', 'Cor Exemplo');

-- Copiando estrutura para tabela parknow.cadastro
CREATE TABLE IF NOT EXISTS `cadastro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `sobrenome` varchar(100) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `cep` varchar(8) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `email` varchar(250) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `verification_code` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Copiando dados para a tabela parknow.cadastro: ~4 rows (aproximadamente)
INSERT INTO `cadastro` (`id`, `nome`, `sobrenome`, `cpf`, `endereco`, `cep`, `telefone`, `email`, `senha`, `verification_code`, `verification_expires`) VALUES
	(1, 'breno', 'freguglia', '46270934893', 'Rua Teste Bom', '19160000', '18998165080', 'freguglia.breno@gmail.com', 'a5eaa5e6cb269a776bf1a7f0c617b1ab3e5bc19a06a86df18ffd732803471970', '941619', '2024-10-03 14:30:39'),
	(2, 'Samuel', 'Caliel', '46270934893', 'rua teste miçl', '19067755', '18998165080', 'samuelcaliel69@gmail.com', 'a5eaa5e6cb269a776bf1a7f0c617b1ab3e5bc19a06a86df18ffd732803471970', '386669', '2024-09-19 14:44:26'),
	(3, 'Jorge', 'Gabriel', '46270934893', 'rua teste jorge', '19065755', '18998165080', 'jorgegabrielcdsantos@gmail.com', '36c6ee3db1019c0a9270ac2e0688809d28f48754e3007885e7ec096f2bbab194', '779836', '2024-09-19 14:47:51'),
	(4, 'Park', 'Now', '46270934893', 'rua teste', '19063755', '18998165080', 'ParkNow@gmail.com', '4b1bbf296030151c43cb56140970a87f1832a3dd7b5d1e91014b43ab9ff07ecd', NULL, NULL);

-- Copiando estrutura para tabela parknow.local
CREATE TABLE IF NOT EXISTS `local` (
  `id_lugar` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `cep` varchar(8) DEFAULT NULL,
  `vagas` int(11) DEFAULT NULL,
  `func_horario` varchar(100) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_lugar`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Copiando dados para a tabela parknow.local: ~8 rows (aproximadamente)
INSERT INTO `local` (`id_lugar`, `nome`, `cidade`, `endereco`, `cep`, `vagas`, `func_horario`, `latitude`, `longitude`, `url`) VALUES
	(1, 'PrudenShopping', 'Pres. Prudente', 'Rua Teste Alfa', '19060-00', 300, '10h - 22h', -22.115200, -51.407620, 'https://static.wixstatic.com/media/933b9f_f087829258f04952ae2d8889b3635ad8~mv2.jpg/v1/fill/w_824,h_336,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/bg-ps.jpg'),
	(2, 'Local A', 'pp', 'Rparknowota do Sol', '19063-75', 300, '10h-22h', -23.550520, -46.633308, NULL),
	(3, 'Supermercado Proença', 'Presidente Prudente', 'Rua Joaquim Nabuco, 765', '19015-16', 120, '07:00 - 22:00', -22.121672, -51.388569, NULL),
	(4, 'Parque do Povo', 'Presidente Prudente', 'Avenida Onze de Maio, s/n', '19060-08', 200, 'Aberto 24 horas', -22.123438, -51.395492, NULL),
	(5, 'Shopping Prudente Park', 'Presidente Prudente', 'Avenida Manoel Goulart, 2400', '19010-00', 350, '10:00 - 22:00', -22.120403, -51.396568, NULL),
	(6, 'Supermercado Muffato Max', 'Presidente Prudente', 'Rua Ângelo Gosuen, 1000', '19010-09', 200, '08:00 - 22:00', -22.118123, -51.388732, NULL),
	(7, 'Centro Cultural Matarazzo', 'Presidente Prudente', 'Rua Quintino Bocaiúva, 749', '19010-08', 150, '09:00 - 18:00', -22.119548, -51.389481, NULL),
	(8, 'Terminal Rodoviário de Presidente Prudente', 'Presidente Prudente', 'Rua Doutor José Foz, 188', '19010-29', 250, 'Aberto 24 horas', -22.124207, -51.388045, NULL);

-- Copiando estrutura para tabela parknow.tipo_automovel
CREATE TABLE IF NOT EXISTS `tipo_automovel` (
  `id_veiculo` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) NOT NULL,
  PRIMARY KEY (`id_veiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Copiando dados para a tabela parknow.tipo_automovel: ~2 rows (aproximadamente)
INSERT INTO `tipo_automovel` (`id_veiculo`, `tipo`) VALUES
	(1, 'Carro'),
	(2, 'Moto');

-- Copiando estrutura para tabela parknow.vagas
CREATE TABLE IF NOT EXISTS `vagas` (
  `Id_Estacionamento` int(11) NOT NULL,
  `Descricao` varchar(100) NOT NULL DEFAULT '',
  `Status` char(1) DEFAULT NULL,
  KEY `FK__local` (`Id_Estacionamento`),
  CONSTRAINT `FK__local` FOREIGN KEY (`Id_Estacionamento`) REFERENCES `local` (`id_lugar`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Copiando dados para a tabela parknow.vagas: ~5 rows (aproximadamente)
INSERT INTO `vagas` (`Id_Estacionamento`, `Descricao`, `Status`) VALUES
	(2, 'A1', NULL),
	(2, 'A2', NULL),
	(2, 'A3', 'o'),
	(1, 'A1', NULL),
	(1, 'A2', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
