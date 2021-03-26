-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 26, 2021 at 06:32 PM
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
(-1, 'Anonymous', NULL, '2021-01-01 00:00:00', '3960A1');

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
  MODIFY `analysisId` int NOT NULL AUTO_INCREMENT;

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
