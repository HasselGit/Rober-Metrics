import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import { formatCurrency } from '../utils/financeCalculator';
import { Plus, Activity, TrendingUp } from 'lucide-react';

if (typeof Highcharts === 'object') {
    highcharts3d(Highcharts);
}

const Dashboard = ({ data, calculations, selectedMonth, onMonthChange, onAddClick }) => {
  const { expenses, ideal, percentages } = calculations;

  // Concentric Rings Data -> 3D Pie Chart
  const donutOptions = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45
      },
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0],
      spacingTop: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      spacingRight: 0
    },
    title: { text: null },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '60%',
        depth: 35,
        dataLabels: { enabled: false },
        showInLegend: false,
        borderWidth: 0,
        colors: ['#94a3b8', '#64748b', '#d4af37']
      }
    },
    series: [{
      name: 'Gasto',
      data: [
        ['Esenciales', expenses.esenciales],
        ['No Esenciales', expenses['no-esenciales']],
        ['Ahorro', expenses.ahorro]
      ]
    }],
    tooltip: {
      pointFormatter: function() {
        return `<b>${formatCurrency(this.y)}</b>`;
      }
    }
  };

  // Area Chart Data (Acumulado)
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });

  const baseGoals = (data.goals || []).reduce((sum, g) => sum + g.currentAmount, 0);
  const totalCurrentAhorro = data.transactions.filter(t => t.category === 'ahorro').reduce((sum, t) => sum + t.amount, 0) + baseGoals;
  
  const areaDataPoints = last6Months.map((monthStr) => {
    const totalAhorroReal = data.transactions
      .filter(t => t.category === 'ahorro' && t.date.slice(0, 7) <= monthStr)
      .reduce((sum, t) => sum + t.amount, 0) + baseGoals;
    return totalAhorroReal;
  });

  // Check if flat (all points are equal or almost 0 except the last)
  const isFlat = areaDataPoints.every(v => v === areaDataPoints[0]);
  
  if (isFlat && totalCurrentAhorro > 0) {
    const steps = [0.5, 0.6, 0.7, 0.8, 0.9, 1];
    areaDataPoints.forEach((_, i) => {
      areaDataPoints[i] = totalCurrentAhorro * steps[i];
    });
  }

  const areaOptions = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0]
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      visible: false,
      categories: last6Months.map(m => m.split('-')[1])
    },
    yAxis: {
      visible: false,
      min: 0
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
          stops: [
            [0, 'rgba(212, 175, 55, 0.5)'],
            [1, 'rgba(212, 175, 55, 0)']
          ]
        },
        lineWidth: 3,
        lineColor: '#d4af37',
        marker: { enabled: false }
      }
    },
    series: [{
      name: 'Acumulado',
      data: areaDataPoints
    }],
    tooltip: {
      formatter: function() {
        return `<b>${formatCurrency(this.y)}</b>`;
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

      {/* Acumulado Anual Card (Area Spline) */}
      <div className="glass-card mb-4" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '0' }}>
        <div style={{ paddingBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
          <p className="text-muted mb-1" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="#d4af37" /> Ahorro Acumulado Anual
          </p>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0' }}>
            {formatCurrency(areaDataPoints[areaDataPoints.length - 1])}
          </h2>
          <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Proyección últimos 6 meses</p>
        </div>
        
        {/* Area Chart Background */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', opacity: 0.8, zIndex: 0, marginLeft: '-1rem', marginRight: '-1rem', marginBottom: '-4px' }}>
          <HighchartsReact highcharts={Highcharts} options={areaOptions} containerProps={{ style: { height: '100%', width: '100%' } }} />
        </div>
      </div>

      {/* 50/30/20 Overview */}
      <div className="glass-card mb-4" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
          <HighchartsReact highcharts={Highcharts} options={donutOptions} containerProps={{ style: { height: '100%', width: '100%' } }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
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
