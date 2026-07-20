import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { formatCurrency } from '../utils/financeCalculator';
import { Plus, CreditCard, Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = ({ data, calculations, selectedMonth, onMonthChange, onAddClick }) => {
  const { expenses, ideal, percentages } = calculations;

  const donutData = {
    labels: ['Esenciales', 'No Esenciales', 'Ahorro'],
    datasets: [
      {
        data: [expenses.esenciales, expenses['no-esenciales'], expenses.ahorro],
        backgroundColor: [
          '#94a3b8', // Platinum for Esenciales
          '#64748b', // Slate 500 for No Esenciales
          '#d4af37'  // Gold for Ahorro
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        cutout: '75%',
      },
    ],
  };

  const donutOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatCurrency(context.raw)
        }
      }
    }
  };

  const currentBalance = data.income - expenses.esenciales - expenses['no-esenciales'] - expenses.ahorro;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <header className="flex-between mb-4 sticky-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Balance de</h2>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--primary)',
                fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600, outline: 'none', cursor: 'pointer'
              }}
            />
          </div>
          <h1 style={{ fontSize: '2.5rem' }}>{formatCurrency(currentBalance)}</h1>
        </div>
        <button className="fab" onClick={onAddClick} aria-label="Agregar">
          <Plus size={24} />
        </button>
      </header>

      {/* Acumulado Anual Card */}
      <div className="glass-card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
        <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>Ahorro Acumulado Anual (Proyectado)</p>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
          {formatCurrency(data.transactions.filter(t => t.category === 'ahorro').reduce((sum, t) => sum + t.amount, 0) + (data.goals || []).reduce((sum, g) => sum + g.currentAmount, 0))}
        </h2>
        <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Suma de transferencias a ahorro y aportes a metas.</p>
      </div>

      {/* 50/30/20 Overview */}
      <div className="glass-card mb-4" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
          <Doughnut data={donutData} options={donutOptions} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <Activity size={24} color="#bacbb8" />
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 className="mb-2">Distribución 50/30/20</h3>
          
          <div className="mb-2">
            <div className="flex-between mb-1">
              <span style={{ fontSize: '0.875rem' }}>Esenciales (50%)</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{percentages.esenciales.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px' }}>
              <div style={{ width: `${Math.min(percentages.esenciales, 100)}%`, backgroundColor: percentages.esenciales > 50 ? '#ef4444' : '#94a3b8', height: '100%', borderRadius: '4px' }} />
            </div>
            <div className="flex-between mt-1 text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              <span>Gastado: {formatCurrency(expenses.esenciales)}</span>
              <span>Límite: {formatCurrency(ideal.esenciales)}</span>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex-between mb-1">
              <span style={{ fontSize: '0.875rem' }}>No Esenciales (30%)</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{percentages['no-esenciales'].toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px' }}>
              <div style={{ width: `${Math.min(percentages['no-esenciales'], 100)}%`, backgroundColor: percentages['no-esenciales'] > 30 ? '#ef4444' : '#64748b', height: '100%', borderRadius: '4px' }} />
            </div>
            <div className="flex-between mt-1 text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              <span>Gastado: {formatCurrency(expenses['no-esenciales'])}</span>
              <span>Límite: {formatCurrency(ideal['no-esenciales'])}</span>
            </div>
          </div>

          <div>
            <div className="flex-between mb-1">
              <span style={{ fontSize: '0.875rem' }}>Ahorro (20%)</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: percentages.ahorro >= 20 ? '#d4af37' : '' }}>{percentages.ahorro.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px' }}>
              <div style={{ width: `${Math.min(percentages.ahorro, 100)}%`, backgroundColor: '#d4af37', height: '100%', borderRadius: '4px' }} />
            </div>
            <div className="flex-between mt-1 text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              <span>Invertido: {formatCurrency(expenses.ahorro)}</span>
              <span>Meta: {formatCurrency(ideal.ahorro)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights / Predictions */}
      {calculations.insights && calculations.insights.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2" style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>Inteligencia Financiera</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {calculations.insights.map((insight, idx) => {
              let color = 'var(--primary)';
              if (insight.type === 'warning') color = '#fbbf24'; // amber
              if (insight.type === 'danger') color = 'var(--error)';
              
              return (
                <div key={idx} className="glass-panel" style={{ borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Activity size={20} color={color} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>{insight.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
