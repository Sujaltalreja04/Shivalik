import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function EMICalculator() {
  const [propertyPrice, setPropertyPrice] = useState(15000000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const downPaymentAmt = (propertyPrice * downPaymentPct) / 100;
  const principal = propertyPrice - downPaymentAmt;
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="glass-card emi-calculator">
      <div className="flex align-center gap-2 mb-4">
        <Calculator className="text-gold" />
        <h3>EMI & Affordability Calculator</h3>
      </div>
      
      <div className="form-group mb-3">
        <label>Property Value: {formatCurrency(propertyPrice)}</label>
        <input type="range" min="5000000" max="50000000" step="500000" value={propertyPrice} onChange={e => setPropertyPrice(Number(e.target.value))} className="w-100 mt-1" />
      </div>

      <div className="form-group mb-3">
        <label>Down Payment ({downPaymentPct}%): {formatCurrency(downPaymentAmt)}</label>
        <input type="range" min="10" max="90" step="5" value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} className="w-100 mt-1" />
      </div>

      <div className="form-row mb-4">
        <div className="form-group col">
          <label>Interest Rate (%)</label>
          <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
        </div>
        <div className="form-group col">
          <label>Loan Tenure (Years)</label>
          <input type="number" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} />
        </div>
      </div>

      <div className="emi-results p-3" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', border: '1px solid var(--color-accent)' }}>
        <div className="flex justify-between mb-2">
          <span className="text-muted">Monthly EMI</span>
          <span className="font-bold text-gold" style={{ fontSize: '1.2rem' }}>{formatCurrency(emi)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-muted font-small">Principal Amount</span>
          <span className="font-small">{formatCurrency(principal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted font-small">Total Interest</span>
          <span className="font-small">{formatCurrency(totalInterest)}</span>
        </div>
      </div>
    </div>
  );
}
