-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 26, 2021 at 05:31 PM
-- Server version: 8.0.23-0ubuntu0.20.04.1
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `panorama`
--
CREATE DATABASE IF NOT EXISTS `panorama` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
USE `panorama`;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItem`
--

CREATE TABLE `AnalysedItem` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isFile` tinyint(1) NOT NULL,
  `numLines` int NOT NULL,
  `type` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemAggregateFileType`
--

CREATE TABLE `AnalysedItemAggregateFileType` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `fileType` int NOT NULL,
  `numLines` int NOT NULL,
  `percentage` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemAggregateStats`
--

CREATE TABLE `AnalysedItemAggregateStats` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `token` int NOT NULL,
  `numLines` int NOT NULL,
  `percentage` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemChunk`
--

CREATE TABLE `AnalysedItemChunk` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `start` int NOT NULL,
  `end` int NOT NULL,
  `contributorId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemChunkToken`
--

CREATE TABLE `AnalysedItemChunkToken` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `start` int NOT NULL,
  `tokenType` int NOT NULL,
  `end` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemContributor`
--

CREATE TABLE `AnalysedItemContributor` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `contributorId` int NOT NULL,
  `numLines` int NOT NULL,
  `percentage` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysedItemContributorAggregateStats`
--

CREATE TABLE `AnalysedItemContributorAggregateStats` (
  `analysisId` int NOT NULL,
  `path` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `contributorId` int NOT NULL,
  `tokenType` int NOT NULL,
  `numLines` int NOT NULL,
  `percentage` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Analysis`
--

