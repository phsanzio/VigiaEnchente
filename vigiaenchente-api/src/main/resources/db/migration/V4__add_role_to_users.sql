-- Adiciona coluna role na tabela users
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Cria índice para consultas por role
CREATE INDEX idx_users_role ON users(role);
