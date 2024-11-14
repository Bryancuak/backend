import UserForm from "./UserForm";
import '../styles/db-conector.css';
import { useState } from "react";

const initialUserState = {
  name: '',
  curp: '',
  montoTotal: '',
  fechaInicial: '',
  fechaFinal: '',
  intervalo: 'mensual',
  cantidad_pago: '',
};

const UserRegistration = () => {

    const [usuario, setUsuario] = useState(initialUserState);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prevUsuario) => ({
            ...prevUsuario,
            [name]: value,
        }));
    };

    const enviarDatos = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario),
            });
            const data = await response.json();
    
            if (response.ok) {
            setUsuario(initialUserState);  // Limpiar formulario después de enviar los datos
            alert("Usuario registrado con éxito");
            } else {
            alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error al enviar datos:", error);
        }
    };
    return (
        <div className="container">
            <div className="dashboardContent">
            <h1>Registro</h1>
            <UserForm usuario={usuario} handleInputChange={handleInputChange} enviarDatos={enviarDatos} />
            </div>
        </div>
    );
}

export default UserRegistration