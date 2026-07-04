import { useState, useMemo } from 'react';
import { Calculator, ArrowRightLeft } from 'lucide-react';

const CATEGORIES = {
  area: {
    label: 'Land Area',
    units: {
      acre: { label: 'Acre', toBase: (v) => v * 4046.86 },
      hectare: { label: 'Hectare', toBase: (v) => v * 10000 },
      sqft: { label: 'Square Feet', toBase: (v) => v * 0.092903 },
      cent: { label: 'Cent', toBase: (v) => v * 40.4686 },
      guntha: { label: 'Guntha', toBase: (v) => v * 101.17 },
    },
    baseUnit: 'sqm',
  },
  weight: {
    label: 'Weight',
    units: {
      kg: { label: 'Kilogram (kg)', toBase: (v) => v },
      quintal: { label: 'Quintal', toBase: (v) => v * 100 },
      ton: { label: 'Metric Ton', toBase: (v) => v * 1000 },
      maund: { label: 'Maund (40 kg)', toBase: (v) => v * 40 },
    },
    baseUnit: 'kg',
  },
  volume: {
    label: 'Volume / Irrigation',
    units: {
      liter: { label: 'Liter', toBase: (v) => v },
      gallon: { label: 'Gallon (US)', toBase: (v) => v * 3.78541 },
      cubicmeter: { label: 'Cubic Meter', toBase: (v) => v * 1000 },
    },
    baseUnit: 'liter',
  },
  fertilizerRate: {
    label: 'Fertilizer / Seed Rate',
    units: {
      kgPerAcre: { label: 'kg per Acre', toBase: (v) => v / 4046.86 },
      kgPerHectare: { label: 'kg per Hectare', toBase: (v) => v / 10000 },
    },
    baseUnit: 'kgPerSqm',
  },
  yield: {
    label: 'Yield',
    units: {
      quintalPerAcre: { label: 'Quintal per Acre', toBase: (v) => (v * 100) / 4046.86 },
      tonPerHectare: { label: 'Ton per Hectare', toBase: (v) => (v * 1000) / 10000 },
      kgPerHectare: { label: 'kg per Hectare', toBase: (v) => v / 10000 },
    },
    baseUnit: 'kgPerSqm',
  },
};

function convert(value, fromUnit, toUnit, category) {
  const cat = CATEGORIES[category];
  if (!cat || value === '' || isNaN(Number(value))) return null;
  const num = Number(value);
  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return null;
  const base = from.toBase(num);
  const fromBaseToTarget = Object.entries(cat.units).find(([k]) => k === toUnit)?.[1];
  if (!fromBaseToTarget) return null;
  // Reverse: find multiplier by testing with 1
  const testBase = fromBaseToTarget.toBase(1);
  return base / testBase;
}

export default function UnitConverter() {
  const [category, setCategory] = useState('area');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('acre');
  const [toUnit, setToUnit] = useState('hectare');

  const unitKeys = Object.keys(CATEGORIES[category].units);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const keys = Object.keys(CATEGORIES[cat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
    setValue('1');
  };

  const result = useMemo(
    () => convert(value, fromUnit, toUnit, category),
    [value, fromUnit, toUnit, category]
  );

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const formatResult = (num) => {
    if (num === null) return '—';
    if (Math.abs(num) >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <section className="text-center space-y-3">
        <div className="inline-flex items-center justify-center bg-sage-700 text-white p-3 rounded-full mb-2">
          <Calculator size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl text-terracotta">Agriculture Unit Converter</h1>
        <p className="text-charcoal/80">
          Convert land area, weight, irrigation volume, fertilizer rates, and yield units instantly.
        </p>
      </section>

      <section className="card-surface p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-150 ${
                  category === key
                    ? 'bg-sage-700 text-white hover:bg-sage-500 active:bg-sage-400'
                    : 'bg-wheat-700 text-charcoal hover:bg-wheat-500 active:bg-wheat-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Value</label>
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field text-lg"
            placeholder="Enter value"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="input-field"
            >
              {unitKeys.map((key) => (
                <option key={key} value={key}>
                  {CATEGORIES[category].units[key].label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swapUnits}
            className="btn-secondary p-3 mx-auto md:mb-1"
            aria-label="Swap units"
          >
            <ArrowRightLeft size={20} />
          </button>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="input-field"
            >
              {unitKeys.map((key) => (
                <option key={key} value={key}>
                  {CATEGORIES[category].units[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-sage-700/10 border border-sage/30 rounded-organic p-6 text-center">
          <p className="text-sm text-charcoal/60 uppercase tracking-wider mb-2">Result</p>
          <p className="text-3xl font-serif text-terracotta font-semibold">
            {formatResult(result)}{' '}
            <span className="text-lg text-charcoal/70 font-sans">
              {CATEGORIES[category].units[toUnit]?.label}
            </span>
          </p>
          {value && result !== null && (
            <p className="text-sm text-charcoal/50 mt-2">
              {value} {CATEGORIES[category].units[fromUnit]?.label} = {formatResult(result)}{' '}
              {CATEGORIES[category].units[toUnit]?.label}
            </p>
          )}
        </div>
      </section>

      <section className="card-surface p-6 text-sm text-charcoal/70 space-y-2">
        <h2 className="font-serif text-lg text-charcoal">Quick Reference</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>1 acre = 0.4047 hectare = 43,560 sq ft ≈ 40.47 cents</li>
          <li>1 quintal = 100 kg | 1 maund ≈ 40 kg (regional)</li>
          <li>1 cubic meter = 1,000 liters ≈ 264 gallons</li>
          <li>kg/acre to kg/hectare: multiply by 2.471</li>
        </ul>
      </section>
    </div>
  );
}
