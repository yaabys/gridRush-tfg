import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminHeader({ onBack, title }) {
  const navigate = useNavigate();

  return (
    <div className="admin-header">
      <button className="btn btn-secondary" onClick={onBack}>
        Volver
      </button>
      <h1>{title}</h1>
      <button className="btn btn-danger" onClick={() => navigate('/')}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default AdminHeader; 