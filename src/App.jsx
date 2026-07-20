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

  // --- Transactions ---
  const handleSaveTransaction = (transaction) => {
    const newData = { ...data };
    
    if (editingTransaction) {
      const index = newData.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        if (transaction.type === 'income') {
          newData.income = newData.income - editingTransaction.amount + transaction.amount;
        }
        newData.transactions[index] = transaction;
      }
    } else {
      if (transaction.type === 'income') {
        newData.income += transaction.amount;
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
            remainingMonths: transaction.installments
          });
        }
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
      newData.income -= transaction.amount;
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
    if (!newData.incomeSources) newData.incomeSources = [];
    const idx = newData.incomeSources.findIndex(s => s.id === source.id);
    if (idx !== -1) {
      newData.incomeSources[idx] = source;
    } else {
      newData.incomeSources.push(source);
    }
    // Recalculate total income from sources
    newData.income = newData.incomeSources.reduce((sum, s) => sum + s.amount, 0);
    persistData(newData);
    setShowIncomeSourceForm(false);
    setEditingIncomeSource(null);
  };

  const handleDeleteIncomeSource = (id) => {
    const newData = { ...data };
    newData.incomeSources = (newData.incomeSources || []).filter(s => s.id !== id);
    newData.income = newData.incomeSources.reduce((sum, s) => sum + s.amount, 0);
    persistData(newData);
  };

  if (!data) return <div>Loading...</div>;

  const calculations = calculate503020(data.income, data.transactions, data.creditCards, data.subscriptions, selectedMonth);

  // Derive the active card for details view
  const viewingCard = viewingCardId ? data.creditCards.find(c => c.id === viewingCardId) : null;

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
          data={data} 
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
          creditCards={data.creditCards} 
          onAdd={() => { setEditingCard(null); setShowCardForm(true); }}
          onEdit={(cc) => { setEditingCard(cc); setShowCardForm(true); }}
          onDelete={handleDeleteCard}
          onViewDetails={(id) => setViewingCardId(id)}
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
        />
      )}

      {currentView === 'history' && (
        <History 
          transactions={data.transactions} 
          onEdit={(t) => { setEditingTransaction(t); setShowTransactionForm(true); }}
          onDelete={handleDeleteTransaction}
        />
      )}

      {currentView === 'subscriptions' && (
        <Subscriptions 
          subscriptions={data.subscriptions || []} 
          onAdd={() => { setEditingSubscription(null); setShowSubscriptionForm(true); }}
          onEdit={(sub) => { setEditingSubscription(sub); setShowSubscriptionForm(true); }}
          onDelete={handleDeleteSubscription}
        />
      )}

      {currentView === 'goals' && (
        <Goals 
          goals={data.goals || []} 
          onAdd={() => { setEditingGoal(null); setIsFundingGoal(false); setShowGoalForm(true); }}
          onEdit={(goal) => { setEditingGoal(goal); setIsFundingGoal(false); setShowGoalForm(true); }}
          onDelete={handleDeleteGoal}
          onFund={(goal) => { setEditingGoal(goal); setIsFundingGoal(true); setShowGoalForm(true); }}
        />
      )}

      {currentView === 'liquidity' && (
        <Liquidity data={data} calculations={calculations} />
      )}

      {currentView === 'income' && (
        <IncomeManager
          incomeSources={data.incomeSources || []}
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
      {currentView === 'subscriptions' && (
        <button className="fab" onClick={() => { setEditingSubscription(null); setShowSubscriptionForm(true); }} aria-label="Agregar suscripción">
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
