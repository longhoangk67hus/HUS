-- Create the database
CREATE DATABASE SinhVien;

-- Select the new database
USE SinhVien;

-- Create the table 'users'
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- Auto-incrementing primary key
    studentName NVARCHAR(100) NOT NULL,       -- Name column, non-null
    birthday DATE NOT NULL,            -- Birthday column, storing dates
    subject  NVARCHAR(100) NOT NULL,    -- Subject column, non-null
    course NVARCHAR(100) NOT NULL      -- Course column, non-null
    avatar  NVARCHAR(255) NOT NULL              -- Avatar column, storing URL

);