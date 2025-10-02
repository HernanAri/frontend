import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login_page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/autenticador/login", {
        username,
        password,
      });

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setMessage("✅ Login exitoso");

        setTimeout(() =>{
          navigate("/lector");
        }, 1000)
      } else {
        setMessage("❌ " + (res.data.error || "credenciales invalidas"));
      }
    } catch (err) {
      setMessage("❌ Error al conectar con el servidor");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Ingresar</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login_page;
