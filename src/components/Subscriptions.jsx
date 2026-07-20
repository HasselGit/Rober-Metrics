import React from 'react';
import { RefreshCw, TrendingDown, Edit2, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/financeCalculator';

const Subscriptions = ({ subscriptions, onAdd, onEdit, onDelete }) => {
  const esenciales = subscriptions.filter(s => s.category === 'esenciales');
  const noEsenciales = subscriptions.filter(s => s.category === 'no-esenciales');

  const totalEsenciales = esenciales.reduce((acc, sub) => acc + sub.amount, 0);
  const totalNoEsenciales = noEsenciales.reduce((acc, sub) => acc + sub.amount, 0);
  const totalMonthly = totalEsenciales + totalNoEsenciales;

  const renderSubscriptionCard = (sub) => (
    <div key={sub.id} className="glass-panel" style={{ width: '100%', flex: '0 0 auto', borderLeft: `4px solid ${sub.category === 'esenciales' ? '#94a3b8' : '#64748b'}`, cursor: 'pointer' }} onClick={() => onEdit(sub)}>
      <div className="flex-between mb-2">
        <span style={{ fontWeight: 600 }}>{sub.name}</span>
        <span style={{ fontWeight: 'bold' }}>{formatCurrency(sub.amount)}</span>
      </div>
      <div className="flex-between text-muted" style={{ fontSize: '0.875rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={14} /> Recurrente mensual
        </span>
        <span style={{ textTransform: 'capitalize' }}>{sub.category.replace('-', ' ')}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(sub); }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
          <Edit2 size={14} /> Editar
        </button>
        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('¿Seguro que quieres borrar este gasto fijo?')) onDelete(sub.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
          <Trash2 size={14} /> Borrar
        </button>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex-between mb-4 sticky-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <RefreshCw size={20} color="#94a3b8" /> Gastos Fijos
          </h2>
          <h1 style={{ fontSize: '2.5rem' }}>{formatCurrency(totalMonthly)}</h1>
        </div>
        <button className="fab" onClick={onAdd} aria-label="Agregar Gasto Fijo">
          <Plus size={24} />
        </button>
      </header>

      {esenciales.length > 0 && (
        <div className="mb-4">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Esenciales</h3>
            <span style={{ fontWeight: '600' }}>{formatCurrency(totalEsenciales)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {esenciales.map(renderSubscriptionCard)}
          </div>
        </div>
      )}

      {noEsenciales.length > 0 && (
        <div className="mb-4">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '1.1rem', color: '#64748b' }}>No Esenciales</h3>
            <span style={{ fontWeight: '600' }}>{formatCurrency(totalNoEsenciales)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {noEsenciales.map(renderSubscriptionCard)}
          </div>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="glass-panel text-center text-muted" style={{ padding: '2rem' }}>
          No tienes gastos fijos registrados. Presiona el botón + para agregar uno.
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
