# R-Metrics: Guía Directriz de Reproducción y Diseño
Este documento detalla la arquitectura, el sistema de diseño, la configuración técnica y los flujos interactivos necesarios para reproducir con total fidelidad el proyecto **R-Metrics** (Neo-Fintech) hasta su estado actual.

---

## 1. Stack Tecnológico y Dependencias
El proyecto está construido sobre **React** y empaquetado con **Vite**. Las dependencias clave requeridas para el funcionamiento y los gráficos 3D son:

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

*Nota: Para habilitar los gráficos 3D de Highcharts, es obligatorio importar y activar el módulo 3D en el punto de entrada de la aplicación (`src/main.jsx` o similar):*
```javascript
import Highcharts from 'highcharts';
import Highcharts3D from 'highcharts/highcharts-3d';
Highcharts3D(Highcharts);
```

---

## 2. Sistema de Diseño (CSS Tokens & Glassmorphism)
La paleta está inspirada en la identidad de "Stitch" (Azul noche profundo y acentos de Cian vibrante y Dorado R-Metrics). Se encuentra centralizada en `src/index.css`.

### Variables de Color (CSS Custom Properties)
```css
:root {
  --bg-color: #080d1a;          /* Azul noche profundo */
  --surface: #0f1829;           /* Superficie principal */
  --surface-mid: #162035;       /* Tarjetas */
  --surface-container: #1e2d47; /* Elementos elevados */
  
  /* Acento primario (Cian) */
  --primary: #00c2d4;
  --primary-dark: #0097a8;
  --primary-glow: rgba(0, 194, 212, 0.22);
  --primary-glow-strong: rgba(0, 194, 212, 0.4);

  /* Acento secundario (Dorado) */
  --gold: #d4af37;
  --gold-light: #e8c84a;

  /* Estados */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #f43f5e;

  /* Glassmorphism */
  --glass-bg: rgba(15, 24, 41, 0.7);
  --glass-border: rgba(0, 194, 212, 0.12);
  --glass-border-hover: rgba(0, 194, 212, 0.28);
}
```

### Componentes Visuales Clave en CSS
*   **Tarjeta Glassmorphic**:
    ```css
    .glass-card {
      background: linear-gradient(135deg, rgba(22,32,53,0.85) 0%, rgba(15, 24, 41, 0.9) 100%);
      backdrop-filter: blur(24px);
      border: 1px solid var(--glass-border);
      border-radius: 1.5rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    ```
*   **Bottom Sheet (Bandeja Deslizable)**:
    Usa un overlay semitraslúcido con desenfoque ligero para no tapar los gráficos del fondo, y una animación de deslizamiento vertical:
    ```css
    .category-sheet-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(8, 13, 26, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1000; display: flex; align-items: flex-end; justify-content: center;
    }
    .category-sheet {
      background: linear-gradient(180deg, rgba(22, 32, 53, 0.95) 0%, rgba(15, 24, 41, 0.98) 100%);
      backdrop-filter: blur(20px);
      width: 100%; max-width: 600px;
      max-height: 65vh;
      border-radius: 1.5rem 1.5rem 0 0; padding: 1.5rem;
      border-top: 1px solid var(--glass-border);
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    ```

---

## 3. Lógica de Negocio y Datos (`src/utils/`)

### A. Estructura del LocalStorage (`storage.js`)
El storage cuenta con migración automática para el campo `incomeSources`. Si un usuario solo tiene el campo `income` numérico legacy, el sistema autogenera una fuente llamada "Ingreso Principal":
```javascript
export const loadData = () => {
  const data = JSON.parse(localStorage.getItem('neo_fintech_data'));
  if (!data.incomeSources || data.incomeSources.length === 0) {
    data.incomeSources = [{ id: 'is-migrated', name: 'Ingreso Principal', amount: data.income || 0 }];
  }
  data.income = data.incomeSources.reduce((sum, s) => sum + s.amount, 0); // Sincroniza total
  return data;
};
```

