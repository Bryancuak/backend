import { useState } from "react";
import Modal from "react-modal";
import "../styles/login.css"; // Asegúrate de tener estilos adecuados

Modal.setAppElement("#root"); // Necesario para accesibilidad

const Pago = () => {
  const [curp, setCurp] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [cantidadPagar, setCantidadPagar] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const buscarUsuario = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${curp}`);
      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
        setCantidadPagar(data.cantidad_pendiente);
        setIsModalOpen(true); // Abrir modal al encontrar el usuario
      } else {
        setMensaje("Usuario no encontrado o error al buscar.");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor.");
    }
  };

  const realizarPago = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pagos/${usuario.id_usuario}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setMensaje("Pago realizado con éxito.");
        setCantidadPagar(0);
      } else {
        setMensaje("Error al realizar el pago.");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUsuario(null);
    setCantidadPagar(null);
  };

  return (
    <div>
      <div className="form-container">
        <h2 className="form-title">Pagar</h2>
        <form onSubmit={buscarUsuario} className="form-space">
          <div className="form-group">
            <label htmlFor="curp">CURP:</label>
            <input
              required
              id="curp"
              className="form-input"
              type="text"
              placeholder="Ingresa tu CURP"
              value={curp}
              onChange={(e) => setCurp(e.target.value)}
            />
          </div>
          <button type="submit" className="form-button">Buscar</button>
        </form>

        {mensaje && <p>{mensaje}</p>}
      </div>

      {/* Modal para mostrar la información del usuario */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Información del Usuario"
        className="modal-content" // Estilos personalizados para el modal
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h3>Información del Usuario</h3>
          <button onClick={closeModal} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {usuario && (
            <>
              <p><strong>Nombre:</strong> {usuario.nombre}</p>
              <p><strong>Monto a pagar:</strong> ${cantidadPagar}</p>
              <button onClick={realizarPago} className="pay-button">
                Pagar ahora
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Pago;
