/* eslint-disable react/prop-types */

import "../styles/user-form.css";

const UserForm = ({ usuario, handleInputChange, enviarDatos }) => {
  return (
    <form onSubmit={enviarDatos}>
    <div>
      <label htmlFor="name">Nombre</label>
      <input type="text" name="name"  placeholder="Ingrese su nombre" value={usuario.name} onChange={handleInputChange} />
    </div>
    <div>
      <label htmlFor="curp">Curp</label>
      <input type="text" name="curp" maxLength="18" placeholder="Ingrese su curp"  value={usuario.curp} onChange={handleInputChange} />
    </div>
    <div>
      <label htmlFor="montoTotal">Monto total</label>
      <input type="number" name="montoTotal" placeholder="$ 0.0"  value={usuario.montoTotal} onChange={handleInputChange} />
    </div>
    <div>
      <label htmlFor="fechaInicial">Fecha de pago inicial</label>
      <input type="date" name="fechaInicial" placeholder="Dia/Mes/Año"  value={usuario.fechaInicial} onChange={handleInputChange} />
    </div>
    <div>
      <label htmlFor="fechaFinal">Fecha de pago final</label>
      <input type="date" name="fechaFinal" placeholder="Dia/Mes/Año"  value={usuario.fechaFinal} onChange={handleInputChange} />
    </div>
    <div>
      <label htmlFor="intervalo">Intervalo de pago</label>
      <select name="intervalo"   value={usuario.intervalo} onChange={handleInputChange}>
        <option value="semanal">Semanal</option>
        <option value="mensual">Mensual</option>
        <option value="trimestral">Trimestral</option>
        <option value="semestral">Semestral</option>
        <option value="anual">Anual</option>
      </select>
    </div>
    <button type="submit">Registrarse</button>
  </form>
  )
}

export default UserForm