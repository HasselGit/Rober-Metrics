import React, { useState } from 'react';
import { formatCurrency } from '../utils/financeCalculator';
import { X } from 'lucide-react';

const IncomeSourceForm = ({ source, onSave, onClose }) => {
  const [name, setName] = useState(source?.name || '');
  const [amount, setAmount] = useState(source?.amount?.toString() || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || isNaN(parseFloat(amount))) return;

    onSave({
      id: source?.id || `is-${Date.now()}`,
      name: name.trim(),
      amount: parseFloat(amount),
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div style={{ width: '40px', height: '4px', background: 'var(--surface-container)', borderRadius: '2px', margin: '0 auto 1.5rem' }} />

        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>
            {source ? 'Editar Ingreso' : 'Nuevo Ingreso'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fuente de ingreso
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Ej: Sueldo, Freelance, Alquiler..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monto mensual
            </label>
            <input
              className="input-field"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
              required
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.4rem' }}>
                {formatCurrency(parseFloat(amount))}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {source ? 'Guardar Cambios' : 'Agregar Ingreso'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomeSourceForm;
