import React from 'react';
import { Target, Edit2, Trash2, ArrowUpCircle } from 'lucide-react';
import { formatCurrency } from '../utils/financeCalculator';

const Goals = ({ goals, onAdd, onEdit, onDelete, onFund }) => {
  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="mb-4 sticky-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Target size={20} color="var(--primary)" /> Mis Alcancías
        </h2>
        <h1 style={{ fontSize: '2.2rem' }}>Metas de Ahorro</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="glass-panel" style={{ width: '100%' }}>
              <div className="flex-between mb-2">
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} color={goal.color} /> {goal.name}
                </span>
                <span style={{ fontWeight: 'bold' }}>{progress.toFixed(1)}%</span>
              </div>
              
              <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', marginBottom: '0.5rem' }}>
                <div style={{ width: `${progress}%`, backgroundColor: goal.color, height: '100%', borderRadius: '6px' }} />
              </div>
              
              <div className="flex-between text-muted" style={{ fontSize: '0.875rem' }}>
                <span>Ahorrado: {formatCurrency(goal.currentAmount)}</span>
                <span>Meta: {formatCurrency(goal.targetAmount)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                <button onClick={() => onFund(goal)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', border: 'none' }}>
                  <ArrowUpCircle size={14} /> Aportar
                </button>
                <button onClick={() => onEdit(goal)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar esta meta?')) onDelete(goal.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                  <Trash2 size={14} /> Borrar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Goals;
