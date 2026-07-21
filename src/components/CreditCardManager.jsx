import React from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { CreditCard, Edit2, Trash2, Plus } from 'lucide-react';
import { formatCurrency, calculateCreditCardAmortization, getMonthsDifference, getSubscriptionAmountForMonth } from '../utils/financeCalculator';

const CreditCardManager = ({ creditCards, onAdd, onEdit, onDelete, onViewDetails, selectedMonth, subscriptions = [] }) => {
  const projection = calculateCreditCardAmortization(creditCards, selectedMonth);


  const barOptions = {
    chart: {
      type: 'column',
      options3d: {
        enabled: true,
        alpha: 12,
        beta: 12,
        depth: 50,
        viewDistance: 25
      },
      backgroundColor: 'transparent',
      margin: [20, 20, 45, 55]
    },

    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6', 'Mes 7', 'Mes 8', 'Mes 9', 'Mes 10', 'Mes 11', 'Mes 12'],
      labels: { style: { color: 'rgba(208,218,240,0.5)', fontFamily: 'Inter', fontSize: '10px' } },
      gridLineColor: 'rgba(255,255,255,0.03)'
    },
    yAxis: {
      title: { text: null },
      labels: { style: { color: 'rgba(208,218,240,0.5)', fontFamily: 'Inter', fontSize: '10px' } },
      gridLineColor: 'rgba(255,255,255,0.05)'
    },
    tooltip: {
      useHTML: true,
      backgroundColor: 'rgba(15, 24, 41, 0.95)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: 10,
      shadow: true,
      style: { color: '#ffffff', fontFamily: 'Inter', fontSize: '12px' },
      formatter: function() {
        return `<b>${this.x}</b><br/>Deuda proyectada: <span style="color:#ff4757; font-weight:bold">${formatCurrency(this.y)}</span>`;
      }
    },
    plotOptions: {
      column: {
        depth: 25,
        borderWidth: 0,
        borderRadius: 4,
        color: '#ff4757'
      }
    },
    series: [{
      name: 'Cuotas de Tarjeta',
      data: projection
    }]
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex-between mb-4 sticky-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0' }}>
          <CreditCard size={20} color="#70a1ff" /> Mis Tarjetas
        </h2>
      </header>
      
      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        {creditCards.map(cc => {
          // Calculate debt
          const debt = cc.purchases.reduce((acc, p) => acc + (p.amountPerMonth * p.remainingMonths), 0);
          const available = cc.limit - debt;
          const percentage = (debt / cc.limit) * 100;

          // Calculate monthly payment for selectedMonth (purchases + active linked subscriptions)
          const activePurchases = cc.purchases.filter(p => {
            const purchaseStartMonth = p.startMonth || '2026-07';
            const diff = getMonthsDifference(selectedMonth, purchaseStartMonth);
            return diff >= 0 && diff < p.installments;
          });
          const activeLinkedSubs = (subscriptions || [])
            .filter(s => s.paymentMethod === 'credit_card' && s.cardId === cc.id)
            .map(s => ({ ...s, amount: getSubscriptionAmountForMonth(s, selectedMonth) }))
            .filter(s => s.amount > 0);
            
          const billingThisMonth = activePurchases.reduce((acc, p) => acc + p.amountPerMonth, 0) +
                                   activeLinkedSubs.reduce((acc, s) => acc + s.amount, 0);

          return (
            <div key={cc.id} className="glass-panel" style={{ width: '100%', flex: '0 0 auto', borderLeft: `4px solid ${cc.color}`, cursor: 'pointer' }} onClick={() => onViewDetails && onViewDetails(cc.id)}>
              <div className="flex-between mb-2">
                <span style={{ fontWeight: 600 }}>{cc.name}</span>
              </div>
              
              <div className="flex-between mb-3" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '0.5rem', padding: '0.6rem 0.85rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.7rem', margin: '0 0 2px' }}>A pagar este mes</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ff4757', margin: 0 }}>{formatCurrency(billingThisMonth)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-muted" style={{ fontSize: '0.7rem', margin: '0 0 2px' }}>Deuda Total (Cuotas)</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--on-surface)' }}>{formatCurrency(debt)}</p>
                </div>
              </div>

              <div>
                <div className="flex-between mb-1" style={{ fontSize: '0.75rem' }}>
                  <span>Disponible</span>
                  <span>{formatCurrency(available)}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px' }}>
                  <div style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: cc.color, height: '100%', borderRadius: '2px' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(cc); }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={(e) => { e.stopPropagation(); if(window.confirm('¿Seguro que quieres borrar esta tarjeta? Esto borrará también las cuotas pendientes que tiene asociadas.')) onDelete(cc.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                  <Trash2 size={14} /> Borrar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projection Chart */}
      <div className="glass-card mt-2">
        <h4 className="mb-3" style={{ fontSize: '1rem' }}>Proyección de Cuotas (12 Meses)</h4>
        <div style={{ height: '200px' }}>
          <HighchartsReact highcharts={Highcharts} options={barOptions} containerProps={{ style: { height: '100%', width: '100%' } }} />
        </div>
      </div>
    </div>
  );
};

export default CreditCardManager;
