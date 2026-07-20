import React, { useState } from 'react';
import { X } from 'lucide-react';

const PurchaseForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.totalAmount || '',
    installments: initialData?.installments || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    
    onSave({
      id: initialData?.id || Date.now().toString(),
      description: formData.description,
      totalAmount: parseFloat(formData.amount),
      installments: parseInt(formData.installments),
      currentInstallment: initialData?.currentInstallment || 1,
      amountPerMonth: parseFloat(formData.amount) / parseInt(formData.installments),
      remainingMonths: parseInt(formData.installments) - ((initialData?.currentInstallment || 1) - 1)
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>{initialData ? 'Editar Compra' : 'Nueva Compra'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Descripción</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. Zapatillas" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Monto Total ($)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0.00" 
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Cantidad de Cuotas</label>
            <select 
              className="input-field" 
              value={formData.installments}
              onChange={e => setFormData({...formData, installments: e.target.value})}
              disabled={!!initialData} // Lock installments on edit to prevent math complexity for now
            >
              {[1,2,3,6,9,12,18,24].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;
