import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

const TransactionForm = ({ onClose, onSave, creditCards, initialData, selectedMonth }) => {
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [wizardType, setWizardType] = useState(() => {
    if (initialData) {
      if (initialData.type === 'expense' || initialData.type === 'credit_card') return 'single';
      if (initialData.type === 'subscription') return 'recurring';
      return initialData.type; // 'income' or 'transfer'
    }
    return 'single';
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (initialData) {
      return initialData.cardId ? 'credit_card' : 'cash';
    }
    return 'cash';
  });

  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'esenciales',
    cardId: initialData?.cardId || creditCards?.[0]?.id || '',
    installments: initialData?.installments || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    let finalType = 'expense';
    if (wizardType === 'recurring') {
      finalType = 'subscription';
    } else if (wizardType === 'single') {
      finalType = paymentMethod === 'credit_card' ? 'credit_card' : 'expense';
    } else {
      finalType = wizardType; // 'income' or 'transfer'
    }

    // Resolve date to match selectedMonth
    let finalDate = initialData?.date;
    if (!finalDate) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const currentMonthStr = today.toISOString().slice(0, 7);
      if (selectedMonth === currentMonthStr) {
        finalDate = `${selectedMonth}-${dd}`;
      } else {
        finalDate = `${selectedMonth}-01`;
      }
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      date: finalDate,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: finalType === 'income' ? 'esenciales' : formData.category,
      type: finalType,
      paymentMethod: finalType === 'income' ? undefined : paymentMethod,
      cardId: paymentMethod === 'credit_card' ? formData.cardId : undefined,
      installments: finalType === 'credit_card' ? parseInt(formData.installments) : undefined
    });
  };

  const wizardCardStyle = (isActive) => ({
    background: isActive ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'}`,
    borderRadius: '1rem',
    padding: '1.25rem 0.85rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--on-surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isActive ? '0 0 12px var(--primary-glow-strong)' : 'none',
    outline: 'none',
    fontFamily: 'inherit'
  });

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="flex-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {step === 2 && !initialData && (
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn-ghost" 
                style={{ padding: '6px', borderRadius: '50%', display: 'flex', marginRight: '4px' }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 style={{ fontSize: '1.25rem' }}>
              {initialData ? 'Editar Transacción' : (step === 1 ? '¿Qué vas a cargar?' : 'Completar detalles')}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Type Selection */}
        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" style={wizardCardStyle(wizardType === 'single')} onClick={() => setWizardType('single')}>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block' }}>🛍️</span>
                <strong style={{ fontSize: '0.88rem' }}>Gasto Único</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem', display: 'block', lineHeight: 1.2 }}>
                  Compra puntual en el mes
                </span>
              </button>

              <button type="button" style={wizardCardStyle(wizardType === 'recurring')} onClick={() => setWizardType('recurring')}>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block' }}>🔄</span>
                <strong style={{ fontSize: '0.88rem' }}>Gasto Recurrente</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem', display: 'block', lineHeight: 1.2 }}>
                  Netflix, Alquiler, Luz, etc.
                </span>
              </button>

              <button type="button" style={wizardCardStyle(wizardType === 'income')} onClick={() => setWizardType('income')}>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block' }}>💰</span>
                <strong style={{ fontSize: '0.88rem' }}>Ingreso</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem', display: 'block', lineHeight: 1.2 }}>
                  Sueldos, sobresueldos
                </span>
              </button>

              <button type="button" style={wizardCardStyle(wizardType === 'transfer')} onClick={() => setWizardType('transfer')}>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block' }}>🏦</span>
                <strong style={{ fontSize: '0.88rem' }}>Ahorro / Inv.</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem', display: 'block', lineHeight: 1.2 }}>
                  CEDEARs, MEP, etc.
                </span>
              </button>
            </div>

            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }} 
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2: Detail Inputs */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            
            {/* Conditional Payment Method */}
            {(wizardType === 'single' || wizardType === 'recurring') && (
              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Medio de Pago</label>
                <select 
                  className="input-field" 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={!!initialData}
                >
                  <option value="cash">Efectivo / Débito</option>
                  <option value="credit_card">Tarjeta de Crédito</option>
                </select>
              </div>
            )}

            {/* Credit Card selectors */}
            {paymentMethod === 'credit_card' && (wizardType === 'single' || wizardType === 'recurring') && (
              <>
                <div className="mb-3">
                  <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Tarjeta</label>
                  <select 
                    className="input-field" 
                    value={formData.cardId}
                    onChange={e => setFormData({...formData, cardId: e.target.value})}
                    disabled={!!initialData}
                  >
                    {creditCards.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Only ask installments for Gasto Único */}
                {wizardType === 'single' && (
                  <div className="mb-3">
                    <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Cantidad de Cuotas</label>
                    <select 
                      className="input-field" 
                      value={formData.installments}
                      onChange={e => setFormData({...formData, installments: e.target.value})}
                      disabled={!!initialData}
                    >
                      {[1,2,3,6,9,12,18,24].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Category selection */}
            {wizardType !== 'income' && (
              <div className="mb-3">
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Categoría (50/30/20)</label>
                <select 
                  className="input-field" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="esenciales">Esenciales (50%) - Vivienda, Comida</option>
                  <option value="no-esenciales">No Esenciales (30%) - Gustos, Salidas</option>
                  {wizardType !== 'recurring' && (
                    <option value="ahorro">Ahorro (20%) - CEDEARs, MEP</option>
                  )}
                </select>
              </div>
            )}

            {/* Common fields */}
            <div className="mb-3">
              <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Descripción</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder={wizardType === 'recurring' ? 'Ej. Netflix' : 'Ej. Supermercado'} 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>
                {wizardType === 'recurring' ? 'Monto Mensual ($)' : 'Monto Total ($)'}
              </label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Guardar
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default TransactionForm;
