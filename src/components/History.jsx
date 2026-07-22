import React, { useState } from 'react';
import { formatCurrency, getSubscriptionAmountForMonth } from '../utils/financeCalculator';
import { Clock, TrendingUp, TrendingDown, ArrowRightLeft, Edit2, Trash2, Search, List, CreditCard, RefreshCw } from 'lucide-react';

const History = ({ 
  transactions = [], 
  creditCards = [], 
  subscriptions = [], 
  selectedMonth = '2026-07',
  onEdit, 
  onDelete, 
  onEditPurchase, 
  onDeletePurchase,
  onEditSubscription,
  onDeleteSubscription
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'variables' | 'fijos'
  const [showAll, setShowAll] = useState(false);

  // 1. Collect all types of items into a unified collection
  const combinedItems = [];

  // Direct transactions (variable expenses, incomes, transfers)
  transactions.forEach(t => {
    combinedItems.push({
      id: t.id,
      date: t.date || `${selectedMonth}-01`,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type, // 'expense', 'income', 'transfer'
      kind: 'variable',
      source: 'transaction',
      raw: t
    });
  });

  // Credit Card Purchases (installments)
  (creditCards || []).forEach(cc => {
    (cc.purchases || []).forEach(p => {
      combinedItems.push({
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
        kind: 'variable',
        source: 'credit_card_purchase',
        raw: p
      });
    });
  });

  // Subscriptions (Fixed Expenses)
  (subscriptions || []).forEach(sub => {
    const activeAmount = getSubscriptionAmountForMonth(sub, selectedMonth);
    if (activeAmount > 0) {
      const cardObj = sub.paymentMethod === 'credit_card' ? (creditCards || []).find(c => c.id === sub.cardId) : null;
      combinedItems.push({
        id: sub.id,
        date: `${selectedMonth}-01`,
        description: sub.name,
        amount: activeAmount,
        category: sub.category,
        type: 'subscription',
        paymentMethod: sub.paymentMethod || 'cash',
        cardName: cardObj ? cardObj.name : null,
        cardColor: cardObj ? cardObj.color : null,
        kind: 'fijo',
        source: 'subscription',
        raw: sub
      });
    }
  });

  // Sort descending by date
  const sorted = combinedItems.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.id.localeCompare(a.id);
  });

  // 2. Filter by selected Tab ('all', 'variables', 'fijos')
  const tabFiltered = sorted.filter(item => {
    if (filterTab === 'variables') return item.kind === 'variable';
    if (filterTab === 'fijos') return item.kind === 'fijo';
    return true; // 'all'
  });

  // 3. Filter by Search Query
  const searchFiltered = tabFiltered.filter(item => 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.cardName && item.cardName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Limit display to 15 unless searching or 'showAll' enabled
  const displayList = (searchQuery === '' && !showAll) ? searchFiltered.slice(0, 15) : searchFiltered;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* ── HEADER 1: Title ────────────────────── */}
      <div className="sticky-header mb-3">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={20} color="#94a3b8" /> Historial de Movimientos
        </h2>
        
        {/* ── HEADER 2: Buscador ────────────────────── */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
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

        {/* ── HEADER 3: Solapas de Tipo de Gasto (Todos | Variables | Fijos) ── */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button 
            onClick={() => setFilterTab('all')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '0.35rem',
              border: 'none',
              background: filterTab === 'all' ? 'var(--primary)' : 'none',
              color: filterTab === 'all' ? '#000' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: filterTab === 'all' ? '0 2px 6px rgba(0, 194, 212, 0.25)' : 'none'
            }}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterTab('variables')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '0.35rem',
              border: 'none',
              background: filterTab === 'variables' ? 'var(--primary)' : 'none',
              color: filterTab === 'variables' ? '#000' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: filterTab === 'variables' ? '0 2px 6px rgba(0, 194, 212, 0.25)' : 'none'
            }}
          >
            Gastos Variables
          </button>
          <button 
            onClick={() => setFilterTab('fijos')}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '0.35rem',
              border: 'none',
              background: filterTab === 'fijos' ? 'var(--primary)' : 'none',
              color: filterTab === 'fijos' ? '#000' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: filterTab === 'fijos' ? '0 2px 6px rgba(0, 194, 212, 0.25)' : 'none'
            }}
          >
            Fijos / Suscripciones
          </button>
        </div>
      </div>

      {/* Subheader info bar */}
      <div className="flex-between mb-3">
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
          {searchQuery !== '' ? `Resultados de búsqueda (${searchFiltered.length})` : (showAll ? `Todos los movimientos (${searchFiltered.length})` : `Últimos movimientos`)}
        </span>
        {searchQuery === '' && (
          <button onClick={() => setShowAll(!showAll)} className="btn-ghost" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <List size={14} /> {showAll ? 'Ver menos' : 'Ver todo'}
          </button>
        )}
      </div>

      {/* List rendered items */}
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
            } else if (t.type === 'subscription') {
              Icon = RefreshCw;
              iconColor = 'var(--primary)';
              amountColor = '#ff4757';
              amountPrefix = '-';
            }

            return (
              <div key={`${t.source}-${t.id}`} className="glass-panel" style={{ padding: '1rem' }}>
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
                        ) : t.type === 'subscription' ? (
                          <span>Gasto Fijo Recurrente {t.cardName ? `· Tarjeta ${t.cardName}` : ''}</span>
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
                  {t.source === 'credit_card_purchase' && (
                    <>
                      <button onClick={() => onEditPurchase(t.cardId, t.raw)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar esta compra?')) onDeletePurchase(t.cardId, t.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                        <Trash2 size={14} /> Borrar
                      </button>
                    </>
                  )}

                  {t.source === 'subscription' && (
                    <>
                      <button onClick={() => onEditSubscription && onEditSubscription(t.raw)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => { if(window.confirm('¿Seguro que quieres borrar este gasto fijo?')) onDeleteSubscription && onDeleteSubscription(t.id) }} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--error)', border: 'none' }}>
                        <Trash2 size={14} /> Borrar
                      </button>
                    </>
                  )}

                  {t.source === 'transaction' && (
                    <>
                      <button onClick={() => onEdit(t.raw)} className="btn-ghost" style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', border: 'none' }}>
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
