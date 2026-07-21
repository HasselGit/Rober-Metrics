import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, Edit2, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency, getMonthsDifference, getSubscriptionAmountForMonth } from '../utils/financeCalculator';

const CreditCardDetail = ({ card, onBack, onEditPurchase, onDeletePurchase, onAddPurchase, selectedMonth, subscriptions = [] }) => {
  const [monthOffset, setMonthOffset] = useState(0);

  const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Calculate target month string (selectedMonth + offset)
  const [startYear, startMonth] = selectedMonth.split('-').map(Number);
  const targetDate = new Date(startYear, startMonth - 1 + monthOffset, 1);
  const targetMonthStr = targetDate.toISOString().slice(0, 7); // YYYY-MM
  const monthName = targetDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Calculate purchases that fall into this month
  const activePurchases = card.purchases.filter(p => {
    const purchaseStartMonth = p.startMonth || '2026-07';
    const diff = getMonthsDifference(targetMonthStr, purchaseStartMonth);
    return diff >= 0 && diff < p.installments;
  });

  // Calculate active linked subscriptions for this card in targetMonthStr
  const activeLinkedSubscriptions = subscriptions
    .filter(s => s.paymentMethod === 'credit_card' && s.cardId === card.id)
    .map(s => {
      const amt = getSubscriptionAmountForMonth(s, targetMonthStr);
      return { ...s, amount: amt };
    })
    .filter(s => s.amount > 0);

  const totalThisMonth = activePurchases.reduce((acc, p) => acc + p.amountPerMonth, 0) +
                         activeLinkedSubscriptions.reduce((acc, s) => acc + s.amount, 0);

  const totalDebt = card.purchases.reduce((acc, p) => {
    const purchaseStartMonth = p.startMonth || '2026-07';
    const diff = getMonthsDifference(selectedMonth, purchaseStartMonth);
    const installmentsPaid = Math.max(0, diff);
    const remaining = Math.max(0, p.installments - installmentsPaid);
    return acc + (p.amountPerMonth * remaining);
  }, 0);


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
        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Deuda Total Acumulada (Cuotas): {formatCurrency(totalDebt)}</p>
      </div>

      <div className="flex-between mb-3">
        <h3 style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', margin: 0 }}>Detalle de Consumos</h3>
        {monthOffset === 0 && (
          <button 
            onClick={() => onAddPurchase(card.id)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto' }}
          >
            <Plus size={14} /> Agregar Consumo
          </button>
        )}
      </div>
      
      {activePurchases.length === 0 && activeLinkedSubscriptions.length === 0 ? (
        <div className="glass-panel text-center text-muted" style={{ padding: '2rem' }}>
          No hay consumos o cuotas a pagar en este mes.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Subscripciones vinculadas */}
          {activeLinkedSubscriptions.map(s => (
            <div key={s.id} className="glass-panel" style={{ padding: '1rem', borderLeft: `3px solid var(--primary)` }}>
              <div className="flex-between mb-1">
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(s.amount)}</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.81rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={13} color="var(--primary)" /> Gasto Fijo Recurrente
              </div>
            </div>
          ))}

          {/* Cuotas de compras regulares */}
          {activePurchases.map(p => {
            const purchaseStartMonth = p.startMonth || '2026-07';
            const diff = getMonthsDifference(targetMonthStr, purchaseStartMonth);
            const currentInstallment = diff + 1;
            
            return (
              <div key={p.id} className="glass-panel" style={{ padding: '1rem' }}>
                <div className="flex-between mb-1">
                  <span style={{ fontWeight: 600 }}>{p.description}</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(p.amountPerMonth)}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Cuota {currentInstallment} de {p.installments}
                </div>
                
                {/* Actions */}
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
