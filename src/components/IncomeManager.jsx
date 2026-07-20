import React from 'react';
import { formatCurrency } from '../utils/financeCalculator';
import { TrendingUp, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const IncomeManager = ({ incomeSources = [], onEdit, onDelete, onBack }) => {
  const total = incomeSources.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky-header mb-4">
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 0', marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Volver al inicio
        </button>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={22} color="var(--primary)" />
          Mis Ingresos
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
          Tocá una fuente para editarla · Usa + para agregar
        </p>
      </header>

      {/* ── Tarjeta total ───────────────────────────────────────── */}
      <div className="glass-card mb-4" style={{
        background: 'linear-gradient(135deg, rgba(0,194,212,0.12) 0%, rgba(15,24,41,0.9) 100%)',
        border: '1px solid rgba(0,194,212,0.25)',
        padding: '1.5rem'
      }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
          Total ingresos del mes
        </p>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', margin: 0 }}>
          {formatCurrency(total)}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.4rem' }}>
          {incomeSources.length} {incomeSources.length === 1 ? 'fuente' : 'fuentes'} de ingreso
        </p>
      </div>

      {/* ── Lista de fuentes ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {incomeSources.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <TrendingUp size={36} color="var(--on-surface-variant)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>No hay fuentes de ingreso</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Usá el botón + para agregar tu primer ingreso</p>
          </div>
        ) : (
          incomeSources.map((source, idx) => {
            const pct = total > 0 ? (source.amount / total) * 100 : 0;
            // Cycle through colors for visual variety
            const colors = ['#00c2d4', '#6366f1', '#d4af37', '#0ea5e9', '#22c55e', '#f59e0b'];
            const color = colors[idx % colors.length];

            return (
              <div
                key={source.id}
                className="glass-card"
                style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', borderLeft: `3px solid ${color}` }}
                onClick={() => onEdit(source)}
              >
                <div className="flex-between mb-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{source.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: color }}>
                      {formatCurrency(source.amount)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Borrar "${source.name}"?`)) onDelete(source.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Barra proporcional */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: '3px',
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', minWidth: '36px', textAlign: 'right' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Edit2 size={10} /> Toca para editar el monto de este mes
                </p>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default IncomeManager;
