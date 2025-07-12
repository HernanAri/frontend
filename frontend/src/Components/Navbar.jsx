import React, { useState } from 'react';
import '../assets/styles/Navbar.css'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo" >
        <img src="/logo2.png" alt="Logo" />
      </div>

      <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </div>

      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="/lector">Registro</a></li>
        <li><a href="/tiempo">Tiempo</a></li>
        <li><a href="/Login">Logout</a></li>
        <li><input type="text" placeholder="Buscar..." className="search-input" /></li>
      </ul>
    </nav>
  );
};

export default Navbar;
