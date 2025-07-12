import React from 'react';
import '../assets/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Mi App</h3>
          <p>Esta es una aplicación de ejemplo hecha con React + Vite.</p>
        </div>

        <div className="footer-section links">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/lector">Registro</a></li>
            <li><a href="/Tiempo">Tiempo</a></li>
            <li><a href="/">Logout</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contacto</h4>
          <p>Email: ejemplo@correo.com</p>
          <p>Tel: +57 123 456 7890</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Mi App | Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer;
