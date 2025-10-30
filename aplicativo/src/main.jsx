 import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Importa tus vistas
import Developer from "./users/Developer.jsx";
import UserFinal from "./users/UserFinal.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta inicial redirige a /users/developer */}
        <Route path="/" element={<Navigate to="/users/developer" replace />} />

        {/* Rutas principales */}
        <Route path="/users/developer" element={<Developer />} />
        <Route path="/users/final" element={<UserFinal />} />

        {/* Fallback si no existe ruta */}
        <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
