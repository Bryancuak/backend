import DBConector from "../components/DbConector";

const initialUserState = {
    name: '',
    age: '',
    mail: '',
    major: '',
    password: ''
};

const enviarDatos= async (e, usuario, setUsuario) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario),
        });
        if (response.ok) {
            setUsuario(initialUserState);
            alert("¡Usuario registrado exitosamente!");
        } else {
            console.error('Error al guardar los datos');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }

}



const ApiServices = () => {
  return (
    <DBConector enviarDatos={enviarDatos}></DBConector>
  )
}

export default ApiServices