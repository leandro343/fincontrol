USE fincontrol;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    descricao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_categorias_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contas_contabeis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    natureza ENUM('FIXA', 'VARIAVEL') NOT NULL,
    recorrencia ENUM('MENSAL', 'EVENTUAL') NOT NULL,
    valor_previsto DECIMAL(10,2) NOT NULL,
    dia_previsto TINYINT NULL,
    data_prevista DATE NULL,
    status ENUM('ATIVA', 'INATIVA') NOT NULL DEFAULT 'ATIVA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_contas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_contas_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_contas_valor_previsto
        CHECK (valor_previsto > 0),

    CONSTRAINT chk_contas_dia_previsto
        CHECK (dia_previsto IS NULL OR dia_previsto BETWEEN 1 AND 31),

    CONSTRAINT chk_contas_recorrencia
        CHECK (
            (recorrencia = 'MENSAL'
                AND dia_previsto IS NOT NULL
                AND data_prevista IS NULL)
            OR
            (recorrencia = 'EVENTUAL'
                AND data_prevista IS NOT NULL
                AND dia_previsto IS NULL)
        )
);

CREATE TABLE IF NOT EXISTS movimentacoes_financeiras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conta_id INT NOT NULL,
    valor_realizado DECIMAL(10,2) NOT NULL,
    data_movimentacao DATE NOT NULL,
    observacao VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimentacoes_conta
        FOREIGN KEY (conta_id)
        REFERENCES contas_contabeis(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_movimentacoes_valor_realizado
        CHECK (valor_realizado > 0)
);