const STORAGE_KEY = 'neo_fintech_data';

export const defaultData = {
  monthlyIncomes: {
    '2026-07': [
      { id: 'is-1', name: 'Sueldo', amount: 1000000 },
      { id: 'is-2', name: 'Sobresueldo', amount: 100000 },
      { id: 'is-3', name: 'Velasco', amount: 100000 },
    ]
  },
  transactions: [],
  creditCards: [],
  subscriptions: [],
  goals: []
};

export const loadData = () => {
  try {
    // One-time hard reset to clear legacy mock data in current user browsers
    const hasReset = localStorage.getItem('cleaned_mock_v3');
    if (!hasReset) {
      localStorage.setItem('cleaned_mock_v3', 'true');
      saveData(defaultData);
      return defaultData;
    }

    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return defaultData;
    }
    const data = JSON.parse(serialized);

    // Migration: Convert global incomeSources to monthlyIncomes if missing
    if (!data.monthlyIncomes) {
      data.monthlyIncomes = {
        '2026-07': data.incomeSources || [
          { id: 'is-1', name: 'Sueldo', amount: 1000000 },
          { id: 'is-2', name: 'Sobresueldo', amount: 100000 },
          { id: 'is-3', name: 'Velasco', amount: 100000 },
        ]
      };
    }

    // Migration: ensure all subscriptions have history
    if (data.subscriptions) {
      data.subscriptions = data.subscriptions.map(sub => {
        if (!sub.history) {
          sub.history = {
            '2026-07': sub.amount || 0
          };
        }
        return sub;
      });
    }

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
