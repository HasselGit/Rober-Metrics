// Helper to calculate difference in months between two YYYY-MM strings
export const getMonthsDifference = (dateStrA, dateStrB) => {
  const [yearA, monthA] = dateStrA.split('-').map(Number);
  const [yearB, monthB] = dateStrB.split('-').map(Number);
  return (yearA - yearB) * 12 + (monthA - monthB);
};

// Helper to get a future YYYY-MM month string with an offset
export const getFutureMonth = (startMonthStr, offset) => {
  const [year, month] = startMonthStr.split('-').map(Number);
  const d = new Date(year, month - 1 + offset, 1);
  return d.toISOString().slice(0, 7);
};

// Helper to get active amount of a subscription in a given target month
export const getSubscriptionAmountForMonth = (sub, targetMonthStr) => {
  if (!sub.history || Object.keys(sub.history).length === 0) {
    return sub.amount || 0;
  }
  const months = Object.keys(sub.history).sort(); // Sort chronological, e.g. ["2026-07", "2026-08"]
  const startMonth = months[0];
  if (targetMonthStr < startMonth) {
    return 0; // Not active yet
  }
  let activeAmount = 0;
  for (const m of months) {
    if (m <= targetMonthStr) {
      activeAmount = sub.history[m];
    }
  }
  return activeAmount;
};

export const calculate503020 = (income, transactions, creditCards, subscriptions = [], targetMonthStr) => {
  // targetMonthStr is in format "YYYY-MM"
  const expenses = {
    esenciales: 0,
    'no-esenciales': 0,
    ahorro: 0
  };

  // 1. Filter normal transactions by targetMonth
  transactions.forEach(t => {
    if (t.date.startsWith(targetMonthStr)) {
      if (t.type === 'expense' || t.type === 'transfer') {
        if (expenses[t.category] !== undefined) {
          expenses[t.category] += t.amount;
        }
      }
    }
  });

  // 2. Add credit card installments that fall into targetMonth
  let ccMonthlyTotal = 0;

  creditCards.forEach(cc => {
    cc.purchases.forEach(p => {
      const purchaseStartMonth = p.startMonth || '2026-07';
      const diff = getMonthsDifference(targetMonthStr, purchaseStartMonth);
      if (diff >= 0 && diff < p.installments) {
        ccMonthlyTotal += p.amountPerMonth;
      }
    });
  });
  
  expenses['no-esenciales'] += ccMonthlyTotal;

  // 3. Add Subscriptions using month-specific historical lookup
  subscriptions.forEach(sub => {
    if (expenses[sub.category] !== undefined) {
      expenses[sub.category] += getSubscriptionAmountForMonth(sub, targetMonthStr);
    }
  });

  // Calculate ideal budgets
  const ideal = {
    esenciales: income * 0.5,
    'no-esenciales': income * 0.3,
    ahorro: income * 0.2
  };

  // Calculate percentages used
  const percentages = {
    esenciales: income > 0 ? (expenses.esenciales / income) * 100 : 0,
    'no-esenciales': income > 0 ? (expenses['no-esenciales'] / income) * 100 : 0,
    ahorro: income > 0 ? (expenses.ahorro / income) * 100 : 0
  };

  // 4. Generate Insights (Burn Rate)
  const insights = [];
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  
  if (targetMonthStr === currentMonthStr) {
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthProgress = (dayOfMonth / daysInMonth) * 100;

    if (percentages.esenciales > monthProgress + 10) {
      insights.push({ type: 'warning', text: `Ritmo alto: Gastaste el ${percentages.esenciales.toFixed(0)}% de esenciales, pero el mes va al ${monthProgress.toFixed(0)}%.` });
    }
    if (percentages['no-esenciales'] > monthProgress + 10) {
      insights.push({ type: 'danger', text: `Alerta: Llevas ${percentages['no-esenciales'].toFixed(0)}% en no-esenciales (Límite: 30%). Frena los gastos extra.` });
    }
    if (percentages.ahorro >= 20) {
      insights.push({ type: 'success', text: `¡Excelente! Ya cubriste tu meta del 20% de ahorro para este mes.` });
    }
    
    if (insights.length === 0) {
      insights.push({ type: 'success', text: `Vienes a un excelente ritmo. Tus gastos están alineados con el momento del mes.` });
    }
  }

  return { expenses, ideal, percentages, ccMonthlyTotal, insights };
};

export const calculateCreditCardAmortization = (creditCards, startMonthStr = '2026-07') => {
  // Project debt over the next 12 months starting from startMonthStr
  const projection = Array(12).fill(0);
  
  creditCards.forEach(cc => {
    cc.purchases.forEach(p => {
      const purchaseStartMonth = p.startMonth || '2026-07';
      for (let i = 0; i < 12; i++) {
        const targetMonth = getFutureMonth(startMonthStr, i);
        const diff = getMonthsDifference(targetMonth, purchaseStartMonth);
        if (diff >= 0 && diff < p.installments) {
          projection[i] += p.amountPerMonth;
        }
      }
    });
  });

  return projection;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
};
