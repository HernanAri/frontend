import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './pages/Login.jsx';
import LectorQR from './pages/Lector_Qr.jsx';
import Tiempo from './pages/Tiempo.jsx';
import Home from './pages/home.jsx';



function App() {  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/lector" element={<LectorQR />} />
        <Route path="/tiempo" element={<Tiempo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;