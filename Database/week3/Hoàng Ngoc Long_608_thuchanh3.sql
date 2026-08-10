-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 18, 2023 at 05:46 PM
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
-- Database: `QLDACT`
--

-- --------------------------------------------------------

--
-- Table structure for table `CONGVIEC`
--

CREATE TABLE `CONGVIEC` (
  `MADA` int(11) NOT NULL,
  `STT` int(11) NOT NULL,
  `TEN_CONG_VIEC` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DEAN`
--

CREATE TABLE `DEAN` (
  `TENDA` varchar(15) NOT NULL,
  `MADA` int(11) NOT NULL,
  `DDIEM_DA` varchar(15) DEFAULT NULL,
  `PHONG` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DIADIEM_PHG`
--

CREATE TABLE `DIADIEM_PHG` (
  `MAPHG` int(11) NOT NULL,
  `DIADIEM` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien`
--

CREATE TABLE `nhanvien` (
  `HONV` varchar(15) NOT NULL,
  `TENLOT` varchar(15) NOT NULL,
  `TENNV` varchar(15) NOT NULL,
  `MANV` varchar(9) NOT NULL,
  `NGSHINH` date NOT NULL,
  `DCHI` varchar(30) NOT NULL,
  `PHAI` varchar(3) NOT NULL,
  `LUONG` double(20,5) NOT NULL,
  `MA_NQL` varchar(9) NOT NULL,
  `PHG` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PHANCONG`
--

CREATE TABLE `PHANCONG` (
  `MA_NVIEN` varchar(9) NOT NULL,
  `MADA` int(11) NOT NULL,
  `STT` int(11) NOT NULL,
  `THOIGIAN` double(5,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PHONGBAN`
--

CREATE TABLE `PHONGBAN` (
  `TENPHG` varchar(15) NOT NULL,
  `MAPHG` int(11) NOT NULL,
  `TRPHG` varchar(9) NOT NULL,
  `NG_NHAMCHUC` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `THANNHAN`
--

CREATE TABLE `THANNHAN` (
  `MA_NVIEN` varchar(9) NOT NULL,
  `TENTN` varchar(15) NOT NULL,
  `PHAI` varchar(3) NOT NULL,
  `NGSINH` date NOT NULL,
  `QUANHE` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CONGVIEC`
--
ALTER TABLE `CONGVIEC`
  ADD PRIMARY KEY (`MADA`,`STT`);

--
-- Indexes for table `DEAN`
--
ALTER TABLE `DEAN`
  ADD PRIMARY KEY (`MADA`),
  ADD KEY `PHONG` (`PHONG`);

--
-- Indexes for table `DIADIEM_PHG`
--
ALTER TABLE `DIADIEM_PHG`
  ADD PRIMARY KEY (`MAPHG`,`DIADIEM`);

--
-- Indexes for table `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD PRIMARY KEY (`MANV`),
  ADD KEY `MA_NQL` (`MA_NQL`);

--
-- Indexes for table `PHANCONG`
--
ALTER TABLE `PHANCONG`
  ADD PRIMARY KEY (`MA_NVIEN`),
  ADD KEY `MADA` (`MADA`,`STT`);

--
-- Indexes for table `PHONGBAN`
--
ALTER TABLE `PHONGBAN`
  ADD PRIMARY KEY (`MAPHG`);

--
-- Indexes for table `THANNHAN`
--
ALTER TABLE `THANNHAN`
  ADD PRIMARY KEY (`MA_NVIEN`,`TENTN`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CONGVIEC`
--
ALTER TABLE `CONGVIEC`
  ADD CONSTRAINT `congviec_ibfk_1` FOREIGN KEY (`MADA`) REFERENCES `DEAN` (`MADA`);

--
-- Constraints for table `DEAN`
--
ALTER TABLE `DEAN`
  ADD CONSTRAINT `dean_ibfk_1` FOREIGN KEY (`PHONG`) REFERENCES `PHONGBAN` (`MAPHG`);

--
-- Constraints for table `DIADIEM_PHG`
--
ALTER TABLE `DIADIEM_PHG`
  ADD CONSTRAINT `diadiem_phg_ibfk_1` FOREIGN KEY (`MAPHG`) REFERENCES `PHONGBAN` (`MAPHG`);

--
-- Constraints for table `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD CONSTRAINT `nhanvien_ibfk_2` FOREIGN KEY (`MANV`) REFERENCES `THANNHAN` (`MA_NVIEN`),
  ADD CONSTRAINT `nhanvien_ibfk_3` FOREIGN KEY (`MA_NQL`) REFERENCES `nhanvien` (`MANV`);

--
-- Constraints for table `PHANCONG`
--
ALTER TABLE `PHANCONG`
  ADD CONSTRAINT `phancong_ibfk_1` FOREIGN KEY (`MA_NVIEN`) REFERENCES `nhanvien` (`MANV`),
  ADD CONSTRAINT `phancong_ibfk_2` FOREIGN KEY (`MADA`,`STT`) REFERENCES `CONGVIEC` (`MADA`, `STT`),
  ADD CONSTRAINT `phancong_ibfk_3` FOREIGN KEY (`MADA`,`STT`) REFERENCES `CONGVIEC` (`MADA`, `STT`);

--
-- Constraints for table `PHONGBAN`
--
ALTER TABLE `PHONGBAN`
  ADD CONSTRAINT `phongban_ibfk_1` FOREIGN KEY (`TRPHG`) REFERENCES `nhanvien` (`MANV`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
