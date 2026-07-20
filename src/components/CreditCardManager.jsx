import React from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { CreditCard, Edit2, Trash2, Plus } from 'lucide-react';
import { formatCurrency, calculateCreditCardAmortization } from '../utils/financeCalculator';

const CreditCardManager = ({ creditCards, onAdd, onEdit, onDelete, onViewDetails }) => {
  const projection = calculateCreditCardAmortization(creditCards);

  const barOptions = {
    chart: {
      type: 'column',
      options3d: {
        enabled: true,
        alpha: 15,
        beta: 15,
        depth: 50,
        viewDistance: 25
      },
      backgroundColor: 'transparent',
      margin: [10, 0, 30, 0]
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6', 'Mes 7', 'Mes 8', 'Mes 9', 'Mes 10', 'Mes 11', 'Mes 12'],
      labels: { style: { color: '#bacbb8', fontFamily: 'Inter', fontSize: '10px' } },
      lineColor: 'transparent',
      gridLineColor: 'transparent',
      tickWidth: 0
    },
    yAxis: {
      visible: false,
      min: 0
    },
    plotOptions: {
      column: {
        depth: 25,
        color: '#ff4757',
        borderWidth: 0
      }
    },
    series: [{
      name: 'Deuda a pagar',
      data: projection
    }],
    tooltip: {
      formatter: function() {
        return `<b>${formatCurrency(this.y)}</b>`;
      }
    }
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

          return (
            <div key={cc.id} className="glass-panel" style={{ width: '100%', flex: '0 0 auto', borderLeft: `4px solid ${cc.color}`, cursor: 'pointer' }} onClick={() => onViewDetails && onViewDetails(cc.id)}>
              <div className="flex-between mb-2">
                <span style={{ fontWeight: 600 }}>{cc.name}</span>
              </div>
              <div className="mb-2">
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Deuda Total (Cuotas)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(debt)}</p>
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
