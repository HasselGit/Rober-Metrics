import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Edit2, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/financeCalculator';

const CreditCardDetail = ({ card, onBack, onEditPurchase, onDeletePurchase }) => {
  // Use state to track selected month offset (0 = current month, 1 = next month, etc.)
  const [monthOffset, setMonthOffset] = useState(0);

  const getTargetDate = (offset) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d;
  };

  const targetDate = getTargetDate(monthOffset);
  const monthName = targetDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Calculate purchases that fall into this month
  const activePurchases = card.purchases.filter(p => {
    // If a purchase has remainingMonths >= offset + 1, it means it has an installment this month
    // Because offset 0 is current month. 
    // Example: remaining=3. offset=0 (true), offset=1 (true), offset=2 (true), offset=3 (false).
    return p.remainingMonths > monthOffset;
  });

  const totalThisMonth = activePurchases.reduce((acc, p) => acc + p.amountPerMonth, 0);
  const totalDebt = card.purchases.reduce((acc, p) => acc + (p.amountPerMonth * p.remainingMonths), 0);

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <header className="flex-between mb-4 sticky-header">
        <button onClick={onBack} className="btn-ghost" style={{ padding: '8px', marginLeft: '-8px' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{card.name}</h2>
        <div style={{ width: '40px' }} /> {/* Spacer to center title */}
      </header>

      {/* Month Selector */}
      <div className="flex-between mb-4 glass-panel" style={{ padding: '0.75rem 1rem' }}>
        <button 
          onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))} 
          className="btn-ghost" 
          disabled={monthOffset === 0}
          style={{ padding: '4px', opacity: monthOffset === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--primary)" /> {monthName}
        </span>
        <button 
          onClick={() => setMonthOffset(prev => Math.min(11, prev + 1))} 
          className="btn-ghost"
          disabled={monthOffset === 11}
          style={{ padding: '4px', opacity: monthOffset === 11 ? 0.3 : 1 }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card mb-4 text-center" style={{ borderTop: `4px solid ${card.color}` }}>
        <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>A pagar este mes</p>
        <h1 style={{ fontSize: '2.5rem', color: '#ff4757', marginBottom: '0.5rem' }}>{formatCurrency(totalThisMonth)}</h1>
        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Deuda Total Acumulada: {formatCurrency(totalDebt)}</p>
      </div>

      {/* Ticket/List */}
      <h3 className="mb-3" style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>Detalle de Consumos</h3>
      
      {activePurchases.length === 0 ? (
        <div className="glass-panel text-center text-muted" style={{ padding: '2rem' }}>
          No hay cuotas a pagar en este mes.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activePurchases.map(p => {
            const currentInstallment = p.currentInstallment + monthOffset;
            
            return (
              <div key={p.id} className="glass-panel" style={{ padding: '1rem' }}>
                <div className="flex-between mb-1">
                  <span style={{ fontWeight: 600 }}>{p.description}</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(p.amountPerMonth)}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Cuota {currentInstallment} de {p.installments}
                </div>
                
                {/* Actions - Only allow edit/delete if we are viewing the current month to avoid complex time-travel edits */}
                {monthOffset === 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button onClick={() => onEditPurchase(card.id, p)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar esta compra?')) onDeletePurchase(card.id, p.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                      <Trash2 size={14} /> Borrar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreditCardDetail;
