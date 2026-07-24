-- ============================================================
-- Admin Users Table Migration
-- Run this once against eco_energy_solution_db
-- ============================================================

USE eco_energy_solution_db;

CREATE TABLE IF NOT EXISTS admin_users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(80)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hash
    role        ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
