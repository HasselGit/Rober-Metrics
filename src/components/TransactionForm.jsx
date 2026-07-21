import React, { useState } from 'react';
import { X } from 'lucide-react';

const TransactionForm = ({ onClose, onSave, creditCards, initialData }) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'esenciales',
    type: initialData?.type || 'expense',
    cardId: initialData?.cardId || creditCards?.[0]?.id || '',
    installments: initialData?.installments || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    
    onSave({
      id: initialData?.id || Date.now().toString(),
      date: initialData?.date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      cardId: formData.type === 'credit_card' ? formData.cardId : undefined,
      installments: formData.type === 'credit_card' ? parseInt(formData.installments) : undefined
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>{initialData ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Tipo</label>
            <select 
              className="input-field" 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              disabled={!!initialData} // Lock type when editing for simplicity
            >
              <option value="expense">Gasto (Efectivo/Débito)</option>
              <option value="credit_card">Tarjeta de Crédito (Cuotas)</option>
              <option value="subscription">Gasto Fijo / Suscripción (Recurrente)</option>
              <option value="income">Ingreso (Sueldo)</option>
              <option value="transfer">Ahorro / Inversión</option>
            </select>
          </div>

          {formData.type === 'credit_card' ? (
            <>
              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Tarjeta</label>
                <select 
                  className="input-field" 
                  value={formData.cardId}
                  onChange={e => setFormData({...formData, cardId: e.target.value})}
                  disabled={!!initialData}
                >
                  {creditCards.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Cantidad de Cuotas</label>
                <select 
                  className="input-field" 
                  value={formData.installments}
                  onChange={e => setFormData({...formData, installments: e.target.value})}
                  disabled={!!initialData}
                >
                  {[1,2,3,6,9,12,18,24].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Categoría (50/30/20)</label>
              <select 
                className="input-field" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                disabled={formData.type === 'income'}
              >
                <option value="esenciales">Esenciales (50%) - Vivienda, Comida</option>
                <option value="no-esenciales">No Esenciales (30%) - Gustos, Salidas</option>
                {formData.type !== 'subscription' && (
                  <option value="ahorro">Ahorro (20%) - CEDEARs, MEP</option>
                )}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Descripción</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. Supermercado" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Monto Total ($)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0.00" 
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
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

export default TransactionForm;
