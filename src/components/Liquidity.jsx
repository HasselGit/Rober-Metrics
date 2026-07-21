import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { formatCurrency, calculateCreditCardAmortization, getSubscriptionAmountForMonth } from '../utils/financeCalculator';
import { TrendingDown, TrendingUp, Wallet, Calendar } from 'lucide-react';

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/**
 * Calcula el saldo libre proyectado para los próximos N meses.
 * Lógica:
 *   Ingresos (fijos del usuario)
 *   - Suscripciones fijas
 *   - Cuotas de tarjeta programadas ese mes
 *   - Promedio de gastos variables de los últimos 3 meses
 */
const calcProjection = (data, months = 3) => {
  const income = data.income || 0;

  // Promedio mensual de gastos variables (últimos 3 meses reales)
  const today = new Date();
  const last3Months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 1 - i, 1);
    return d.toISOString().slice(0, 7);
  });

  const variableAvg = (() => {
    const totals = last3Months.map(m =>
      (data.transactions || [])
        .filter(t => t.date.startsWith(m) && (t.type === 'expense' || t.type === 'transfer'))
        .reduce((s, t) => s + t.amount, 0)
    );
    const nonZero = totals.filter(v => v > 0);
    return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  })();

  // Cuotas de tarjeta mes a mes
  const ccProjection = calculateCreditCardAmortization(data.creditCards || []);

  return Array.from({ length: months }, (_, i) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
    const monthLabel = `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
    const targetMonthStr = monthDate.toISOString().slice(0, 7);
    
    // Calculate subscription total active for this future month
    const subscriptionsTotal = (data.subscriptions || []).reduce((sum, sub) => {
      return sum + getSubscriptionAmountForMonth(sub, targetMonthStr);
    }, 0);

    const ccCost = ccProjection[i] || 0;
    const totalExpenses = subscriptionsTotal + ccCost + variableAvg;
    const freeCash = income - totalExpenses;
    return { monthLabel, income, subscriptionsTotal, ccCost, variableAvg, totalExpenses, freeCash };
  });
};

const Liquidity = ({ data, calculations }) => {
  const { expenses } = calculations;
  const income = data.income || 0;

  // Totales del mes actual
  const totalExpenses = (expenses.esenciales || 0) + (expenses['no-esenciales'] || 0) + (expenses.ahorro || 0);
  const freeCash = income - totalExpenses;
  const freePct = income > 0 ? (freeCash / income) * 100 : 0;

  // Proyección 3 meses
  const projection = useMemo(() => calcProjection(data, 3), [data]);

  // Gráfico de barras 3D para proyección
  const chartOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      margin: [20, 20, 50, 20],
      options3d: { enabled: true, alpha: 8, beta: 10, depth: 50, viewDistance: 20 },
      animation: { duration: 800 }
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: projection.map(p => p.monthLabel),
      labels: { style: { color: 'rgba(208,218,240,0.6)', fontSize: '11px', fontFamily: 'Inter' } },
      lineColor: 'rgba(0,194,212,0.12)',
      tickColor: 'transparent',
      gridLineColor: 'transparent'
    },
    yAxis: {
      visible: true,
      gridLineColor: 'rgba(255,255,255,0.04)',
      labels: {
        formatter: function() { return '$' + (this.value / 1000).toFixed(0) + 'k'; },
        style: { color: 'rgba(208,218,240,0.4)', fontSize: '10px' }
      },
      title: { text: null }
    },
    plotOptions: {
      column: {
        depth: 30,
        borderRadius: 6,
        borderWidth: 0,
        colorByPoint: false,
        groupPadding: 0.1,
        animation: { duration: 800 }
      }
    },
    series: [
      {
        name: 'Ingresos',
        data: projection.map(p => ({ y: p.income, color: 'rgba(0,194,212,0.75)' })),
        color: '#00c2d4'
      },
      {
        name: 'Gastos Proyectados',
        data: projection.map(p => ({ y: p.totalExpenses, color: 'rgba(99,102,241,0.75)' })),
        color: '#6366f1'
      },
      {
        name: 'Saldo Libre',
        data: projection.map(p => ({
          y: Math.max(p.freeCash, 0),
          color: p.freeCash >= 0 ? 'rgba(212,175,55,0.85)' : 'rgba(244,63,94,0.85)'
        })),
        color: '#d4af37'
      }
    ],
    tooltip: {
      backgroundColor: 'rgba(8,13,26,0.95)',
      borderColor: 'rgba(0,194,212,0.3)',
      borderWidth: 1,
      borderRadius: 12,
      shadow: false,
      style: { color: '#e8f0fe', fontFamily: 'Inter' },
      shared: true,
      formatter: function() {
        const pts = this.points;
        const month = this.x;
        const proj = projection.find(p => p.monthLabel === month);
        if (!proj) return '';
        return `
          <b style="color:#00c2d4">${month}</b><br/>
          <span style="color:#00c2d4">● Ingresos:</span> <b>${formatCurrency(proj.income)}</b><br/>
          <span style="color:#6366f1">● Gastos:</span> <b>${formatCurrency(proj.totalExpenses)}</b><br/>
          <span style="color:rgba(208,218,240,0.5)"> ├ Suscripciones: ${formatCurrency(proj.subscriptionsTotal)}</span><br/>
          <span style="color:rgba(208,218,240,0.5)"> ├ Tarjetas: ${formatCurrency(proj.ccCost)}</span><br/>
          <span style="color:rgba(208,218,240,0.5)"> └ Variable (prom.): ${formatCurrency(proj.variableAvg)}</span><br/>
          <span style="color:#d4af37">● Saldo Libre:</span> <b style="color:${proj.freeCash >= 0 ? '#d4af37' : '#f43f5e'}">${formatCurrency(proj.freeCash)}</b>
        `;
      }
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>

      {/* ── Título ─────────────────────────────────────────────── */}
      <header className="sticky-header mb-4">
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wallet size={22} color="var(--primary)" />
          Liquidez
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
          Mes actual + proyección próximos 3 meses
        </p>
      </header>

      {/* ── 3 tarjetas resumen ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {/* Ingresos */}
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <TrendingUp size={18} color="#00c2d4" style={{ marginBottom: '0.4rem' }} />
          <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Ingresos
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#00c2d4', lineHeight: 1.2 }}>
            {formatCurrency(income)}
          </p>
        </div>

        {/* Gastos */}
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <TrendingDown size={18} color="#6366f1" style={{ marginBottom: '0.4rem' }} />
          <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Gastos
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1', lineHeight: 1.2 }}>
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        {/* Saldo libre */}
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', border: `1px solid ${freeCash >= 0 ? 'rgba(212,175,55,0.3)' : 'rgba(244,63,94,0.3)'}` }}>
          <Wallet size={18} color={freeCash >= 0 ? '#d4af37' : '#f43f5e'} style={{ marginBottom: '0.4rem' }} />
          <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Saldo Libre
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: freeCash >= 0 ? '#d4af37' : '#f43f5e', lineHeight: 1.2 }}>
            {formatCurrency(freeCash)}
          </p>
        </div>
      </div>

      {/* ── Barra de disponibilidad ─────────────────────────────── */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div className="flex-between mb-1">
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Disponibilidad del ingreso</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: freePct >= 0 ? '#d4af37' : '#f43f5e' }}>
            {freePct.toFixed(1)}% libre
          </span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '5px', overflow: 'hidden' }}>
          {/* Barra de gastos */}
          <div style={{
            width: `${Math.min((totalExpenses / income) * 100, 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)',
            borderRadius: '5px',
            transition: 'width 0.6s ease'
          }} />
        </div>
        <div className="flex-between" style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
          <span>Gastado: {formatCurrency(totalExpenses)}</span>
          <span>Disponible: {formatCurrency(Math.max(freeCash, 0))}</span>
        </div>
      </div>

      {/* ── Desglose actual ─────────────────────────────────────── */}
      <div className="glass-card mb-4">
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
          Desglose este mes
        </p>
        {[
          { label: 'Esenciales', value: expenses.esenciales, color: '#0ea5e9' },
          { label: 'No Esenciales', value: expenses['no-esenciales'], color: '#6366f1' },
          { label: 'Ahorro / Inversión', value: expenses.ahorro, color: '#d4af37' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-between" style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--on-surface)' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color }}>{formatCurrency(value || 0)}</span>
          </div>
        ))}
      </div>

      {/* ── Proyección 3 meses ──────────────────────────────────── */}
      <div className="glass-card mb-4">
        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
            <Calendar size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
            Proyección próximos 3 meses
          </p>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
          Basada en suscripciones fijas, cuotas de tarjetas y promedio de gastos variables
        </p>

        <div style={{ height: '200px' }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { height: '100%', width: '100%' } }}
          />
        </div>

        {/* Leyenda del gráfico */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem' }}>
          {[
            { label: 'Ingresos', color: '#00c2d4' },
            { label: 'Gastos', color: '#6366f1' },
            { label: 'Saldo Libre', color: '#d4af37' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Resumen texto por mes */}
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {projection.map((p, i) => (
            <div key={i} className="glass-panel" style={{
              padding: '0.75rem 1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: `1px solid ${p.freeCash >= 0 ? 'rgba(0,194,212,0.1)' : 'rgba(244,63,94,0.2)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="var(--on-surface-variant)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.monthLabel}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                  Gastos: {formatCurrency(p.totalExpenses)}
                </p>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: p.freeCash >= 0 ? '#d4af37' : '#f43f5e', margin: 0 }}>
                  Libre: {formatCurrency(p.freeCash)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Liquidity;
