import React, { useState } from "react";

export default function AdminLogin({ onLogin, onBack }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (user === "admin" && pass === "demo") {
      setError("");
      onLogin();
    } else {
      setError("Credenziali errate.");
    }
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: "80px auto",
      padding: 32,
      background: "#16316c",
      color: "#fff",
      borderRadius: 14,
      boxShadow: "0 2px 18px #0004"
    }}>
      <h2 style={{ marginBottom: 24 }}>Login Amministratore</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={e => setUser(e.target.value)}
          style={{
            width: "100%",
            padding: 11,
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #334",
            background: "#292f3d",
            color: "#fff",
            fontSize: 16
          }}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          style={{
            width: "100%",
            padding: 11,
            marginBottom: 16,
            borderRadius: 6,
            border: "1px solid #334",
            background: "#292f3d",
            color: "#fff",
            fontSize: 16
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 0",
            fontWeight: "bold",
            background: "#209146",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontSize: 17,
            marginBottom: 14
          }}
        >
          Login
        </button>
      </form>
      <button
        onClick={onBack}
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: 7,
          background: "#eaeaea",
          color: "#16316c",
          fontWeight: "bold",
          fontSize: 16,
          border: "none"
        }}
      >
        Torna indietro
      </button>
      {error && <div style={{ color: "orange", marginTop: 18 }}>{error}</div>}
    </div>
  );
}
