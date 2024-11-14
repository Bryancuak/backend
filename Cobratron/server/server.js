const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

  const calcularCobros = (montoTotal, fechaInicial, fechaFinal, frecuencia) => {
    const fechaInicio = new Date(fechaInicial);
    const fechaFin = new Date(fechaFinal);
    const diferenciaMeses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth());
  
    let cantidadIntervalos;
    let interval;
    switch (frecuencia.trim().toLowerCase()) {
      case 'semanal':
        cantidadIntervalos = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24 * 7));
        interval = 'weeks';
        break;
      case 'mensual':
        cantidadIntervalos = diferenciaMeses;
        interval = 'months';
        break;
      case 'trimestral':
        cantidadIntervalos = Math.floor(diferenciaMeses / 3);
        interval = 'months';
        break;
      case 'semestral':
        cantidadIntervalos = Math.floor(diferenciaMeses / 6);
        interval = 'months';
        break;
      case 'anual':
        cantidadIntervalos = Math.floor(diferenciaMeses / 12);
        interval = 'years';
        break;
      default:
        throw new Error("Frecuencia no válida. Usa: 'semanal', 'mensual', 'trimestral', 'semestral' o 'anual'.");
    }
  
    const cantidadPago = montoTotal / cantidadIntervalos;
    const cobros = [];
    let fechaCobro = new Date(fechaInicio);
  
    for (let i = 0; i < cantidadIntervalos; i++) {
      cobros.push({
        fecha_programada: new Date(fechaCobro),
        monto_cobro: cantidadPago,
      });
      if (interval === 'weeks') fechaCobro.setDate(fechaCobro.getDate() + 7);
      else if (interval === 'months') fechaCobro.setMonth(fechaCobro.getMonth() + (frecuencia === 'trimestral' ? 3 : frecuencia === 'semestral' ? 6 : 1));
      else if (interval === 'years') fechaCobro.setFullYear(fechaCobro.getFullYear() + 1);
    }
  
    return cobros;
  };
  

