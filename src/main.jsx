import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import Highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';

if (typeof Highcharts === 'object') {
    highcharts3d(Highcharts);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
