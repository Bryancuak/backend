import React, { useState } from 'react';
import "../styles/login.css";

const Consulta = () => {
  const [curp, setCurp] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [cobros, setCobros] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleBuscarUsuario = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/detalles/${curp}`);
      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
        setCobros(data.cobros);
        setShowModal(true);
      } else {
        console.error('Error al buscar el usuario');
      }
    } catch (error) {
      console.error('Error al realizar la consulta:', error);
    }
  };

  return (
    <div>
      <div className='form-container'>
        <h2 className='form-title'>Consulta de Cobros</h2>
        <form onSubmit={handleBuscarUsuario} className='form-space'>
          <div className='form-group'>
            <label htmlFor="curp">CURP:</label>
            <input
              id="curp"
              type="text"
              value={curp}
              onChange={(e) => setCurp(e.target.value)}
              placeholder="Ingresa el CURP"
              required
            />
          </div>
          <button type="submit" className='form-button'>Buscar</button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Cobro para {usuario.nombre}</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Monto a Liquidar:</strong> {usuario.monto_total}</p>
              <p><strong>Monto Pagado:</strong> {usuario.monto_acumulado}</p>

              <table>
                <thead>
                  <tr>
                    <th>Fecha Programada</th>
                    <th>Estado</th>
                    <th>Monto Cobrado</th>
                  </tr>
                </thead>
                <tbody>
                  {cobros.map((cobro) => (
                    <tr key={cobro.id_cobro}>
                      <td>{new Date(cobro.fecha_programada).toLocaleDateString()}</td>
                      <td>{cobro.estado}</td>
                      <td>{cobro.monto_cobrado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="pay-button" onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consulta;
