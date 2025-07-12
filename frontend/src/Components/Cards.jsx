import React, { useState } from 'react';
import '../assets/styles/Cards.css'; 

export default function Cards() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica de login
    alert(`Usuario: ${username}\nContraseña: ${password}`);
  };

  return (
    <div className="login-card">
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="username">Usuario</label>
        <input
          type="text"
          id="username"
          placeholder="Ingrese su usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
