import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import './styles/app.css'
// import RutaProtegida from './utils/RutaProtegida';
import Consulta from './pages/Consulta';
import Home from './components/Home';
import Pago from './components/Pago';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/page" element={<Pago/>} />
          <Route path='/consult' element={
            // <RutaProtegida>
              <Consulta/>
            // </RutaProtegida>
              }
            />
      </Routes>

  </Router>
    
  )
}

export default App