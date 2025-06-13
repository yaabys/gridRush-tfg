import React from 'react';

function ImageModal({ isOpen, onClose, imageUrl }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={imageUrl} alt="Foto del resultado" style={{ maxWidth: "100%", maxHeight: "80vh" }} />
      </div>
    </div>
  );
}

export default ImageModal; 