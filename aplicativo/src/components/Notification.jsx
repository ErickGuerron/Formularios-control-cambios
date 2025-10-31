import React from 'react';
import './Notification.css';

export default function Notification({ message, type, onClose }) {
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}