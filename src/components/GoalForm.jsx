import React, { useState } from 'react';
import { X } from 'lucide-react';

const GoalForm = ({ onClose, onSave, initialData, isFunding }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    targetAmount: initialData?.targetAmount || '',
    color: initialData?.color || '#d4af37',
    fundingAmount: '' // only used when isFunding is true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFunding) {
      if (!formData.fundingAmount) return;
      onSave({
        ...initialData,
        currentAmount: (initialData.currentAmount || 0) + parseFloat(formData.fundingAmount)
      });
    } else {
      if (!formData.name || !formData.targetAmount) return;
      onSave({
        id: initialData?.id || `g-${Date.now()}`,
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: initialData?.currentAmount || 0,
        color: formData.color
      });
    }
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>
            {isFunding ? `Aportar a ${initialData.name}` : (initialData ? 'Editar Meta' : 'Nueva Meta')}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isFunding ? (
            <div className="mb-4">
              <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Monto a aportar ($)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0.00" 
                value={formData.fundingAmount}
                onChange={e => setFormData({...formData, fundingAmount: e.target.value})}
              />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Nombre de la Meta</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Viaje, MacBook" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Monto Objetivo ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00" 
                  value={formData.targetAmount}
                  onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Color Identificador</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['#d4af37', '#94a3b8', '#32ff7e', '#70a1ff', '#ff4757'].map(color => (
                    <div 
                      key={color}
                      onClick={() => setFormData({...formData, color})}
                      style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color,
                        cursor: 'pointer', border: formData.color === color ? '2px solid white' : '2px solid transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
