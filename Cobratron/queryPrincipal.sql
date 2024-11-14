create database	cobratron;


CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	curp VARCHAR(18) UNIQUE NOT NULL;
    monto_total DECIMAL(10, 2) NOT NULL,
    monto_acumulado DECIMAL(10, 2) DEFAULT 0
);
select * from usuario;
select * from pago;
select * from cobro;

CREATE TABLE Pago (
    id_pago SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES Usuario(id_usuario),
    frecuencia_pago VARCHAR(20) CHECK (frecuencia_pago IN ('semanal', 'mensual', 'trimestral', 'semestral', 'anual')),
    cantidad_pago DECIMAL(10, 2) NOT NULL,
    fecha_inicial DATE NOT NULL,
    fecha_final DATE NOT NULL
);


CREATE TABLE Cobro (
    id_cobro SERIAL PRIMARY KEY,
    id_pago INT NOT NULL REFERENCES Pago(id_pago),
    id_usuario INT NOT NULL REFERENCES Usuario(id_usuario),
    fecha_programada DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'pagado')),
    monto_cobrado DECIMAL(10, 2) DEFAULT 0
);