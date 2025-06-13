import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

function SortableRacerItem({ id, racer, carreraId, onImgClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const [avatarUrl, setAvatarUrl] = useState("/img/defaultIconProfile.webp");

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`/api/avatar/${racer.id}`, {
          responseType: "blob",
          withCredentials: true,
        });
        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (err) {
        setAvatarUrl("/img/defaultIconProfile.webp");
      }
    };
    fetchAvatar();
  }, [racer.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? "2px dashed var(--color-primary)" : "1px solid #444",
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  const fotoUrl = `/api/foto-resultado-carrera/${carreraId}/${racer.id}`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="racer-item">
      <span className="drag-handle">☰</span>
      <img
        src={avatarUrl}
        alt={`Avatar de ${racer.name}`}
        className="racer-resultado"
        style={{ cursor: "pointer" }}
        onError={e => { e.target.src = "/img/defaultIconProfile.webp"; }}
      />
      <span className="racer-position">{racer.position}º</span>
      <span className="racer-name">{racer.name}</span>
      <span className="racer-elo">ELO: {racer.elo || 0}</span>
      <button
        className="ver-foto-btn"
        onClick={() => onImgClick(fotoUrl)}
        style={{ marginLeft: "1rem" }}
      >
        Ver foto
      </button>
    </div>
  );
}

export default SortableRacerItem; 