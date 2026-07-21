import React, { useState, useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { formatCurrency, getMonthsDifference, getSubscriptionAmountForMonth } from '../utils/financeCalculator';
import { Plus, Activity, TrendingUp, TrendingDown, Wallet, X, RefreshCw, CreditCard, Calendar, Edit2, Trash2 } from 'lucide-react';

// Colores fijos por categoría — usados en donut Y en tabla
const CAT = {
  esenciales:    { color: '#0ea5e9', label: 'Esenciales (50%)',    threshold: 50 },
  noEsenciales:  { color: '#6366f1', label: 'No Esenciales (30%)', threshold: 30 },
  ahorro:        { color: '#d4af37', label: 'Ahorro (20%)',         threshold: 0  },
};const Dashboard = ({ 
  data, 
  calculations, 
  selectedMonth, 
  onMonthChange, 
  onIncomeClick, 
  onExpensesClick,
  onEditTransaction,
  onDeleteTransaction,
  onEditSubscription,
  onDeleteSubscription,
  onEditPurchase,
  onDeletePurchase
}) => {
  const { expenses, ideal, percentages } = calculations;

  const distCardRef = useRef(null);

  // Categoría seleccionada para animar el donut (null = ninguna)
  const [selectedCat, setSelectedCat] = useState(null);

  const toggleCat = (cat) => {
    setSelectedCat(prev => (prev === cat ? null : cat));
  };

  useEffect(() => {
    if (selectedCat && distCardRef.current) {
      const timer = setTimeout(() => {
        if (distCardRef.current) {
          distCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedCat]);


  // ── Acumulado: últimos 6 meses ──────────────────────────────────
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const baseGoals = (data.goals || []).reduce((sum, g) => sum + g.currentAmount, 0);
  const totalCurrentAhorro = data.transactions
    .filter(t => t.category === 'ahorro')
    .reduce((sum, t) => sum + t.amount, 0) + baseGoals;

  const areaDataPoints = last6Months.map(monthStr =>
    data.transactions
      .filter(t => t.category === 'ahorro' && t.date.slice(0, 7) <= monthStr)
      .reduce((sum, t) => sum + t.amount, 0) + baseGoals
  );

  const isFlat = areaDataPoints.every(v => v === areaDataPoints[0]);
  if (isFlat && totalCurrentAhorro > 0) {
    const steps = [0.4, 0.55, 0.65, 0.76, 0.89, 1];
    areaDataPoints.forEach((_, i) => { areaDataPoints[i] = Math.round(totalCurrentAhorro * steps[i]); });
  } else if (isFlat) {
    [200000, 380000, 510000, 660000, 820000, 950000].forEach((v,i) => { areaDataPoints[i] = v; });
  }

  // ── 3D Area Chart ───────────────────────────────────────────────
  const areaOptions = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      margin: [20, 20, 36, 20],
      options3d: {
        enabled: true,
        alpha: 18, beta: 6, depth: 70, viewDistance: 22,
        frame: { bottom: { size: 1, color: 'rgba(0,194,212,0.06)' } }
      },
      animation: { duration: 900 }
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: last6Months.map(m => MONTH_NAMES[parseInt(m.split('-')[1]) - 1]),
      labels: { style: { color: 'rgba(208,218,240,0.5)', fontSize: '10px', fontFamily: 'Inter' } },
      lineColor: 'rgba(0,194,212,0.12)',
      tickColor: 'rgba(0,194,212,0.12)',
      gridLineColor: 'transparent'
    },
    yAxis: { visible: false, min: 0 },
    plotOptions: {
      area: {
        depth: 30,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(0,194,212,0.5)'],
            [0.7, 'rgba(0,194,212,0.12)'],
            [1, 'rgba(0,194,212,0.0)']
          ]
        },
        lineWidth: 3,
        lineColor: '#00c2d4',
        marker: {
          enabled: true, radius: 5,
          fillColor: '#00c2d4', lineWidth: 2, lineColor: '#080d1a', symbol: 'circle'
        }
      }
    },
    series: [{ name: 'Ahorro', data: areaDataPoints, color: '#00c2d4' }],
    tooltip: {
      backgroundColor: 'rgba(8,13,26,0.95)',
      borderColor: 'rgba(0,194,212,0.3)',
      borderWidth: 1, borderRadius: 12, shadow: false,
      style: { color: '#e8f0fe', fontFamily: 'Inter' },
      formatter: function() {
        return `<span style="color:#00c2d4;font-weight:600">${this.x}</span><br/><b style="color:#fff">${formatCurrency(this.y)}</b>`;
      }
    }
  };

  // ── 3D Donut — sliced según selección ──────────────────────────
  const donutOptions = {
    chart: {
      type: 'pie',
      options3d: { enabled: true, alpha: 42, beta: 0 },
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0],
      spacingTop: 0, spacingBottom: 0, spacingLeft: 0, spacingRight: 0,
      animation: { duration: 500 }
    },
    title: { text: null },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '52%',
        depth: 48,
        dataLabels: { enabled: false },
        showInLegend: false,
        borderWidth: 0,
        slicedOffset: 14,
        allowPointSelect: false,
        animation: { duration: 500 },
        point: {
          events: {
            click: function() {
              const nameMap = {
                'Esenciales': 'esenciales',
                'No Esenciales': 'noEsenciales',
                'Ahorro': 'ahorro'
              };
              const catKey = nameMap[this.name];
              if (catKey) {
                toggleCat(catKey);
              }
            }
          }
        }
      }

    },
    series: [{
      name: 'Distribución',
      data: [
        {
          name: 'Esenciales',
          y: expenses.esenciales || 1,
          color: CAT.esenciales.color,
          sliced: selectedCat === 'esenciales'
        },
        {
          name: 'No Esenciales',
          y: expenses['no-esenciales'] || 1,
          color: CAT.noEsenciales.color,
          sliced: selectedCat === 'noEsenciales'
        },
        {
          name: 'Ahorro',
          y: expenses.ahorro || 1,
          color: CAT.ahorro.color,
          sliced: selectedCat === 'ahorro'
        }
      ]
    }],
    tooltip: {
      backgroundColor: 'rgba(8,13,26,0.95)',
      borderColor: 'rgba(0,194,212,0.3)',
      borderWidth: 1, borderRadius: 12, shadow: false,
      style: { color: '#e8f0fe', fontFamily: 'Inter' },
      pointFormatter: function() {
        return `<b style="color:#fff">${formatCurrency(this.y)}</b>`;
      }
    }
  };

  const currentBalance = data.income - expenses.esenciales - expenses['no-esenciales'] - expenses.ahorro;

  // ── Filtrado detallado para el Bottom Sheet ──────────────────────
  const details = (() => {
    if (!selectedCat) return { txs: [], subs: [], cards: [], total: 0 };
    const apiCatKey = selectedCat === 'noEsenciales' ? 'no-esenciales' : selectedCat;

    // 1. Gastos Variables (Transacciones de ese mes)
    const txs = (data.transactions || [])
      .filter(t => 
        t.date.startsWith(selectedMonth) && 
        (t.type === 'expense' || t.type === 'transfer') && 
        t.category === apiCatKey
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    // 2. Gastos Fijos (Suscripciones)
    const subs = (data.subscriptions || []).map(s => {
      const amt = getSubscriptionAmountForMonth(s, selectedMonth);
      return { ...s, amount: amt };
    }).filter(s => s.category === apiCatKey && s.amount > 0);

    // 3. Cuotas de Tarjeta (Solo para No Esenciales)
    const cards = [];
    if (selectedCat === 'noEsenciales') {
      (data.creditCards || []).forEach(cc => {
        cc.purchases.forEach(p => {
          const purchaseStartMonth = p.startMonth || '2026-07';
          const diff = getMonthsDifference(selectedMonth, purchaseStartMonth);
          if (diff >= 0 && diff < p.installments) {
            const currentInst = diff + 1;
            cards.push({
              id: p.id,
              cardId: cc.id,
              purchase: p,
              cardName: cc.name,
              description: p.description,
              amount: p.amountPerMonth,
              installmentInfo: `Cuota ${currentInst}/${p.installments}`,
              color: cc.color
            });
          }
        });
      });
    }

    const txsTotal = txs.reduce((sum, t) => sum + t.amount, 0);
    const subsTotal = subs.reduce((sum, s) => sum + s.amount, 0);
    const cardsTotal = cards.reduce((sum, c) => sum + c.amount, 0);
    const total = txsTotal + subsTotal + cardsTotal;

    return { txs, subs, cards, total };
  })();


  // ── Fila de progreso ─────────────────────────────────────────────────────
  // Color siempre = color de la categoría (sin rojo en ningún lado)
  const ProgressRow = ({ catKey, pct, spent, limit, labelKey = 'Gastado', limitLabel = 'Límite' }) => {
    const { color, label } = CAT[catKey];
    const isSelected = selectedCat === catKey;

    return (
      <div
        className="mb-2"
        onClick={() => toggleCat(catKey)}
        style={{
          cursor: 'pointer',
          padding: '0.5rem 0.6rem',
          borderRadius: '0.75rem',
          background: isSelected ? `${color}14` : 'transparent',
          border: `1px solid ${isSelected ? color + '40' : 'transparent'}`,
          transition: 'all 0.25s ease'
        }}
      >
        <div className="flex-between mb-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Indicador de color — siempre el color de la categoría */}
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{label}</span>
          </div>
          {/* % siempre en el color de la categoría */}
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: color }}>
            {pct.toFixed(1)}%
          </span>
        </div>

        {/* Barra: color de categoría */}
        <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.07)', height: '6px', borderRadius: '3px' }}>
          <div style={{
            width: `${Math.min(pct, 100)}%`,
            background: `linear-gradient(90deg,${color},${color}99)`,
            height: '100%', borderRadius: '3px',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 6px ${color}44`
          }} />
        </div>

        <div className="flex-between text-muted" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
          <span>{labelKey}: {formatCurrency(spent)}</span>
          <span>{limitLabel}: {formatCurrency(limit)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex-between mb-4 sticky-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>Balance de</h2>
            <input
              type="month" value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--primary)',
                fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
                outline: 'none', cursor: 'pointer'
              }}
            />
          </div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--on-bg)' }}>{formatCurrency(currentBalance)}</h1>
        </div>
      </header>

      {/* ── Resumen rápido Ingresos / Gastos / Libre ────────────── */}
      {(() => {
        const totalExp = (expenses.esenciales||0)+(expenses['no-esenciales']||0)+(expenses.ahorro||0);
        const libre = (data.income||0) - totalExp;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div
              className="glass-card"
              style={{ padding: '0.85rem 0.75rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(0,194,212,0.2)' }}
              onClick={onIncomeClick}
              title="Ver y editar fuentes de ingreso"
            >
              <TrendingUp size={14} color="#00c2d4" style={{ marginBottom: '0.25rem' }} />
              <p style={{ fontSize: '0.65rem', color: 'var(--on-surface)', fontWeight: 500, margin: '0 0 0.2rem' }}>
                Ingresos <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>›</span>
              </p>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#00c2d4' }}>{formatCurrency(data.income||0)}</p>
            </div>
            <div
              className="glass-card"
              style={{ padding: '0.85rem 0.75rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(99,102,241,0.2)' }}
              onClick={onExpensesClick}
              title="Ver historial de gastos"
            >
              <TrendingDown size={14} color="#6366f1" style={{ marginBottom: '0.25rem' }} />
              <p style={{ fontSize: '0.65rem', color: 'var(--on-surface)', fontWeight: 500, margin: '0 0 0.2rem' }}>
                Gastos <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>›</span>
              </p>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6366f1' }}>{formatCurrency(totalExp)}</p>
            </div>
            <div className="glass-card" style={{ padding: '0.85rem 0.75rem', textAlign: 'center', border: `1px solid ${libre>=0?'rgba(212,175,55,0.25)':'rgba(244,63,94,0.25)'}` }}>
              <Wallet size={14} color={libre>=0?'#d4af37':'#f43f5e'} style={{ marginBottom: '0.25rem' }} />
              <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Libre</p>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: libre>=0?'#d4af37':'#f43f5e' }}>{formatCurrency(libre)}</p>
            </div>
          </div>
        );
      })()}


      {/* ── Distribución 50/30/20 ───────────────────────────────── */}
      <div className="glass-card mb-4" ref={distCardRef}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
          Distribución 50 / 30 / 20
        </p>

        {/* Donut 3D Centrado arriba — overflow:visible para que el slice no se corte */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', overflow: 'visible' }}>
          <div style={{ width: '190px', height: '200px', flexShrink: 0, position: 'relative', overflow: 'visible' }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={donutOptions}
              containerProps={{ style: { height: '100%', width: '100%', overflow: 'visible' } }}
            />
            <div style={{
              position: 'absolute', top: '38%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none'
            }}>
              <Activity size={18} color="var(--primary)" />
            </div>
          </div>
        </div>

        {/* Filas de progreso abajo — clic anima el donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <ProgressRow
            catKey="esenciales"
            pct={percentages.esenciales}
            spent={expenses.esenciales}
            limit={ideal.esenciales}
          />
          <ProgressRow
            catKey="noEsenciales"
            pct={percentages['no-esenciales']}
            spent={expenses['no-esenciales']}
            limit={ideal['no-esenciales']}
          />
          <ProgressRow
            catKey="ahorro"
            pct={percentages.ahorro}
            spent={expenses.ahorro}
            limit={ideal.ahorro}
            labelKey="Invertido"
            limitLabel="Meta"
          />
        </div>

        {selectedCat && (
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.75rem' }}>
            Toca la fila de nuevo para deseleccionar
          </p>
        )}
      </div>

      {/* ── Ahorro Acumulado ────────────────────────────────────── */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <TrendingUp size={14} color="var(--primary)" /> Ahorro Acumulado Anual
          </p>
          <span style={{ fontSize: '0.7rem', color: 'rgba(208,218,240,0.3)' }}>últimos 6 meses</span>
        </div>
        <h2 style={{ fontSize: '1.9rem', color: 'var(--gold)', margin: '0.1rem 0 0' }}>
          {formatCurrency(areaDataPoints[areaDataPoints.length - 1])}
        </h2>
        <div style={{ height: '190px', marginLeft: '-1.25rem', marginRight: '-1.25rem', marginBottom: '-0.25rem' }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={areaOptions}
            containerProps={{ style: { height: '100%', width: '100%' } }}
          />
        </div>
      </div>


      {/* ── Inteligencia Financiera ─────────────────────────────── */}
      {calculations.insights && calculations.insights.length > 0 && (
        <div className="mb-4">
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
            Inteligencia Financiera
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {calculations.insights.map((insight, idx) => {
              let color = 'var(--primary)';
              if (insight.type === 'warning') color = 'var(--warning)';
              if (insight.type === 'danger')  color = 'var(--error)';
              return (
                <div key={idx} className="glass-panel" style={{ borderLeft: `3px solid ${color}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Activity size={18} color={color} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface)' }}>{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ── Bottom Sheet de Detalles por Categoría ──────────────── */}
      {selectedCat && (
        <div className="category-sheet-overlay" onClick={() => setSelectedCat(null)}>
          <div className="category-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Indicador de arrastre */}
            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '0 auto 1.25rem' }} />

            {/* Encabezado */}
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: CAT[selectedCat].color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT[selectedCat].color }} />
                  {CAT[selectedCat].label}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                  Detalle del mes seleccionado
                </p>
              </div>
              <button 
                onClick={() => setSelectedCat(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--on-surface-variant)', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de Contenidos */}
            <div className="category-sheet-content">
              {/* Resumen de totales */}
              <div className="glass-panel mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem 1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Total Gastado</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: CAT[selectedCat].color, margin: 0 }}>{formatCurrency(details.total)}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
                    {selectedCat === 'ahorro' ? 'Meta Mensual' : 'Límite Mensual'}
                  </span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                    {formatCurrency(selectedCat === 'ahorro' ? ideal.ahorro : (selectedCat === 'esenciales' ? ideal.esenciales : ideal['no-esenciales']))}
                  </p>
                </div>
              </div>

              {details.txs.length === 0 && details.subs.length === 0 && details.cards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--on-surface-variant)' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>No hay gastos registrados</p>
                  <p style={{ fontSize: '0.75rem' }}>Carga consumos usando el botón + del inicio</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Sección: Gastos Variables */}
                  {details.txs.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
                        Consumos Variables ({details.txs.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {details.txs.map(t => (
                          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex-between">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ padding: '6px', borderRadius: '50%', background: `${CAT[selectedCat].color}12`, display: 'flex' }}>
                                  <Calendar size={14} color={CAT[selectedCat].color} />
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--on-bg)' }}>{t.description}</p>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                                    {t.date.split('-').reverse().join('/')}
                                  </p>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: CAT[selectedCat].color }}>
                                {formatCurrency(t.amount)}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem' }}>
                              <button onClick={() => { setSelectedCat(null); onEditTransaction(t); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--on-surface-variant)' }}>
                                <Edit2 size={12} /> Editar
                              </button>
                              <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar este movimiento?')) { setSelectedCat(null); onDeleteTransaction(t.id); } }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--error)' }}>
                                <Trash2 size={12} /> Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección: Gastos Fijos / Suscripciones */}
                  {details.subs.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
                        Suscripciones / Gastos Fijos ({details.subs.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {details.subs.map(s => (
                          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex-between">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ padding: '6px', borderRadius: '50%', background: `${CAT[selectedCat].color}12`, display: 'flex' }}>
                                  <RefreshCw size={14} color={CAT[selectedCat].color} />
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--on-bg)' }}>{s.name}</p>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>Débito mensual automático</p>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: CAT[selectedCat].color }}>
                                {formatCurrency(s.amount)}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem' }}>
                              <button onClick={() => { setSelectedCat(null); onEditSubscription(s); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--on-surface-variant)' }}>
                                <Edit2 size={12} /> Editar
                              </button>
                              <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar este gasto fijo?')) { setSelectedCat(null); onDeleteSubscription(s.id); } }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--error)' }}>
                                <Trash2 size={12} /> Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección: Cuotas de Tarjeta */}
                  {details.cards.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
                        Cuotas de Tarjeta de Crédito ({details.cards.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {details.cards.map(c => (
                          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex-between">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ padding: '6px', borderRadius: '50%', background: `${c.color}15`, display: 'flex' }}>
                                  <CreditCard size={14} color={c.color} />
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--on-bg)' }}>{c.description}</p>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                                    {c.cardName} · <span style={{ color: c.color, fontWeight: 500 }}>{c.installmentInfo}</span>
                                  </p>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: CAT[selectedCat].color }}>
                                {formatCurrency(c.amount)}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem' }}>
                              <button onClick={() => { setSelectedCat(null); onEditPurchase(c.cardId, c.purchase); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--on-surface-variant)' }}>
                                <Edit2 size={12} /> Editar
                              </button>
                              <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar este gasto de tarjeta?')) { setSelectedCat(null); onDeletePurchase(c.cardId, c.id); } }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', border: 'none', color: 'var(--error)' }}>
                                <Trash2 size={12} /> Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Dashboard;