// Endpoint para registrar un usuario y sus detalles de pago
app.post('/api/usuarios', async (req, res) => {
    const {
      name,
      curp,
      montoTotal,
      montoAcumulado = 0,
      fechaInicial,
      fechaFinal,
      intervalo,
    } = req.body;
  
    try {
      const cobros = calcularCobros(montoTotal, fechaInicial, fechaFinal, intervalo);
      const client = await pool.connect();
      await client.query('BEGIN');
  
      const usuarioQuery = `
        INSERT INTO Usuario (nombre, curp, monto_total, monto_acumulado)
        VALUES ($1, $2, $3, $4)
        RETURNING id_usuario`;
      const usuarioResult = await client.query(usuarioQuery, [name, curp, montoTotal, montoAcumulado]);
      const idUsuario = usuarioResult.rows[0].id_usuario;
  
      const pagoQuery = `
        INSERT INTO Pago (id_usuario, frecuencia_pago, cantidad_pago, fecha_inicial, fecha_final)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_pago`;
      const cantidadPago = cobros[0].monto_cobro;
      const pagoResult = await client.query(pagoQuery, [idUsuario, intervalo, cantidadPago, fechaInicial, fechaFinal]);
      const idPago = pagoResult.rows[0].id_pago;
  
      const cobroQuery = `
        INSERT INTO Cobro (id_pago, id_usuario, fecha_programada, estado, monto_cobrado)
        VALUES ($1, $2, $3, 'pendiente', $4)`;
      for (const cobro of cobros) {
        await client.query(cobroQuery, [idPago, idUsuario, cobro.fecha_programada, 0]);
      }
  
      await client.query('COMMIT');
      res.status(201).json({ message: 'Usuario y cobros registrados correctamente', idUsuario });
    } catch (error) {
      console.error('Error al registrar usuario y cobros:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para obtener los detalles de un usuario y sus cobros, basado en el CURP
app.get('/api/usuarios/detalles/:curp', async (req, res) => {
    const { curp } = req.params;
  
    try {
      const client = await pool.connect();
  
      // Obtener los datos del usuario por su CURP
      const usuarioQuery = `
        SELECT id_usuario, nombre, monto_total, monto_acumulado
        FROM Usuario
        WHERE curp = $1
      `;
      const usuarioResult = await client.query(usuarioQuery, [curp]);
  
      // Verificar si el usuario existe
      if (usuarioResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const usuario = usuarioResult.rows[0];
  
      // Obtener los cobros relacionados con el usuario
      const cobrosQuery = `
        SELECT id_cobro, fecha_programada, estado, monto_cobrado
        FROM Cobro
        WHERE id_usuario = $1
        ORDER BY fecha_programada ASC
      `;
      const cobrosResult = await client.query(cobrosQuery, [usuario.id_usuario]);
  
      const cobros = cobrosResult.rows;
  
      res.json({
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          monto_total: usuario.monto_total,
          monto_acumulado: usuario.monto_acumulado,
        },
        cobros,
      });
    } catch (error) {
      console.error('Error al obtener detalles del usuario y cobros:', error);
      res.status(500).json({ error: 'Error al obtener detalles del usuario y cobros' });
    }
  });
  

// Endpoint para obtener usuario y monto pendiente de pago basado en el CURP
app.get('/api/usuarios/:curp', async (req, res) => {
    const { curp } = req.params;
  
    try {
      const usuarioQuery = `
        SELECT u.id_usuario, u.nombre, p.cantidad_pago
        FROM Usuario u
        JOIN Pago p ON u.id_usuario = p.id_usuario
        WHERE u.curp = $1
        AND p.id_pago IN (
          SELECT id_pago FROM Cobro
          WHERE id_usuario = u.id_usuario
          AND estado = 'pendiente'
          LIMIT 1
        )
      `;
      const result = await pool.query(usuarioQuery, [curp]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o sin pagos pendientes' });
      }
  
      const usuario = result.rows[0];
      res.json({
        usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre },
        cantidad_pendiente: usuario.cantidad_pago,
      });
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ error: 'Error al buscar usuario' });
    }
  });

  app.post('/api/pagos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
  
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Seleccionar el próximo cobro pendiente del usuario
      const cobroQuery = `
        SELECT id_cobro, monto_cobrado FROM Cobro
        WHERE id_usuario = $1
        AND estado = 'pendiente'
        LIMIT 1
      `;
      const cobroResult = await client.query(cobroQuery, [id_usuario]);
  
      if (cobroResult.rows.length === 0) {
        return res.status(404).json({ message: 'No hay cobros pendientes para este usuario' });
      }
  
      const idCobro = cobroResult.rows[0].id_cobro;
      const montoCobro = cobroResult.rows[0].monto_cobrado;
  
      // Seleccionar el monto de pago para el usuario
      const montoPagoQuery = `
        SELECT cantidad_pago FROM Pago WHERE id_usuario = $1 LIMIT 1
      `;
      const pagoResult = await client.query(montoPagoQuery, [id_usuario]);
  
      if (pagoResult.rows.length === 0) {
        return res.status(404).json({ message: 'No se encontró el monto de pago para el usuario' });
      }
  
      const montoPago = pagoResult.rows[0].cantidad_pago;
  
      // Actualizar el estado del cobro a "pagado"
      const actualizarCobroQuery = `
        UPDATE Cobro
        SET estado = 'pagado', monto_cobrado = $1
        WHERE id_cobro = $2
      `;
      await client.query(actualizarCobroQuery, [montoPago, idCobro]);
  
      // Actualizar el monto acumulado del usuario
      const actualizarMontoAcumuladoQuery = `
        UPDATE Usuario
        SET monto_acumulado = monto_acumulado + $1
        WHERE id_usuario = $2
      `;
      await client.query(actualizarMontoAcumuladoQuery, [montoPago, id_usuario]);
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Pago realizado con éxito y monto acumulado actualizado' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al realizar el pago:', error);
      res.status(500).json({ error: 'Error al realizar el pago' });
    } finally {
      client.release();
    }
  });


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
