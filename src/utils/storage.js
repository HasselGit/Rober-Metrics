const STORAGE_KEY = 'neo_fintech_data';

export const defaultData = {
  income: 1226600,
  incomeSources: [
    { id: 'is-1', name: 'Sueldo', amount: 1000000 },
    { id: 'is-2', name: 'Sobresueldo', amount: 126600 },
  ],
  transactions: [
    // Pre-seed some transactions from the Excel for demonstration
    { id: '1', date: '2026-07-01', description: 'Alquiler', amount: 300000, category: 'esenciales', type: 'expense' },
    { id: '2', date: '2026-07-02', description: 'Comida', amount: 100000, category: 'esenciales', type: 'expense' },
    { id: '3', date: '2026-07-05', description: 'Gas', amount: 72800, category: 'esenciales', type: 'expense' },
    { id: '4', date: '2026-07-06', description: 'Abono Cel.', amount: 13000, category: 'no-esenciales', type: 'expense' },
    { id: '5', date: '2026-07-10', description: 'Gimnasio', amount: 40000, category: 'no-esenciales', type: 'expense' },
    { id: '6', date: '2026-07-15', description: 'Ahorro / CEDEARs', amount: 18000, category: 'ahorro', type: 'transfer' },
  ],
  creditCards: [
    {
      id: 'cc-1',
      name: 'Visa BNA',
      limit: 800000,
      color: '#70a1ff',
      purchases: [
        { id: 'p-1', description: 'Odonto Placa 1', totalAmount: 107000, installments: 1, currentInstallment: 1, amountPerMonth: 107000, remainingMonths: 1 }
      ]
    },
    {
      id: 'cc-2',
      name: 'Master BNA',
      limit: 1780000,
      color: '#ff4757',
      purchases: [
        { id: 'p-2', description: 'Bici', totalAmount: 266800, installments: 6, currentInstallment: 4, amountPerMonth: 44466.66, remainingMonths: 3 },
        { id: 'p-3', description: 'Gafas', totalAmount: 178000, installments: 3, currentInstallment: 2, amountPerMonth: 59333.33, remainingMonths: 2 }
      ]
    }
  ],
  subscriptions: [
    { id: 'sub-1', name: 'Netflix', amount: 15000, category: 'no-esenciales' },
    { id: 'sub-2', name: 'Gimnasio', amount: 45000, category: 'no-esenciales' },
    { id: 'sub-3', name: 'Alquiler', amount: 350000, category: 'esenciales' }
  ],
  goals: [
    { id: 'g-1', name: 'MacBook Pro', targetAmount: 2500000, currentAmount: 400000, color: '#d4af37' },
    { id: 'g-2', name: 'Fondo de Emergencia', targetAmount: 1000000, currentAmount: 850000, color: '#94a3b8' }
  ]
};

export const loadData = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return defaultData;
    }
    const data = JSON.parse(serialized);
    // Migration: if incomeSources doesn't exist, create one from the income total
    if (!data.incomeSources || data.incomeSources.length === 0) {
      data.incomeSources = [
        { id: 'is-migrated', name: 'Ingreso Principal', amount: data.income || 0 }
      ];
    }
    // Always keep data.income in sync with the sum of sources
    data.income = data.incomeSources.reduce((sum, s) => sum + s.amount, 0);
    return data;
  } catch (err) {
    console.error('Error loading data from localStorage', err);
    return defaultData;
  }
};

export const saveData = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Error saving data to localStorage", err);
  }
};
