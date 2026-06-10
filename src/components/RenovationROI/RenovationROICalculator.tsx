import { useState, useMemo } from 'react';
import {
  DEFAULT_RENOVATION_ROI_INPUTS,
  calcRenovationROI,
  type RenovationROIInputs,
} from '../../lib/renovation-roi';
import { validateRenovationROIInputs, hasErrors } from '../../lib/validation';
import { RenovationROIInputs as RenovationROIInputsPanel } from './RenovationROIInputs';
import { RenovationROISummary } from './RenovationROISummary';
import { RenovationROIChart } from './RenovationROIChart';
import { RenovationROITable } from './RenovationROITable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

async function captureChartPng(): Promise<string | null> {
  const svg = document.querySelector<SVGSVGElement>('.recharts-wrapper > svg');
  if (!svg) return null;

  const w = svg.clientWidth || 800;
  const h = svg.clientHeight || 300;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'oklch(20% 0.01 240)';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function buildXlsx(
  inputs: RenovationROIInputs,
  result: ReturnType<typeof calcRenovationROI>,
  chartPng: string | null,
): Promise<ArrayBuffer> {
  const { default: ExcelJS } = await import('exceljs');
  const today = new Date().toISOString().split('T')[0];

  const wb = new ExcelJS.Workbook();
  wb.creator = 'nestmath.app';
  wb.created = new Date();

  const ws = wb.addWorksheet('Renovation ROI');
  ws.columns = [
    { key: 'a', width: 30 },
    { key: 'b', width: 20 },
    { key: 'c', width: 14 },
    { key: 'd', width: 14 },
    { key: 'e', width: 16 },
    { key: 'f', width: 16 },
    { key: 'g', width: 16 },
    { key: 'h', width: 14 },
  ];

  ws.addRow(['Renovation ROI vs. Investing Analysis', `Generated: ${today}`]).getCell(1).font = { bold: true };
  ws.addRow([]);
  ws.addRow(['--- Inputs ---']).getCell(1).font = { bold: true };
  ws.addRow(['Renovation cost', cur.format(inputs.renovationCost)]);
  ws.addRow(['Current home value', cur.format(inputs.homeValue)]);
  ws.addRow(['Expected value increase', `${(inputs.valueIncreasePct * 100).toFixed(2)}%`]);
  ws.addRow(['Years until planned sale', inputs.yearsUntilSale]);
  ws.addRow(['Annual home appreciation', `${(inputs.annualAppreciation * 100).toFixed(2)}%`]);
  ws.addRow(['Annual investment return', `${(inputs.annualInvestReturn * 100).toFixed(2)}%`]);
  ws.addRow([]);
  ws.addRow(['--- Summary ---']).getCell(1).font = { bold: true };
  ws.addRow(['Renovation ROI %', `${result.renoROIPct.toFixed(1)}%`]);
  ws.addRow(['Renovation net gain', result.renoNetGain >= 0 ? `+${cur.format(result.renoNetGain)}` : cur.format(result.renoNetGain)]);
  ws.addRow(['Investment net gain', `+${cur.format(result.investNetGain)}`]);
  ws.addRow(['Winner', result.renoWins ? 'Renovation' : 'Invest']);
  ws.addRow(['Winner advantage', `+${cur.format(result.delta)}`]);

  if (chartPng) {
    const imgId = wb.addImage({ base64: chartPng.replace(/^data:image\/png;base64,/, ''), extension: 'png' });
    ws.addImage(imgId, { tl: { col: 2, row: 0 }, ext: { width: 700, height: 340 } });
  }

  if (result.years.length > 0) {
    ws.addRow([]);
    const headerRow = ws.addRow(['Year', 'Home Value (w/ Reno)', 'Renovation Gain', 'Reno Net Gain', 'Investment Value', 'Invest Net Gain', 'Delta']);
    headerRow.eachCell(cell => { cell.font = { bold: true }; });
    for (const y of result.years) {
      ws.addRow([
        y.year,
        cur.format(y.homeValueWithReno),
        cur.format(y.renovationGain),
        y.renovationNetGain >= 0 ? `+${cur.format(y.renovationNetGain)}` : cur.format(y.renovationNetGain),
        cur.format(y.investmentValue),
        `+${cur.format(y.investmentNetGain)}`,
        y.delta >= 0 ? `+${cur.format(y.delta)}` : cur.format(y.delta),
      ]);
    }
  }

  return wb.xlsx.writeBuffer();
}

export function RenovationROICalculator() {
  const [inputs, setInputs] = useState<RenovationROIInputs>(DEFAULT_RENOVATION_ROI_INPUTS);
  const [exporting, setExporting] = useState(false);

  function handleChange(key: keyof RenovationROIInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRenovationROIInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRenovationROI(inputs)),
    [inputs, errors],
  );

  const today = new Date().toISOString().split('T')[0];

  async function handleExport() {
    if (!result || exporting) return;
    setExporting(true);
    try {
      const chartPng = await captureChartPng();
      const buffer = await buildXlsx(inputs, result, chartPng);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renovation-roi-${today}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Renovation ROI vs. Investing Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your renovation cost, the expected value increase to your home, and your planned years until sale to see whether the renovation outperforms putting that same cash in the market, with a year-by-year comparison of both paths.</p>
        </div>
        <div data-print="hide" className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            disabled={!result || exporting}
            className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{exporting ? 'hourglass_empty' : 'download'}</span>
            {exporting ? 'Exporting…' : 'Download XLSX'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Main bento grid */}
      <div
        data-print="title"
        data-print-title="Renovation ROI vs. Investing Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RenovationROIInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RenovationROISummary result={result} yearsUntilSale={inputs.yearsUntilSale} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RenovationROIChart result={result} yearsUntilSale={inputs.yearsUntilSale} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this helped you make your renovation decision," />}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RenovationROITable result={result} />
        </div>
      )}

    </div>
  );
}
