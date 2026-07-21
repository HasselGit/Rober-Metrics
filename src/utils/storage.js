const STORAGE_KEY = 'neo_fintech_data';

export const defaultData = {
  income: 1200000,
  incomeSources: [
    { id: 'is-1', name: 'Sueldo', amount: 1000000 },
    { id: 'is-2', name: 'Sobresueldo', amount: 100000 },
    { id: 'is-3', name: 'Velasco', amount: 100000 },
  ],
  transactions: [],
  creditCards: [],
  subscriptions: [],
  goals: []
};

export const loadData = () => {
  try {
    // One-time hard reset to clear legacy mock data in current user browsers
    const hasReset = localStorage.getItem('cleaned_mock_v2');
    if (!hasReset) {
      localStorage.setItem('cleaned_mock_v2', 'true');
      saveData(defaultData);
      return defaultData;
    }

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
