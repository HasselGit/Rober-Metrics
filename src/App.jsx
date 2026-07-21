import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CreditCardManager from './components/CreditCardManager';
import CreditCardDetail from './components/CreditCardDetail';
import CardForm from './components/CardForm';
import PurchaseForm from './components/PurchaseForm';
import TransactionForm from './components/TransactionForm';
import History from './components/History';
import Subscriptions from './components/Subscriptions';
import SubscriptionForm from './components/SubscriptionForm';
import Goals from './components/Goals';
import GoalForm from './components/GoalForm';
import Liquidity from './components/Liquidity';
import IncomeManager from './components/IncomeManager';
import IncomeSourceForm from './components/IncomeSourceForm';
import { loadData, saveData } from './utils/storage';
import { calculate503020 } from './utils/financeCalculator';
import { Wallet, PieChart, CreditCard, Clock, Target, BarChart2, Plus } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [historyTab, setHistoryTab] = useState('variables'); // 'variables' or 'fijos'

  // Form States
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [viewingCardId, setViewingCardId] = useState(null);

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingPurchaseCardId, setEditingPurchaseCardId] = useState(null);

  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isFundingGoal, setIsFundingGoal] = useState(false);

  // Income sources
  const [showIncomeSourceForm, setShowIncomeSourceForm] = useState(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const persistData = (newData) => {
    setData(newData);
    saveData(newData);
  };

  // --- Helper to get month-specific income sources ---
  const getMonthlyIncomeData = (monthStr) => {
    if (!data || !data.monthlyIncomes) {
      return {
        sources: [
          { id: 'is-1', name: 'Sueldo', amount: 1000000 },
          { id: 'is-2', name: 'Sobresueldo', amount: 100000 },
          { id: 'is-3', name: 'Velasco', amount: 100000 },
        ],
        total: 1200000
      };
    }
    
    // 1. Specific month exists
    if (data.monthlyIncomes[monthStr] && data.monthlyIncomes[monthStr].length > 0) {
      const sources = data.monthlyIncomes[monthStr];
      const total = sources.reduce((sum, s) => sum + s.amount, 0);
      return { sources, total };
    }

    // 2. Continuity rule: find the most recent chronological month
    const months = Object.keys(data.monthlyIncomes).sort();
    const pastMonths = months.filter(m => m < monthStr);
    if (pastMonths.length > 0) {
      const lastMonth = pastMonths[pastMonths.length - 1];
      const sources = data.monthlyIncomes[lastMonth];
      const total = sources.reduce((sum, s) => sum + s.amount, 0);
      return { sources, total };
    }

    // 3. Fallback
    const defaultSources = [
      { id: 'is-1', name: 'Sueldo', amount: 1000000 },
      { id: 'is-2', name: 'Sobresueldo', amount: 100000 },
      { id: 'is-3', name: 'Velasco', amount: 100000 },
    ];
    return { sources: defaultSources, total: 1200000 };
  };

  // --- Transactions ---
  const handleSaveTransaction = (transaction) => {
    const newData = { ...data };
    
    if (editingTransaction) {
      const index = newData.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        if (transaction.type === 'income') {
          const monthStr = transaction.date.slice(0, 7);
          if (!newData.monthlyIncomes) newData.monthlyIncomes = {};
          if (newData.monthlyIncomes[monthStr]) {
            const idx = newData.monthlyIncomes[monthStr].findIndex(s => s.id === transaction.id);
            if (idx !== -1) {
              newData.monthlyIncomes[monthStr][idx] = {
                id: transaction.id,
                name: transaction.description,
                amount: transaction.amount
              };
            }
          }
        }
        newData.transactions[index] = transaction;
      }
    } else {
      if (transaction.type === 'income') {
        const monthStr = transaction.date.slice(0, 7);
        if (!newData.monthlyIncomes) newData.monthlyIncomes = {};
        if (!newData.monthlyIncomes[monthStr]) {
          const { sources } = getMonthlyIncomeData(monthStr);
          newData.monthlyIncomes[monthStr] = sources.map(s => ({ ...s }));
        }
        newData.monthlyIncomes[monthStr].push({
          id: transaction.id,
          name: transaction.description,
          amount: transaction.amount
        });
      } else if (transaction.type === 'credit_card') {
        const card = newData.creditCards.find(c => c.id === transaction.cardId);
        if (card) {
          card.purchases.push({
            id: transaction.id,
            description: transaction.description,
            totalAmount: transaction.amount,
            installments: transaction.installments,
            currentInstallment: 1,
            amountPerMonth: transaction.amount / transaction.installments,
            remainingMonths: transaction.installments,
            startMonth: transaction.date.slice(0, 7)
          });
        }
      } else if (transaction.type === 'subscription') {
        if (!newData.subscriptions) newData.subscriptions = [];
        newData.subscriptions.push({
          id: transaction.id || `sub-${Date.now()}`,
          name: transaction.description,
          amount: transaction.amount,
          category: transaction.category
        });
      } else {
        newData.transactions.push(transaction);
      }
    }
    
    persistData(newData);
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    const newData = { ...data };
    const transaction = newData.transactions.find(t => t.id === id);
    if (transaction && transaction.type === 'income') {
      const monthStr = transaction.date.slice(0, 7);
      if (newData.monthlyIncomes && newData.monthlyIncomes[monthStr]) {
        newData.monthlyIncomes[monthStr] = newData.monthlyIncomes[monthStr].filter(s => s.id !== id);
      }
    }
    newData.transactions = newData.transactions.filter(t => t.id !== id);
    persistData(newData);
  };

  // --- Credit Cards ---
  const handleSaveCard = (card) => {
    const newData = { ...data };
    const index = newData.creditCards.findIndex(c => c.id === card.id);
    if (index !== -1) {
      newData.creditCards[index] = card;
    } else {
      newData.creditCards.push(card);
    }
    persistData(newData);
    setShowCardForm(false);
    setEditingCard(null);
  };

  const handleDeleteCard = (id) => {
    const newData = { ...data };
    newData.creditCards = newData.creditCards.filter(c => c.id !== id);
    if (viewingCardId === id) setViewingCardId(null);
    persistData(newData);
  };

  const handleSavePurchase = (purchase) => {
    const newData = { ...data };
    const card = newData.creditCards.find(c => c.id === editingPurchaseCardId);
    if (card) {
      const index = card.purchases.findIndex(p => p.id === purchase.id);
      if (index !== -1) {
        card.purchases[index] = purchase;
      } else {
        card.purchases.push({
          ...purchase,
          startMonth: purchase.startMonth || selectedMonth
        });
      }
    }
    persistData(newData);
    setShowPurchaseForm(false);
    setEditingPurchase(null);
    setEditingPurchaseCardId(null);
  };

  const handleDeletePurchase = (cardId, purchaseId) => {
    const newData = { ...data };
    const card = newData.creditCards.find(c => c.id === cardId);
    if (card) {
      card.purchases = card.purchases.filter(p => p.id !== purchaseId);
      persistData(newData);
    }
  };

  // --- Subscriptions ---
  const handleSaveSubscription = (subscription) => {
    const newData = { ...data };
    const index = newData.subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
      newData.subscriptions[index] = subscription;
    } else {
      newData.subscriptions.push(subscription);
    }
    persistData(newData);
    setShowSubscriptionForm(false);
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = (id) => {
    const newData = { ...data };
    newData.subscriptions = newData.subscriptions.filter(s => s.id !== id);
    persistData(newData);
  };

  // --- Goals ---
  const handleSaveGoal = (goal) => {
    const newData = { ...data };
    const index = newData.goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      newData.goals[index] = goal;
    } else {
      newData.goals.push(goal);
    }
    persistData(newData);
    setShowGoalForm(false);
    setEditingGoal(null);
    setIsFundingGoal(false);
  };

  const handleDeleteGoal = (id) => {
    const newData = { ...data };
    newData.goals = newData.goals.filter(g => g.id !== id);
    persistData(newData);
  };

  // --- Income Sources ---
  const handleSaveIncomeSource = (source) => {
    const newData = { ...data };
    if (!newData.monthlyIncomes) newData.monthlyIncomes = {};
    
    if (!newData.monthlyIncomes[selectedMonth]) {
      const { sources } = getMonthlyIncomeData(selectedMonth);
      newData.monthlyIncomes[selectedMonth] = sources.map(s => ({ ...s }));
    }
    
    const sources = newData.monthlyIncomes[selectedMonth];
    const idx = sources.findIndex(s => s.id === source.id);
    if (idx !== -1) {
      sources[idx] = source;
    } else {
      sources.push(source);
    }
    
    persistData(newData);
    setShowIncomeSourceForm(false);
    setEditingIncomeSource(null);
  };

  const handleDeleteIncomeSource = (id) => {
    const newData = { ...data };
    if (!newData.monthlyIncomes) newData.monthlyIncomes = {};
    
    if (!newData.monthlyIncomes[selectedMonth]) {
      const { sources } = getMonthlyIncomeData(selectedMonth);
      newData.monthlyIncomes[selectedMonth] = sources.map(s => ({ ...s }));
    }
    
    newData.monthlyIncomes[selectedMonth] = newData.monthlyIncomes[selectedMonth].filter(s => s.id !== id);
    persistData(newData);
  };

  if (!data) return <div>Loading...</div>;

  const { sources: activeIncomeSources, total: activeIncomeTotal } = getMonthlyIncomeData(selectedMonth);
  const calculations = calculate503020(activeIncomeTotal, data.transactions, data.creditCards, data.subscriptions, selectedMonth);

  const enrichedData = {
    ...data,
    income: activeIncomeTotal,
    incomeSources: activeIncomeSources
  };

  // Derive the active card for details view
  const viewingCard = viewingCardId ? enrichedData.creditCards.find(c => c.id === viewingCardId) : null;

  return (
    <div>
      <div className="container mt-2 mb-2 sticky-header">
        <h1 className="flex-between" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={24} /> R-Metrics
          </span>
        </h1>
      </div>

      {currentView === 'dashboard' && (
        <Dashboard 
          data={enrichedData} 
          calculations={calculations} 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onAddClick={() => { setEditingTransaction(null); setShowTransactionForm(true); }}
          onIncomeClick={() => setCurrentView('income')}
          onExpensesClick={() => setCurrentView('history')}
        />
      )}
      
      {currentView === 'cards' && !viewingCard && (
        <CreditCardManager 
          creditCards={enrichedData.creditCards} 
          onAdd={() => { setEditingCard(null); setShowCardForm(true); }}
          onEdit={(cc) => { setEditingCard(cc); setShowCardForm(true); }}
          onDelete={handleDeleteCard}
          onViewDetails={(id) => setViewingCardId(id)}
          selectedMonth={selectedMonth}
        />
      )}

      {currentView === 'cards' && viewingCard && (
        <CreditCardDetail 
          card={viewingCard}
          onBack={() => setViewingCardId(null)}
          onEditPurchase={(cardId, purchase) => {
            setEditingPurchaseCardId(cardId);
            setEditingPurchase(purchase);
            setShowPurchaseForm(true);
          }}
          onDeletePurchase={handleDeletePurchase}
          onAddPurchase={(cardId) => {
            setEditingPurchaseCardId(cardId);
            setEditingPurchase(null);
            setShowPurchaseForm(true);
          }}
          selectedMonth={selectedMonth}
        />
      )}

      {currentView === 'history' && (
        <>
          <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '0.25rem' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button 
                onClick={() => setHistoryTab('variables')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '0.35rem',
                  border: 'none',
                  background: historyTab === 'variables' ? 'var(--primary)' : 'none',
                  color: historyTab === 'variables' ? '#000' : 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: historyTab === 'variables' ? '0 2px 6px rgba(0, 194, 212, 0.25)' : 'none'
                }}
              >
                Gastos Variables
              </button>
              <button 
                onClick={() => setHistoryTab('fijos')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '0.35rem',
                  border: 'none',
                  background: historyTab === 'fijos' ? 'var(--primary)' : 'none',
                  color: historyTab === 'fijos' ? '#000' : 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: historyTab === 'fijos' ? '0 2px 6px rgba(0, 194, 212, 0.25)' : 'none'
                }}
              >
                Fijos / Suscripciones
              </button>
            </div>
          </div>

          {historyTab === 'variables' ? (
            <History 
              transactions={enrichedData.transactions} 
              onEdit={(t) => { setEditingTransaction(t); setShowTransactionForm(true); }}
              onDelete={handleDeleteTransaction}
            />
          ) : (
            <Subscriptions 
              subscriptions={enrichedData.subscriptions || []} 
              onAdd={() => { setEditingSubscription(null); setShowSubscriptionForm(true); }}
              onEdit={(sub) => { setEditingSubscription(sub); setShowSubscriptionForm(true); }}
              onDelete={handleDeleteSubscription}
            />
          )}
        </>
      )}

      {currentView === 'goals' && (
        <Goals 
          goals={enrichedData.goals || []} 
          onAdd={() => { setEditingGoal(null); setIsFundingGoal(false); setShowGoalForm(true); }}
          onEdit={(goal) => { setEditingGoal(goal); setIsFundingGoal(false); setShowGoalForm(true); }}
          onDelete={handleDeleteGoal}
          onFund={(goal) => { setEditingGoal(goal); setIsFundingGoal(true); setShowGoalForm(true); }}
        />
      )}

      {currentView === 'liquidity' && (
        <Liquidity data={enrichedData} calculations={calculations} />
      )}

      {currentView === 'income' && (
        <IncomeManager
          incomeSources={enrichedData.incomeSources || []}
          onEdit={(source) => { setEditingIncomeSource(source); setShowIncomeSourceForm(true); }}
          onDelete={handleDeleteIncomeSource}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {/* ── Global FAB — siempre fijo, acción según vista ─────── */}
      {currentView === 'dashboard' && (
        <button className="fab" onClick={() => { setEditingTransaction(null); setShowTransactionForm(true); }} aria-label="Agregar transacción">
          <Plus size={22} />
        </button>
      )}
      {currentView === 'cards' && !viewingCard && (
        <button className="fab" onClick={() => { setEditingCard(null); setShowCardForm(true); }} aria-label="Agregar tarjeta">
          <Plus size={22} />
        </button>
      )}
      {currentView === 'history' && (
        <button className="fab" onClick={() => {
          if (historyTab === 'variables') {
            setEditingTransaction(null);
            setShowTransactionForm(true);
          } else {
            setEditingTransaction({
              type: 'subscription',
              description: '',
              amount: '',
              category: 'esenciales'
            });
            setShowTransactionForm(true);
          }
        }} aria-label="Agregar">
          <Plus size={22} />
        </button>
      )}
      {currentView === 'goals' && (
        <button className="fab" onClick={() => { setEditingGoal(null); setIsFundingGoal(false); setShowGoalForm(true); }} aria-label="Agregar meta">
          <Plus size={22} />
        </button>
      )}
      {currentView === 'income' && (
        <button className="fab" onClick={() => { setEditingIncomeSource(null); setShowIncomeSourceForm(true); }} aria-label="Agregar ingreso">
          <Plus size={22} />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentView('dashboard'); setViewingCardId(null); }}>
          <PieChart size={22} />
          <span>Inicio</span>
        </div>
        <div className={`nav-item ${currentView === 'cards' ? 'active' : ''}`} onClick={() => { setCurrentView('cards'); setViewingCardId(null); }}>
          <CreditCard size={22} />
          <span>Tarjetas</span>
        </div>
        <div className={`nav-item ${currentView === 'liquidity' ? 'active' : ''}`} onClick={() => { setCurrentView('liquidity'); setViewingCardId(null); }}>
          <BarChart2 size={22} />
          <span>Liquidez</span>
        </div>
        <div className={`nav-item ${currentView === 'goals' ? 'active' : ''}`} onClick={() => { setCurrentView('goals'); setViewingCardId(null); }}>
          <Target size={22} />
          <span>Metas</span>
        </div>
        <div className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => { setCurrentView('history'); setViewingCardId(null); }}>
          <Clock size={22} />
          <span>Historial</span>
        </div>
      </nav>

      {showTransactionForm && (
        <TransactionForm 
          initialData={editingTransaction}
          onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }} 
          onSave={handleSaveTransaction} 
          creditCards={data.creditCards}
        />
      )}

      {showCardForm && (
        <CardForm 
          initialData={editingCard}
          onClose={() => { setShowCardForm(false); setEditingCard(null); }} 
          onSave={handleSaveCard}
        />
      )}

      {showPurchaseForm && (
        <PurchaseForm 
          initialData={editingPurchase}
          onClose={() => { setShowPurchaseForm(false); setEditingPurchase(null); setEditingPurchaseCardId(null); }}
          onSave={handleSavePurchase}
        />
      )}

      {showSubscriptionForm && (
        <SubscriptionForm 
          initialData={editingSubscription}
          onClose={() => { setShowSubscriptionForm(false); setEditingSubscription(null); }} 
          onSave={handleSaveSubscription}
        />
      )}

      {showGoalForm && (
        <GoalForm 
          initialData={editingGoal}
          isFunding={isFundingGoal}
          onClose={() => { setShowGoalForm(false); setEditingGoal(null); setIsFundingGoal(false); }} 
          onSave={handleSaveGoal}
        />
      )}
      {showIncomeSourceForm && (
        <IncomeSourceForm
          source={editingIncomeSource}
          onSave={handleSaveIncomeSource}
          onClose={() => { setShowIncomeSourceForm(false); setEditingIncomeSource(null); }}
        />
      )}
    </div>
  );
}

export default App;
