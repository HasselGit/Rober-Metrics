import React, { useState } from 'react';
import { formatCurrency } from '../utils/financeCalculator';
import { Clock, TrendingUp, TrendingDown, ArrowRightLeft, Edit2, Trash2, Search, List, CreditCard } from 'lucide-react';

const History = ({ transactions, creditCards, onEdit, onDelete, onEditPurchase, onDeletePurchase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Combine direct transactions and credit card purchases
  const combined = [];

  transactions.forEach(t => {
    combined.push({
      ...t,
      source: 'transaction'
    });
  });

  (creditCards || []).forEach(cc => {
    (cc.purchases || []).forEach(p => {
      combined.push({
        id: p.id,
        date: p.date || `${p.startMonth || '2026-07'}-01`,
        description: p.description,
        amount: p.amount,
        category: p.category || 'no-esenciales',
        type: 'credit_card',
        cardName: cc.name,
        cardColor: cc.color,
        cardId: cc.id,
        installments: p.installments,
        amountPerMonth: p.amountPerMonth,
        source: 'credit_card_purchase',
        purchase: p
      });
    });
  });

  // Sort descending by date (latest first)
  const sorted = combined.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.id.localeCompare(a.id);
  });

  // Filter by search query
  const filtered = sorted.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.cardName && t.cardName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // If not searching and not showing all, limit to last 15
  const displayList = (searchQuery === '' && !showAll) ? filtered.slice(0, 15) : filtered;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div className="sticky-header mb-3">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={20} color="#94a3b8" /> Historial de Movimientos
        </h2>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar gasto (ej. luz, comida, tarjeta)..." 
            className="input-field"
            style={{ paddingLeft: '40px', marginBottom: '0' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between mb-3">
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
          {searchQuery !== '' ? `Resultados de búsqueda` : (showAll ? 'Todos los movimientos' : 'Últimos 15 movimientos')}
        </span>
        {searchQuery === '' && (
          <button onClick={() => setShowAll(!showAll)} className="btn-ghost" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <List size={14} /> {showAll ? 'Ver menos' : 'Ver todo'}
          </button>
        )}
      </div>

      {displayList.length === 0 ? (
        <div className="glass-panel text-center text-muted" style={{ padding: '2rem' }}>
          No se encontraron movimientos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayList.map(t => {
            let Icon = ArrowRightLeft;
            let iconColor = '#bacbb8';
            let amountColor = 'var(--on-surface)';
            let amountPrefix = '';

            if (t.type === 'expense') {
              Icon = TrendingDown;
              iconColor = '#ff4757';
              amountColor = '#ff4757';
              amountPrefix = '-';
            } else if (t.type === 'income') {
              Icon = TrendingUp;
              iconColor = '#32ff7e';
              amountColor = '#32ff7e';
              amountPrefix = '+';
            } else if (t.type === 'credit_card') {
              Icon = CreditCard;
              iconColor = t.cardColor || '#70a1ff';
              amountColor = '#ff4757';
              amountPrefix = '-';
            }

            return (
              <div key={t.id} className="glass-panel" style={{ padding: '1rem' }}>
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                      <Icon size={18} color={iconColor} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.description}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'capitalize', marginTop: '2px' }}>
                        {t.type === 'credit_card' ? (
                          <span>Tarjeta · <span style={{ color: t.cardColor, fontWeight: 500 }}>{t.cardName}</span> · {t.installments} cuotas de {formatCurrency(t.amountPerMonth)}</span>
                        ) : (
                          t.category.replace('-', ' ')
                        )}
                        <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.2)' }}>|</span>
                        <span style={{ marginLeft: '8px' }}>{t.date.split('-').reverse().join('/')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: amountColor }}>
                    {amountPrefix}{formatCurrency(t.amount)}
                  </div>
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                  {t.source === 'credit_card_purchase' ? (
                    <>
                      <button onClick={() => onEditPurchase(t.cardId, t.purchase)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar esta compra?')) onDeletePurchase(t.cardId, t.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                        <Trash2 size={14} /> Borrar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onEdit(t)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar este movimiento?')) onDelete(t.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                        <Trash2 size={14} /> Borrar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
