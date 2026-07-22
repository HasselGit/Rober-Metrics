import React, { useState } from 'react';
import { X } from 'lucide-react';
import CurrencyInput from './CurrencyInput';

const SubscriptionForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'esenciales'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    
    onSave({
      id: initialData?.id || `sub-${Date.now()}`,
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>{initialData ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Nombre del Servicio</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. Netflix, Gimnasio" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Categoría (50/30/20)</label>
            <select 
              className="input-field" 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="esenciales">Esenciales (50%) - Alquiler, Internet</option>
              <option value="no-esenciales">No Esenciales (30%) - Streaming, Gym</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Monto Mensual ($)</label>
            <CurrencyInput 
              value={formData.amount}
              onChange={val => setFormData({...formData, amount: val})}
              placeholder="$ 0,0"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
