# R-Metrics: Guía Directriz de Reproducción y Diseño Completa

Este documento detalla la arquitectura, la base de datos, el sistema de diseño, los algoritmos matemáticos y cada flujo interactivo necesario para reproducir con **precisión del 100% y hasta el más mínimo detalle** el proyecto **R-Metrics** (Neo-Fintech) hasta su estado actual.

---

## 1. Stack Tecnológico y Configuración

El proyecto está construido sobre **React (v18)** y empaquetado con **Vite**.

### Dependencias (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "highcharts": "^11.4.3",
    "highcharts-react-official": "^3.2.1",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

### Inicialización de Highcharts 3D (`src/main.jsx`)
Es estrictamente obligatorio inicializar el módulo 3D de Highcharts al arrancar la app:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Highcharts from 'highcharts';
import Highcharts3D from 'highcharts/highcharts-3d';

Highcharts3D(Highcharts);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 2. Sistema de Diseño (CSS Tokens & Glassmorphism)

Centralizado en `src/index.css`, con la paleta de acentos estilo **Stitch** (Azul Noche Profundo, Cian Neón y Dorado R-Metrics).

### Variables de Color (`:root`)
```css
:root {
  /* Fondos */
  --bg-color: #080d1a;          /* Azul noche profundo */
  --surface: #0f1829;           /* Superficie principal */
  --surface-mid: #162035;       /* Tarjetas */
  --surface-container: #1e2d47; /* Elementos elevados */
  --surface-container-high: #263858;

  /* Texto */
  --on-bg: #e8f0fe;
  --on-surface: #d0daf0;
  --on-surface-variant: #8098b8;

  /* Acento primario (Cian) */
  --primary: #00c2d4;
  --primary-dark: #0097a8;
  --primary-light: #40d8e8;
  --on-primary: #080d1a;
  --primary-glow: rgba(0, 194, 212, 0.22);
  --primary-glow-strong: rgba(0, 194, 212, 0.4);

  /* Acento secundario (Dorado R-Metrics) */
  --gold: #d4af37;
  --gold-light: #e8c84a;
  --gold-glow: rgba(212, 175, 55, 0.2);

  /* Estado */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #f43f5e;
  --error-glow: rgba(244, 63, 94, 0.2);

  /* Glassmorphism */
  --glass-bg: rgba(15, 24, 41, 0.7);
  --glass-border: rgba(0, 194, 212, 0.12);
  --glass-border-hover: rgba(0, 194, 212, 0.28);

  --font-heading: 'Sora', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

### Componentes Visuales y Reglas CSS Clave
```css
/* Tarjeta Glassmorphic */
.glass-card {
  background: linear-gradient(135deg, rgba(22,32,53,0.85) 0%, rgba(15, 24, 41, 0.9) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

/* Bottom Sheet Overlay & Modal */
.bottom-sheet-overlay, .category-sheet-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(8, 13, 26, 0.6);
  backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: flex-end; justify-content: center;
}
.bottom-sheet, .category-sheet {
  background: linear-gradient(180deg, rgba(22, 32, 53, 0.96) 0%, rgba(15, 24, 41, 0.99) 100%);
  backdrop-filter: blur(20px);
  width: 100%; max-width: 600px;
  max-height: 85vh;
  border-radius: 1.5rem 1.5rem 0 0; padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Desplegable de Calendario / Mes con icono Cian de Alto Contraste */
input[type="month"] {
  color-scheme: dark;
}
input[type="month"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(70%) sepia(85%) saturate(1800%) hue-rotate(145deg) brightness(110%) contrast(105%);
  opacity: 1;
  width: 20px;
  height: 20px;
  margin-left: 6px;
  transition: transform 0.2s ease, filter 0.2s ease;
}
```

---

## 3. Especificación de Formateo de Moneda (Enteros Naturales sin Decimales)

En `src/utils/financeCalculator.js`:
```javascript
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
};
```
*   **Regla R-Metrics**: Todos los valores monetarios de la aplicación se presentan como enteros naturales con separadores de miles y sin ceros ni lugares decimales (ej. **`$ 35.000`**, **`$ 740.000`**).

---

## 4. Componente de Entrada Monetaria Fluida (`CurrencyInput.jsx`)

Para evitar bloqueos al presionar **Backspace** o escribir montos, `CurrencyInput.jsx` procesa entradas de texto usando `inputMode="numeric"`:

```jsx
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/financeCalculator';

const CurrencyInput = ({ value, onChange, placeholder = "$ 0", className = "input-field", style, disabled }) => {
  const formatDisplay = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^\d]/g, ''), 10);
    if (isNaN(num)) return '';
    return formatCurrency(num);
  };

  const [displayValue, setDisplayValue] = useState(() => formatDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (!raw) {
      setDisplayValue('');
      onChange('');
      return;
    }

    const digitsOnly = raw.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      setDisplayValue('');
      onChange('');
      return;
    }

    const numericValue = parseInt(digitsOnly, 10);
    setDisplayValue(formatCurrency(numericValue));
    onChange(numericValue);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      style={style}
      disabled={disabled}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

