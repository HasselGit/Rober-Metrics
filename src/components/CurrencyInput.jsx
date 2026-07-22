import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/financeCalculator';

const CurrencyInput = ({ value, onChange, placeholder = "$ 0,0", className = "input-field", style, disabled }) => {
  const formatDisplay = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
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

    // Filter out non-numeric characters except comma or dot
    // Strip existing currency symbols, spaces, thousand dots
    // Handle es-AR style input where user might type comma or dot
    let digitsOnly = raw.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      setDisplayValue('');
      onChange('');
      return;
    }

    const numericValue = parseFloat(digitsOnly);
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
