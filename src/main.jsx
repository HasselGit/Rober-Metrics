import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import Highcharts from 'highcharts';
import * as Highcharts3D from 'highcharts/highcharts-3d';

if (typeof Highcharts === 'object') {
    const init3D = typeof Highcharts3D === 'function' ? Highcharts3D : (Highcharts3D.default || Highcharts3D);
    if (typeof init3D === 'function') {
        init3D(Highcharts);
    }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
