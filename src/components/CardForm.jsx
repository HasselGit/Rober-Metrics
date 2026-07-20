import React, { useState } from 'react';
import { X } from 'lucide-react';

const CardForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    limit: initialData?.limit || '',
    color: initialData?.color || '#70a1ff'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.limit) return;
    
    onSave({
      id: initialData?.id || `card-${Date.now()}`,
      name: formData.name,
      limit: parseFloat(formData.limit),
      color: formData.color,
      purchases: initialData?.purchases || []
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>{initialData ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Nombre de la Tarjeta</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. Visa Galicia, Amex" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Límite de Crédito ($)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0.00" 
              value={formData.limit}
              onChange={e => setFormData({...formData, limit: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Color de la Tarjeta</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['#70a1ff', '#ff4757', '#d4af37', '#94a3b8', '#32ff7e'].map(color => (
                <div 
                  key={color}
                  onClick={() => setFormData({...formData, color})}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', backgroundColor: color,
                    cursor: 'pointer', border: formData.color === color ? '2px solid white' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