export default CurrencyInput;
```
*   **Comportamiento de Borrado**: Tipear `35000` $\to$ `$ 35.000`. Presionar Backspace $\to$ `$ 3.500` $\to$ `$ 350` $\to$ `$ 35` $\to$ `$ 3` $\to$ `empty`.

---

## 5. Estructura de Base de Datos y Persistencia (`src/utils/storage.js`)

Persistida en `localStorage` bajo la clave `neo_fintech_data`:

```json
{
  "monthlyIncomes": {
    "2026-07": [
      { "id": "is-1", "name": "Sueldo", "amount": 1000000 }
    ]
  },
  "transactions": [
    {
      "id": "t-1",
      "description": "Supermercado",
      "amount": 35000,
      "type": "expense",
      "category": "esenciales",
      "date": "2026-07-21",
      "paymentMethod": "cash"
    }
  ],
  "creditCards": [
    {
      "id": "cc-1",
      "name": "Visa Galicia",
      "limit": 500000,
      "color": "#70a1ff",
      "purchases": [
        {
          "id": "p-1",
          "description": "Zapatillas",
          "totalAmount": 120000,
          "amount": 120000,
          "installments": 3,
          "startMonth": "2026-07",
          "amountPerMonth": 40000
        }
      ]
    }
  ],
  "subscriptions": [
    {
      "id": "sub-1",
      "name": "Netflix",
      "category": "no-esenciales",
      "paymentMethod": "credit_card",
      "cardId": "cc-1",
      "history": {
        "2026-07": 12000
      }
    }
  ],
  "goals": [
    {
      "id": "g-1",
      "name": "Fondo de Emergencia",
      "targetAmount": 500000,
      "currentAmount": 150000,
      "color": "#d4af37"
    }
  ]
}
```

### Reglas de Decoplamiento e Historial:
1.  **Gastos Fijos (Suscripciones)**: Almacenan importes históricos en `history['YYYY-MM']`. El valor para un mes objetivo `targetMonth` se resuelve mediante `history[K]` donde $K = \max(\{k \le \text{targetMonth}\})$.
2.  **Suscripciones Vinculadas a Tarjeta**: Si `subscription.paymentMethod === 'credit_card'`, su costo mensual se computa dentro de la factura mensual de la tarjeta correspondiente (`cardId`), sumándose al resumen de la tarjeta y evitando duplicaciones en los totales globales.
3.  **Fuentes de Ingreso por Mes**: Al consultar un mes sin datos, se heredan automáticamente los ingresos del mes anterior más cercano. Al editar un ingreso, se copia y desacopla en el mes seleccionado.

---

## 6. Algoritmo del Presupuesto 50/30/20 (`financeCalculator.js`)

```javascript
// 1. Esenciales (50%)
const esenciales = 
  transactions.filter(t => t.date.startsWith(month) && t.category === 'esenciales' && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) +
  subscriptions.filter(s => s.category === 'esenciales').reduce((sum, s) => sum + getSubscriptionAmountForMonth(s, month), 0);

// 2. No Esenciales (30%)
const noEsenciales = 
  transactions.filter(t => t.date.startsWith(month) && t.category === 'no-esenciales' && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) +
  subscriptions.filter(s => s.category === 'no-esenciales').reduce((sum, s) => sum + getSubscriptionAmountForMonth(s, month), 0) +
  cuotasDeTarjetasActivasEnElMes(creditCards, month);

// 3. Ahorro (20%)
const ahorro = 
  transactions.filter(t => t.date.startsWith(month) && (t.category === 'ahorro' || t.type === 'transfer')).reduce((sum, t) => sum + t.amount, 0);
```

---

## 7. Formulario Central en 2 Pasos (`TransactionForm.jsx`)

Refactorizado como un wizard Bottom Sheet interactivo:

*   **Paso 1 (Tipo de Movimiento)**: Presenta tarjetas elegibles:
    *   *Gasto Único* (`single`)
    *   *Gasto Recurrente / Fijo* (`recurring`)
    *   *Ingreso* (`income`)
    *   *Ahorro / Inversión* (`ahorro`)
*   **Paso 2 (Detalles y Medio de Pago Condicional)**:
    *   Si es *Gasto Único* o *Gasto Recurrente*: Muestra selector de medio de pago: **Efectivo / Débito** vs **Tarjeta de Crédito**.
    *   Si elige *Tarjeta de Crédito*: Habilita un selector desplegable con las tarjetas registradas.
    *   Usa el componente `<CurrencyInput />` para el monto.

---

## 8. Pantalla de Historial Unificado (`History.jsx`)

*   **Encabezado en la Parte Superior**:
    1.  Título *"Historial de Movimientos"* y **Buscador de Texto** ubicados en la parte superior.
    2.  Pestañas de Filtro ubicadas inmediatamente **debajo del buscador**:
        *   `Todos`
        *   `Gastos Variables`
        *   `Fijos / Suscripciones`
*   **Resultados Unificados**: Integra transacciones directas, cuotas de tarjeta de crédito activas y suscripciones fijos en una sola lista cronológica filtrable.

---

## 9. Selector de Mes en Encabezado (`Dashboard.jsx`)

*   **Sin recortes de texto**: El selector `<input type="month">` se envuelve en una cápsula con `min-width: 165px` y fondo `rgba(0,194,212,0.12)`.
*   **Icono de Calendario Cian de Alto Contraste**: Acompañado por un icono `Calendar` de Lucide y estilizado en CSS con `::-webkit-calendar-picker-indicator` invertido a Cian brillante.

---

## 10. Comprobación y Despliegue

*   **Servidor Local**: `npm run dev`
*   **Compilación**: `npm run build`
*   **Despliegue Producción**: `npx vercel --prod --yes` (URL: `https://robermetrics.vercel.app`)