### B. Motor del 50/30/20 (`financeCalculator.js`)
Calcula los gastos mensuales reales contra los límites teóricos del 50%, 30% y 20%:
1.  **Esenciales**: Filtra transacciones con categoría `esenciales` + suscripciones `esenciales`.
2.  **No Esenciales**: Transacciones `no-esenciales` + suscripciones `no-esenciales` + **cuotas de tarjetas de crédito activas en el mes de análisis**.
3.  **Ahorro**: Transacciones y transferencias con categoría `ahorro`.

---

## 4. Gráficos Highcharts 3D (Configuración Exacta)

### A. Donut 3D (`Dashboard.jsx`)
*   **Efecto 3D**: `options3d: { enabled: true, alpha: 42, beta: 0 }`.
*   **Dimensiones**: `innerSize: '52%'`, `depth: 48`.
*   **Interactividad**: Configurado con `slicedOffset: 14` y un evento de clic sobre el punto para sincronizar la selección con la apertura del Bottom Sheet:
    ```javascript
    point: {
      events: {
        click: function() {
          const nameMap = { 'Esenciales': 'esenciales', 'No Esenciales': 'noEsenciales', 'Ahorro': 'ahorro' };
          toggleCat(nameMap[this.name]); // Setea selectedCat y abre la bandeja
        }
      }
    }
    ```

### B. Área 3D de Ahorro Acumulado (`Dashboard.jsx`)
*   **Efecto 3D**: `options3d: { enabled: true, alpha: 18, beta: 6, depth: 70 }`.
*   **Línea y Relleno**: Línea de grosor `3` color `#00c2d4`, relleno con gradiente vertical de `rgba(0,194,212,0.5)` a transparente.

### C. Columnas de Proyección 3D (`Liquidity.jsx`)
*   **Efecto 3D**: `options3d: { enabled: true, alpha: 8, beta: 10, depth: 50 }`.
*   **Series**: Muestra simultáneamente los Ingresos (Cian), Gastos Proyectados (Índigo) y Saldo Libre (Dorado si $\ge 0$, Rojo si $< 0$).

---

## 5. Arquitectura de Pantallas y Componentes

### 1. `Dashboard.jsx` (Inicio)
*   **Tarjetas Clickables**: La tarjeta de Ingresos y Gastos tienen un puntero `›` dorado (`var(--gold)`). Ingresos navega a la edición de fuentes, y Gastos al Historial de transacciones.
*   **Sincronización del Bottom Sheet**: Al seleccionar una categoría (por clic en la fila de progreso o en la rebanada del donut), se activa la bandeja deslizable mostrando:
    *   *Consumos Variables* (de `transactions` que empiezan con `YYYY-MM`).
    *   *Gastos Fijos* (de `subscriptions`).
    *   *Cuotas de Tarjeta* (calculadas para el mes target indicando número de cuota, ej: `Cuota 2/3`).

### 2. `Liquidity.jsx` (Liquidez)
*   **Cálculo de Proyección a 3 meses**:
    $$\text{Gastos Proyectados} = \text{Total Suscripciones} + \text{Cuotas Tarjetas Activas} + \text{Promedio Gastos Variables de últimos 3 meses}$$
    $$\text{Saldo Libre Proyectado} = \text{Ingresos Totales} - \text{Gastos Proyectados}$$

### 3. `IncomeManager.jsx` & `IncomeSourceForm.jsx` (Gestión de Ingresos)
*   Permite desglosar y editar múltiples fuentes (Sueldo, Sobresueldo, etc.).
*   Al guardar o eliminar fuentes, recalcula el valor `data.income` total en tiempo real para no romper las proyecciones ni el 50/30/20.

---

## 6. Flujo de Navegación y Botón Flotante (FAB)
Para evitar saltos visuales y superposiciones, el botón flotante **`+` (FAB)** se renderiza de forma **centralizada y única** en `App.jsx` debajo del enrutador de pantallas, con comportamiento dinámico basado en la vista actual:
*   Si `currentView === 'dashboard'` $\to$ Abre formulario de transacción.
*   Si `currentView === 'cards'` $\to$ Abre formulario de nueva tarjeta de crédito.
*   Si `currentView === 'goals'` $\to$ Abre formulario de meta/alcancía.
*   Si `currentView === 'income'` $\to$ Abre formulario de fuente de ingreso.
*   Posición constante en pantalla: `position: fixed; bottom: 6rem; right: 1.5rem`.