CREATE TABLE `Analysis` (
  `analysisId` int NOT NULL,
  `repositoryId` int NOT NULL,
  `requestedBy` int NOT NULL,
  `commitId` char(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('QUEUED','STARTED','COMPLETED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `jobId` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `queuedAt` datetime NOT NULL,
  `startedAt` datetime DEFAULT NULL,
  `completedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `AnalysisContributor`
--

CREATE TABLE `AnalysisContributor` (
  `analysisId` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `FileType`
--

CREATE TABLE `FileType` (
  `typeId` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `icon` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `language` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `colour` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `FileType`
--

INSERT INTO `FileType` (`typeId`, `name`, `icon`, `language`, `colour`) VALUES
(1, 'JavaScript', 'javascript', 'javascript', 'f1e05a'),
(2, 'TypeScript', 'typescript', 'typescript', '2b7489'),
(3, 'Python', 'python', 'python', '3572A5'),
(4, 'PHP', 'php_elephant', 'php', '4F5D95'),
(5, 'Scala', 'scala', 'scala', 'c22d40'),
(6, 'Java', 'java', 'java', 'b07219'),
(7, 'LaTeX', 'tex', 'tex', '3D6117'),
(8, 'JSON', 'json', 'json', '0064bd'),
(9, 'HTML', 'html', 'html', 'e34c26'),
(10, 'XML', 'xml', 'xml', '26e39b'),
(11, 'C', 'c', 'c', '555555'),
(13, 'C#', 'csharp', 'csharp', '178600'),
(17, 'Markdown', 'markdown', 'markdown', '083fa1'),
(18, 'ESLint', 'eslint', NULL, NULL),
(19, 'Git', 'git', NULL, NULL),
(20, 'Image', 'image', NULL, NULL),
(21, 'SVG', 'svg', 'xml', 'ff9900'),
(22, 'Handlebars', 'handlebars', 'hbs', 'f7931e'),
(23, 'Sass', 'sass', 'scss', 'a53b70'),
(24, 'CSS', 'css', 'css', '563d7c'),
(25, 'Vue', 'vue', 'html', '2c3e50'),
(26, 'Executable', 'console', NULL, NULL),
(27, 'AppleScript', 'applescript', 'applescript', '101F1F'),
(28, 'Document', 'document', NULL, NULL),
(29, 'Processing', 'processing_light', 'processing', '0096D8'),
(30, 'Config', 'settings', NULL, NULL),
(31, 'YAML', 'yaml', 'yaml', 'cb171e'),
(32, 'Rust', 'rust', 'rust', 'dea584'),
(33, 'Visual Studio', 'visualstudio', NULL, NULL),
(34, 'Font', 'font', NULL, NULL),
(35, 'Dart', 'dart', 'dart', '00B4AB'),
(36, 'Swift', 'swift', 'swift', 'ffac45'),
(37, 'C++', 'cpp', 'cpp', 'f34b7d'),
(38, 'Header', 'h', 'cpp', 'e63c5b'),
(39, 'Lock', 'lock', NULL, NULL),
(40, 'Less', 'less', 'less', '1d365d'),
(41, 'Docker', 'docker', 'dockerfile', '384d54'),
(42, 'Flow', 'flow', NULL, NULL),
(43, 'Prettier', 'prettier', NULL, NULL),
(44, 'License', 'readme', NULL, NULL),
(45, 'systemd', 'settings', NULL, NULL),
(46, 'Gradle', 'gradle', 'gradle', NULL),
(47, 'PDF', 'pdf', NULL, NULL),
(48, 'Make', 'makefile', 'makefile', NULL),
(49, 'Babel', 'babel', NULL, NULL),
(50, 'EJS', 'ejs', 'html', NULL),
(51, 'Photoshop', 'image', NULL, NULL),
(52, 'macOS', 'applescript', NULL, NULL),
(53, 'PowerShell', 'powershell', 'powershell', '012456'),
(54, 'Bash', 'console', 'bash', '89e051'),
(55, 'DOS', 'console', 'dos', '2c6ec9'),
(56, 'CMake', 'cmake', 'cmake', NULL),
(57, 'Input', 'settings', NULL, NULL),
(58, 'Brainfuck', 'brainfuck', 'brainfuck', '2F2530'),
(59, 'Audio', 'audio', NULL, NULL),
(60, 'Panorama', 'panorama', NULL, '3960A1'),
(61, 'NVM', 'nodejs', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `FileTypeExtension`
--

CREATE TABLE `FileTypeExtension` (
  `typeId` int NOT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `FileTypeExtension`
--

INSERT INTO `FileTypeExtension` (`typeId`, `extension`) VALUES
(1, 'js'),
(2, 'ts'),
(3, 'py'),
(4, 'php'),
(5, 'sc'),
(5, 'scala'),
(6, 'java'),
(7, 'tex'),
(8, 'json'),
(9, 'html'),
(10, 'xml'),
(11, 'c'),
(13, 'cs'),
(17, 'md'),
(18, 'eslintignore'),
(18, 'eslintrc'),
(19, 'gitattributes'),
(19, 'gitignore'),
(19, 'gitkeep'),
(19, 'keep'),
(20, 'icns'),
(20, 'ico'),
(20, 'jpeg'),
(20, 'jpg'),
(20, 'png'),
(21, 'svg'),
(22, 'hbs'),
(23, 'sass'),
(23, 'scss'),
(24, 'css'),
(25, 'vue'),
(26, 'exe'),
(27, 'applescript'),
(27, 'ipa'),
(27, 'scpt'),
(28, 'doc'),
(28, 'docx'),
(28, 'txt'),
(29, 'pde'),
(30, 'conf'),
(30, 'editorconfig'),
(30, 'iml'),
(30, 'plist'),
(30, 'properties'),
(31, 'yaml'),
(31, 'yml'),
(32, 'rs'),
(33, 'sln'),
(33, 'vcxproj'),
(34, 'otf'),
(34, 'ttf'),
(35, 'dart'),
(36, 'swift'),
(37, 'c++'),
(37, 'cpp'),
(37, 'cxx'),
(38, 'h'),
(38, 'h++'),
(38, 'hh'),
(38, 'hpp'),
(38, 'hxx'),
(39, 'lock'),
(40, 'less'),
(41, 'Dockerfile'),
(41, 'dockerignore'),
(42, 'flowconfig'),
(43, 'prettierrc'),
(44, 'COPYING'),
(44, 'LICENSE'),
(45, 'service'),
(46, 'gradle'),
(46, 'gradlew'),
(47, 'pdf'),
(48, 'Makefile'),
(49, 'babelrc'),
(50, 'ejs'),
(51, 'psd'),
(52, 'DS_Store'),
(53, 'ps1'),
(54, 'sh'),
(55, 'bat'),
(55, 'cmd'),
(56, 'cmake'),
(57, 'in'),
(58, 'bf'),
(59, 'mp3'),
(60, 'panoramaignore'),
(61, 'nvmrc');

-- --------------------------------------------------------

--
-- Table structure for table `Repository`
--

CREATE TABLE `Repository` (
  `repositoryId` int NOT NULL,
  `name` varchar(140) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ownerId` int NOT NULL,
  `lastAnalysed` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `TokenType`
--

CREATE TABLE `TokenType` (
  `tokenId` int NOT NULL,
  `name` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `colour` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `TokenType`
--

INSERT INTO `TokenType` (`tokenId`, `name`, `colour`) VALUES
(0, 'Documentation', '39a163'),
(1, 'Code', '3960A1'),
(2, 'Whitespace', '758296'),
(3, 'String', '6d39a1');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `userId` int NOT NULL,
  `login` varchar(39) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lastAccess` datetime DEFAULT NULL,
  `lastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `colour` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`userId`, `login`, `lastAccess`, `lastUpdated`, `colour`) VALUES
(-1, 'Anonymous', NULL, '2021-01-01 00:00:00', '3960A1'),
(12239411, 'djbotha', NULL, '2021-03-25 13:14:55', 'b56449'),
(13662803, 'frannyfx', '2021-03-26 02:07:16', '2021-03-26 02:07:19', 'b4486c'),
(13776629, 'digggy', NULL, '2021-03-25 13:14:55', 'dc9686'),
(14077275, 'aseemsavio', NULL, '2021-03-25 13:14:56', 'ec6884'),
(15101411, 'renefloor', NULL, '2021-03-25 15:53:02', 'd5735c'),
(15311479, 'abhinavjdwij', NULL, '2021-03-25 13:14:56', 'a57e59'),
(16071970, 'cb0s', NULL, '2021-03-25 13:14:56', 'bcdc84'),
(16307737, 'SebastianKurp', NULL, '2021-03-25 13:14:56', 'b5733f'),
(16995513, 'arjun-dureja', NULL, '2021-03-25 13:14:56', '4cdcdc'),
(17125543, 'miguelcarreiro', NULL, '2021-03-25 13:14:55', 'b55e5e'),
(17619496, 'vassbo', NULL, '2021-03-25 13:14:55', 'd18f61'),
(18350092, 'nihaals', NULL, '2021-03-25 13:14:56', 'fc3c04'),
(19145812, 'burhanahmeed', NULL, '2021-03-25 13:14:55', 'fb4b8b'),
(19255925, 'nachoapps', NULL, '2021-03-25 15:53:02', 'b82c15'),
(19378617, 'suyoin', NULL, '2021-03-25 13:14:56', '5c8cc4'),
(19891059, 'carlosqsilva', NULL, '2021-03-25 13:14:55', 'd5305b'),
(19948979, 'milansusnjar', NULL, '2021-03-25 13:14:56', 'd2524c'),
(19981656, 'ermalsh', NULL, '2021-03-25 13:14:55', 'c06458'),
(20455036, 'ArtemKutafin', NULL, '2021-03-25 13:14:56', '945444'),
(22831131, 'kerdokurs', NULL, '2021-03-25 13:14:56', '5e9bcd'),
(25769699, 'simonri', NULL, '2021-03-25 13:14:56', 'f4a60f'),
(26109843, 'Torksi', NULL, '2021-03-25 13:14:56', '7da7d9'),
(26411488, 'maskeynihal', NULL, '2021-03-25 13:14:56', '7f7f7f'),
(26903069, 'xuhangc', NULL, '2021-03-25 13:14:56', '1c938b'),
(27272699, 'xiaohanjc00', NULL, '2021-03-25 19:39:22', 'c4dc64'),
(28285686, 'auderer', NULL, '2021-03-25 13:14:55', 'd4a444'),
(28637562, 'mayconbenito', NULL, '2021-03-25 13:14:55', 'ce30a3'),
(30200463, '90zlaya', NULL, '2021-03-25 13:14:56', '6e9bd9'),
(30587167, 'hose1021', NULL, '2021-03-25 13:14:55', 'bc6d42'),
(31023616, 'Doges', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(31120765, 'ShahrozTanveer', NULL, '2021-03-25 13:14:56', '7f7f7f'),
(31313717, 'Paultje52', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(33229117, 'yummyweb', NULL, '2021-03-25 13:14:55', 'fcc42c'),
(33286755, 'mjkonko', NULL, '2021-03-25 13:14:55', 'be855c'),
(33333226, 'sahilmob', NULL, '2021-03-25 13:14:54', '8e5740'),
(34142707, 'ayaz-amin', NULL, '2021-03-25 13:14:56', '2d3bd1'),
(34398923, 'GuilhermeZaniniMoreira', NULL, '2021-03-25 13:14:55', 'c94631'),
(34566290, 'MaySoMusician', NULL, '2021-03-25 13:14:56', 'f41c24'),
(34971091, 'JakovGlavac', NULL, '2021-03-25 13:14:56', 'ba646c'),
(35194709, 'VytskaLT', NULL, '2021-03-25 13:14:55', '8ccc54'),
(35400192, 'amitojsingh366', NULL, '2021-03-25 13:14:55', 'a48dcd'),
(35634442, 'ronanru', NULL, '2021-03-25 13:14:55', 'fcf43c'),
(35891136, 'martines3000', NULL, '2021-03-25 13:14:56', 'b29427'),
(36563463, 'AndreasHGK', NULL, '2021-03-25 13:14:56', '7013fc'),
(36741716, 'VayerMaking', NULL, '2021-03-25 13:14:55', 'd11f28'),
(36950737, 'nttzamos', NULL, '2021-03-25 13:14:56', 'c45ca4'),
(37215838, 'lazarospsa', NULL, '2021-03-25 13:14:56', 'a24653'),
(37271169, 'ProgramistaZpolski', NULL, '2021-03-25 13:14:55', 'cbb533'),
(37310248, 'AmmarYasir29', NULL, '2021-03-25 13:14:56', 'd78f7c'),
(37585474, 'MasterBrian99', NULL, '2021-03-25 13:14:55', 'b3704b'),
(37880251, 'Jawkx', NULL, '2021-03-25 13:14:56', 'd20455'),
(38135462, 'samirergaibi', NULL, '2021-03-25 13:14:56', 'b24c4d'),
(38187043, 'Ddxcv98', NULL, '2021-03-25 13:14:55', '7cd484'),
(38359416, 'PGgamer2', NULL, '2021-03-25 13:14:55', 'dc1414'),
(38754158, 'niiiils', NULL, '2021-03-25 13:14:56', 'c48c24'),
(38838675, 'nadirabbas', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(38929917, 'raulpesilva', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(39283458, 'flyingonionman', NULL, '2021-03-25 13:14:55', 'c46c4c'),
(40357312, 'Neriuzz', NULL, '2021-03-26 01:30:32', '13eb6d'),
(40575710, 'AlexWang18', NULL, '2021-03-25 13:14:56', '285380'),
(40594075, 'SamiKamal', NULL, '2021-03-25 13:14:55', 'cbcb33'),
(40838795, 'AdamPandolino', NULL, '2021-03-25 13:14:56', '7f7f7f'),
(41597907, 'iddify', NULL, '2021-03-25 13:14:55', 'b3452c'),
(41989385, 'YazeedAlKhalaf', NULL, '2021-03-25 13:14:55', 'cc606c'),
(42484571, 'jamesql', NULL, '2021-03-25 13:14:55', '4eb0aa'),
(42689647, 'arhammusheer', NULL, '2021-03-25 13:14:55', '9dcb33'),
(42771071, 'olnor18', NULL, '2021-03-25 13:14:55', 'dc7cbc'),
(42801690, 'prebenn', NULL, '2021-03-25 13:14:55', 'bc7756'),
(43091121, 'larsverp', NULL, '2021-03-25 13:14:55', 'f35323'),
(43522330, 'D22NK', NULL, '2021-03-25 13:14:55', 'fc6c04'),
(44020024, 'Efk0', NULL, '2021-03-25 13:14:56', '7f7f7f'),
(44026893, 'NoahvdAa', NULL, '2021-03-25 13:14:55', 'fb4404'),
(44292723, 'kamgg', NULL, '2021-03-25 19:39:22', 'b21a43'),
(44361140, 'sandippakhanna', NULL, '2021-03-25 13:14:55', '3c7cc4'),
(44895646, 'JanTheBeast', NULL, '2021-03-25 13:14:55', 'bcd47c'),
(44897676, 'elad-weiss', NULL, '2021-03-25 13:14:56', '5cdccc'),
(45470751, 'kirillman200', NULL, '2021-03-25 13:14:56', 'e19153'),
(46409254, 'PedroPerpetua', NULL, '2021-03-25 13:14:55', '5c7cc4'),
(47786934, 'imeuropa', NULL, '2021-03-25 13:14:55', '515bad'),
(48015293, 'ellartdev', NULL, '2021-03-25 13:14:56', '88dc54'),
(48323313, 'shmuelhizmi', NULL, '2021-03-25 13:14:56', '945c47'),
(48367813, 'HarrisonMayotte', NULL, '2021-03-25 13:14:56', '449ce4'),
(48408336, 'genzyy', NULL, '2021-03-25 13:14:56', '4c85a5'),
(48413031, 'liulalemx', NULL, '2021-03-25 13:14:55', '9cdc44'),
(49862976, 'ErlendCat', NULL, '2021-03-25 13:14:56', 'c06c30'),
(50546858, 'BronzW', NULL, '2021-03-25 13:14:56', 'a7824e'),
(52201992, 'mohammadjavad948', NULL, '2021-03-25 13:14:56', '17afdc'),
(52224377, 'mitchglass97', NULL, '2021-03-25 13:14:56', 'bb6143'),
(53184535, 'Hasintha-Jayasinghe', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(53499802, 'AuroPick', NULL, '2021-03-25 13:14:55', 'b84663'),
(53651226, 'manaskhandelwal', NULL, '2021-03-25 13:14:55', 'bc9464'),
(54809379, 'Georg-code', NULL, '2021-03-25 13:14:56', 'b56a26'),
(54823450, 'slightknack', NULL, '2021-03-25 13:14:56', '2fba5a'),
(54871907, 'shyvesCCD', NULL, '2021-03-25 13:14:55', 'b85135'),
(55450464, 'goldyydev', NULL, '2021-03-25 13:14:55', '54bc50'),
(57638117, 'Johannes-Andersen', NULL, '2021-03-25 13:14:55', '3f83b3'),
(57767008, 'Intermo101', NULL, '2021-03-25 13:14:56', 'fcc464'),
(58105634, 'Devnol', NULL, '2021-03-25 13:14:55', '7f7f7f'),
(59137941, 'Capure', NULL, '2021-03-25 13:14:55', '04ccfc'),
(59149083, 'iskandervdh', NULL, '2021-03-25 13:14:55', '5ccc6c'),
(59368249, 'RZS2006', NULL, '2021-03-25 13:14:55', 'dccc84'),
(59373710, 'VasilisMylonas', NULL, '2021-03-25 13:14:56', '4cd46c'),
(60016719, 'ofsho', NULL, '2021-03-25 13:14:56', 'd46c4c'),
(60603110, 'Daggy1234', NULL, '2021-03-25 13:14:55', 'cb1a35'),
(60743431, 'marcis-andersons', NULL, '2021-03-25 13:14:55', '33cb42'),
(60858870, 'BananaSquares', NULL, '2021-03-25 13:14:56', 'c83657'),
(62604902, 'siemen-subbaiah', NULL, '2021-03-25 13:14:56', 'ac6c48'),
(62719173, 'JovanJevtic', NULL, '2021-03-25 13:14:56', 'a54c4c'),
(63201296, 'PhiJoTo', NULL, '2021-03-25 13:14:56', '7f7f7f'),
(64310361, 'TheOtterlord', NULL, '2021-03-25 13:14:55', 'd47c9c'),
(64473501, 'appare45', NULL, '2021-03-25 13:14:55', '7098d3'),
(64812024, 'KristofKekesi', NULL, '2021-03-25 13:14:56', '852cd2'),
(64860703, 'JustM3Dev', NULL, '2021-03-25 13:14:56', '349adf'),
(65691613, 'hisamafahri', NULL, '2021-03-25 13:14:55', 'c04057'),
(66535446, 'overlisted', NULL, '2021-03-25 13:14:55', 'df9139'),
(67191889, 'ArnavBansal11', NULL, '2021-03-25 13:14:56', 'dcbc54'),
(67717700, 'Gitter499', NULL, '2021-03-25 13:14:56', '2687d8'),
(67967992, 'Szoniko', NULL, '2021-03-25 13:14:55', 'a474d4'),
(68110106, 'dk-raw', NULL, '2021-03-25 13:14:55', 'c7c05c'),
(68249412, 'MattGodwin', NULL, '2021-03-25 13:14:56', '8b7f73'),
(68496162, 'MattLawz', NULL, '2021-03-25 13:14:56', 'bc9464'),
(68819139, 'Spacey4K', NULL, '2021-03-25 13:14:56', '2cabfb'),
(68983984, 'theCow61', NULL, '2021-03-25 13:14:55', '945cc4'),
(70864612, 'andrewrobles', NULL, '2021-03-25 13:14:56', '9c5a4b'),
(71091489, 'samarmohan', NULL, '2021-03-25 13:14:56', '1ced14'),
(73747557, 'Knoxo', NULL, '2021-03-25 13:14:56', '117adf'),
(74982354, 's-kxhindoli', NULL, '2021-03-25 13:14:55', 'c83667'),
(75699341, 'myl989', NULL, '2021-03-25 13:14:56', 'd1155b'),
(75909608, 'xkral-tr', NULL, '2021-03-25 13:14:56', '0dcbf4'),
(77071438, 'OwXi', NULL, '2021-03-25 13:14:56', '80108c'),
(77858139, 'Human-bio', NULL, '2021-03-25 13:14:55', '7cd49c'),
(79200328, '37r', NULL, '2021-03-25 13:14:56', '649ccc'),
(80863941, 'JesseCharlie', NULL, '2021-03-25 13:14:56', 'd45464'),
(80963894, 'xanthopsia', NULL, '2021-03-25 13:14:55', 'd47c64');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `AnalysedItem`
--
ALTER TABLE `AnalysedItem`
  ADD PRIMARY KEY (`analysisId`,`path`),
  ADD KEY `type` (`type`),
  ADD KEY `path` (`path`);

--
-- Indexes for table `AnalysedItemAggregateFileType`
--
ALTER TABLE `AnalysedItemAggregateFileType`
  ADD PRIMARY KEY (`analysisId`,`path`,`fileType`),
  ADD KEY `analysisId` (`analysisId`,`path`),
  ADD KEY `fileType` (`fileType`);

--
-- Indexes for table `AnalysedItemAggregateStats`
--
ALTER TABLE `AnalysedItemAggregateStats`
  ADD PRIMARY KEY (`analysisId`,`path`,`token`),
  ADD KEY `analysisId` (`analysisId`,`path`);

--
-- Indexes for table `AnalysedItemChunk`
--
ALTER TABLE `AnalysedItemChunk`
  ADD PRIMARY KEY (`analysisId`,`path`,`start`),
  ADD KEY `contributorId` (`contributorId`),
  ADD KEY `analysisId` (`analysisId`,`path`),
  ADD KEY `AnalysedItemChunk_ibfk_2` (`analysisId`,`contributorId`);

--
-- Indexes for table `AnalysedItemChunkToken`
--
ALTER TABLE `AnalysedItemChunkToken`
  ADD PRIMARY KEY (`analysisId`,`path`,`start`,`tokenType`),
  ADD KEY `tokenType` (`tokenType`);

--
-- Indexes for table `AnalysedItemContributor`
--
ALTER TABLE `AnalysedItemContributor`
  ADD PRIMARY KEY (`analysisId`,`path`,`contributorId`),
  ADD KEY `analysisId` (`analysisId`,`path`),
  ADD KEY `contributorId` (`contributorId`),
  ADD KEY `analysisId_2` (`analysisId`,`contributorId`);

--
-- Indexes for table `AnalysedItemContributorAggregateStats`
--
ALTER TABLE `AnalysedItemContributorAggregateStats`
  ADD PRIMARY KEY (`analysisId`,`path`,`contributorId`,`tokenType`),
  ADD KEY `analysisId` (`analysisId`,`path`),
  ADD KEY `userId` (`contributorId`),
  ADD KEY `AnalysedItemContributorAggregateStats_ibfk_2` (`analysisId`,`contributorId`),
  ADD KEY `AnalysedItemContributorAggregateStats_ibfk_3` (`tokenType`);

--
-- Indexes for table `Analysis`
--
ALTER TABLE `Analysis`
  ADD PRIMARY KEY (`analysisId`),
  ADD KEY `repositoryId` (`repositoryId`),
  ADD KEY `requestedBy` (`requestedBy`);

--
-- Indexes for table `AnalysisContributor`
--
ALTER TABLE `AnalysisContributor`
  ADD PRIMARY KEY (`analysisId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `FileType`
--
ALTER TABLE `FileType`
  ADD PRIMARY KEY (`typeId`);

--
-- Indexes for table `FileTypeExtension`
--
ALTER TABLE `FileTypeExtension`
  ADD PRIMARY KEY (`typeId`,`extension`),
  ADD UNIQUE KEY `extension_2` (`extension`),
  ADD KEY `typeId` (`typeId`),
  ADD KEY `extension` (`extension`);

--
-- Indexes for table `Repository`
--
ALTER TABLE `Repository`
  ADD PRIMARY KEY (`repositoryId`),
  ADD KEY `Repository_ibfk_1` (`ownerId`);

--
-- Indexes for table `TokenType`
--
ALTER TABLE `TokenType`
  ADD PRIMARY KEY (`tokenId`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `login` (`login`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Analysis`
--
ALTER TABLE `Analysis`
  MODIFY `analysisId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=398;

--
-- AUTO_INCREMENT for table `FileType`
--
ALTER TABLE `FileType`
  MODIFY `typeId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `AnalysedItem`
--
ALTER TABLE `AnalysedItem`
  ADD CONSTRAINT `AnalysedItem_ibfk_1` FOREIGN KEY (`type`) REFERENCES `FileType` (`typeId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItem_ibfk_2` FOREIGN KEY (`analysisId`) REFERENCES `Analysis` (`analysisId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemAggregateFileType`
--
ALTER TABLE `AnalysedItemAggregateFileType`
  ADD CONSTRAINT `AnalysedItemAggregateFileType_ibfk_1` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemAggregateFileType_ibfk_2` FOREIGN KEY (`fileType`) REFERENCES `FileType` (`typeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemAggregateStats`
--
ALTER TABLE `AnalysedItemAggregateStats`
  ADD CONSTRAINT `AnalysedItemAggregateStats_ibfk_1` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemChunk`
--
ALTER TABLE `AnalysedItemChunk`
  ADD CONSTRAINT `AnalysedItemChunk_ibfk_1` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemChunk_ibfk_2` FOREIGN KEY (`analysisId`,`contributorId`) REFERENCES `AnalysisContributor` (`analysisId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemChunkToken`
--
ALTER TABLE `AnalysedItemChunkToken`
  ADD CONSTRAINT `AnalysedItemChunkToken_ibfk_2` FOREIGN KEY (`tokenType`) REFERENCES `TokenType` (`tokenId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemChunkToken_ibfk_3` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemContributor`
--
ALTER TABLE `AnalysedItemContributor`
  ADD CONSTRAINT `AnalysedItemContributor_ibfk_1` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemContributor_ibfk_2` FOREIGN KEY (`analysisId`,`contributorId`) REFERENCES `AnalysisContributor` (`analysisId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AnalysedItemContributorAggregateStats`
--
ALTER TABLE `AnalysedItemContributorAggregateStats`
  ADD CONSTRAINT `AnalysedItemContributorAggregateStats_ibfk_1` FOREIGN KEY (`analysisId`,`path`) REFERENCES `AnalysedItem` (`analysisId`, `path`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemContributorAggregateStats_ibfk_2` FOREIGN KEY (`analysisId`,`contributorId`) REFERENCES `AnalysisContributor` (`analysisId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysedItemContributorAggregateStats_ibfk_3` FOREIGN KEY (`tokenType`) REFERENCES `TokenType` (`tokenId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Analysis`
--
ALTER TABLE `Analysis`
  ADD CONSTRAINT `Analysis_ibfk_1` FOREIGN KEY (`repositoryId`) REFERENCES `Repository` (`repositoryId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Analysis_ibfk_2` FOREIGN KEY (`requestedBy`) REFERENCES `User` (`userId`) ON UPDATE CASCADE;

--
-- Constraints for table `AnalysisContributor`
--
ALTER TABLE `AnalysisContributor`
  ADD CONSTRAINT `AnalysisContributor_ibfk_1` FOREIGN KEY (`analysisId`) REFERENCES `Analysis` (`analysisId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AnalysisContributor_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `User` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `FileTypeExtension`
--
ALTER TABLE `FileTypeExtension`
  ADD CONSTRAINT `FileTypeExtension_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `FileType` (`typeId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Repository`
--
ALTER TABLE `Repository`
  ADD CONSTRAINT `Repository_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `User` (`userId`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
