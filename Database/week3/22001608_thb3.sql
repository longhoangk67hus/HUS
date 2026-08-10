-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 18, 2023 at 10:40 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `QUANLYDA`
--

-- --------------------------------------------------------

--
-- Table structure for table `DỰÁN`
--

CREATE TABLE `DỰÁN` (
  `TênDA` varchar(30) NOT NULL,
  `MãsốDA` int(10) NOT NULL,
  `ĐịađiểmDA` varchar(30) NOT NULL,
  `MãsốĐV` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NHÂNVIÊN`
--

CREATE TABLE `NHÂNVIÊN` (
  `Họđệm` varchar(30) NOT NULL,
  `Tên` varchar(10) NOT NULL,
  `MãsốNV` int(8) NOT NULL,
  `Ngàysinh` date NOT NULL,
  `Địachỉ` varchar(100) NOT NULL,
  `Giớitính` varchar(3) NOT NULL,
  `Lương` int(11) NOT NULL,
  `MãsốNGS` int(11) NOT NULL,
  `MãsốĐV` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PHỤTHUỘC`
--

CREATE TABLE `PHỤTHUỘC` (
  `MãsốNV` int(8) NOT NULL,
  `Têncon` varchar(30) NOT NULL,
  `Giớitính` varchar(3) NOT NULL,
  `Ngàysinh` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `THAMGIA`
--

CREATE TABLE `THAMGIA` (
  `MãsốNV` int(10) NOT NULL,
  `MãsốDA` int(10) NOT NULL,
  `Sốgiờ` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ĐƠNVỊ`
--

CREATE TABLE `ĐƠNVỊ` (
  `TênĐV` varchar(30) NOT NULL,
  `MãsốĐV` int(10) NOT NULL,
  `MãsốNQL` int(8) NOT NULL,
  `Ngàybắtđầu` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ĐƠNVỊ_ĐỊAĐIỂM`
--

CREATE TABLE `ĐƠNVỊ_ĐỊAĐIỂM` (
  `MãsốĐV` int(10) NOT NULL,
  `ĐịađiểmĐV` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `DỰÁN`
--
ALTER TABLE `DỰÁN`
  ADD PRIMARY KEY (`MãsốDA`);

--
-- Indexes for table `NHÂNVIÊN`
--
ALTER TABLE `NHÂNVIÊN`
  ADD PRIMARY KEY (`MãsốNV`),
  ADD KEY `fk` (`MãsốĐV`);

--
-- Indexes for table `PHỤTHUỘC`
--
ALTER TABLE `PHỤTHUỘC`
  ADD PRIMARY KEY (`MãsốNV`,`Têncon`);

--
-- Indexes for table `THAMGIA`
--
ALTER TABLE `THAMGIA`
  ADD PRIMARY KEY (`MãsốNV`,`MãsốDA`),
  ADD KEY `MãsốDA` (`MãsốDA`);

--
-- Indexes for table `ĐƠNVỊ`
--
ALTER TABLE `ĐƠNVỊ`
  ADD PRIMARY KEY (`MãsốĐV`);

--
-- Indexes for table `ĐƠNVỊ_ĐỊAĐIỂM`
--
ALTER TABLE `ĐƠNVỊ_ĐỊAĐIỂM`
  ADD PRIMARY KEY (`MãsốĐV`,`ĐịađiểmĐV`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `DỰÁN`
--
ALTER TABLE `DỰÁN`
  ADD CONSTRAINT `dựán_ibfk_2` FOREIGN KEY (`MãsốĐV`) REFERENCES `ĐƠNVỊ` (`MãsốĐV`);

--
-- Constraints for table `NHÂNVIÊN`
--
ALTER TABLE `NHÂNVIÊN`
  ADD CONSTRAINT `fk` FOREIGN KEY (`MãsốĐV`) REFERENCES `ĐƠNVỊ` (`MãsốĐV`);

--
-- Constraints for table `PHỤTHUỘC`
--
ALTER TABLE `PHỤTHUỘC`
  ADD CONSTRAINT `phụthuộc_ibfk_1` FOREIGN KEY (`MãsốNV`) REFERENCES `NHÂNVIÊN` (`MãsốNV`);

--
-- Constraints for table `THAMGIA`
--
ALTER TABLE `THAMGIA`
  ADD CONSTRAINT `thamgia_ibfk_1` FOREIGN KEY (`MãsốNV`) REFERENCES `NHÂNVIÊN` (`MãsốNV`),
  ADD CONSTRAINT `thamgia_ibfk_2` FOREIGN KEY (`MãsốDA`) REFERENCES `DỰÁN` (`MãsốDA`);

--
-- Constraints for table `ĐƠNVỊ_ĐỊAĐIỂM`
--
ALTER TABLE `ĐƠNVỊ_ĐỊAĐIỂM`
  ADD CONSTRAINT `đơnvị_địađiểm_ibfk_1` FOREIGN KEY (`MãsốĐV`) REFERENCES `ĐƠNVỊ` (`MãsốĐV`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
