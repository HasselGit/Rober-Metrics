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
  const targetDate = new Date(targetMonthStr + '-01');
  const today = new Date();
  const monthsDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());

  creditCards.forEach(cc => {
    cc.purchases.forEach(p => {
      if (monthsDiff >= 0 && monthsDiff < p.remainingMonths) {
        ccMonthlyTotal += p.amountPerMonth;
      }
    });
  });
  
  expenses['no-esenciales'] += ccMonthlyTotal;

  // 3. Add Subscriptions
  subscriptions.forEach(sub => {
    if (expenses[sub.category] !== undefined) {
      expenses[sub.category] += sub.amount;
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
    esenciales: (expenses.esenciales / income) * 100,
    'no-esenciales': (expenses['no-esenciales'] / income) * 100,
    ahorro: (expenses.ahorro / income) * 100
  };

  // 4. Generate Insights (Burn Rate)
  const insights = [];
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

export const calculateCreditCardAmortization = (creditCards) => {
  // Project debt over the next 12 months
  const projection = Array(12).fill(0);
  
  creditCards.forEach(cc => {
    cc.purchases.forEach(p => {
      let remaining = p.remainingMonths;
      let monthIndex = 0;
      while (remaining > 0 && monthIndex < 12) {
        projection[monthIndex] += p.amountPerMonth;
        remaining--;
        monthIndex++;
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
