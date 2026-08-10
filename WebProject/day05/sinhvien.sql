-- Create the database
CREATE DATABASE SinhVien;

-- Select the new database
USE SinhVien;

-- Create the table 'users'
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- Auto-incrementing primary key
    name NVARCHAR(100) NOT NULL,       -- Name column, non-null
    birthday DATE NOT NULL,            -- Birthday column, storing dates
    course NVARCHAR(100) NOT NULL      -- Course column, non-null
);