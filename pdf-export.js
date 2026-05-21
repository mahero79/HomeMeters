// ── PDF Export Functions (Windows – pdfmake) ──
// Depends on globals: currentLang, readings, houses, activeHouseId,
//   correctionFactor, translations, buildMonthlyConsumption, convertToKwh

function openPdfExport() {
  document.getElementById('analyticsSection').classList.add('hidden');
  document.getElementById('pdfExportSection').classList.remove('hidden');

  // Populate month select
  const pdfMonthEl = document.getElementById('pdfMonthMonth');
  if (pdfMonthEl) {
    const months = translations[currentLang].months || translations['en'].months;
    pdfMonthEl.innerHTML = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    pdfMonthEl.value = new Date().getMonth();
  }

  // Update translations on PDF page
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.dataset.t;
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // Init meter checkboxes based on current house config
  const currentHouse = houses.find(h => h.id === activeHouseId);
  if (currentHouse) {
    const isDual   = (currentHouse.electricityType || 'dual') === 'dual';
    const hasElec  = currentHouse.hasElec  !== false;
    const hasGas   = currentHouse.hasGas   !== false;
    const hasWater = currentHouse.hasWater !== false;

    const dayLbl    = document.getElementById('pdfElecDayLabel');
    const nightLbl  = document.getElementById('pdfElecNightLabel');
    const singleLbl = document.getElementById('pdfElecSingleLabel');
    if (dayLbl)    dayLbl.style.display    = (hasElec && isDual)  ? 'flex' : 'none';
    if (nightLbl)  nightLbl.style.display  = (hasElec && isDual)  ? 'flex' : 'none';
    if (singleLbl) singleLbl.style.display = (hasElec && !isDual) ? 'flex' : 'none';

    // Uncheck all meters — user selects manually
    ['pdfElecDay','pdfElecNight','pdfElecSingle','pdfGas','pdfWater'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });

    const gasLbl   = document.getElementById('pdfGasLabel');
    const waterLbl = document.getElementById('pdfWaterLabel');
    if (gasLbl)   gasLbl.style.display   = hasGas   ? 'flex' : 'none';
    if (waterLbl) waterLbl.style.display = hasWater ? 'flex' : 'none';
  }
}

function closePdfExport() {
  document.getElementById('pdfExportSection').classList.add('hidden');
  document.getElementById('analyticsSection').classList.remove('hidden');
}

function onPdfPeriodChange() {
  const val = document.getElementById('pdfPeriodFilter').value;
  ['pdfFilterMonth','pdfFilterQuarter','pdfFilterHalf','pdfFilterYear','pdfFilterCustom'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  const map = {
    month:   'pdfFilterMonth',
    quarter: 'pdfFilterQuarter',
    half:    'pdfFilterHalf',
    year:    'pdfFilterYear',
    custom:  'pdfFilterCustom'
  };
  document.getElementById(map[val]).classList.remove('hidden');
}

function getPdfPeriod() {
  const pf         = document.getElementById('pdfPeriodFilter').value;
  const t          = translations[currentLang];
  const shortNames = t.months || translations['en'].months;
  let startDate, endDate, numMonths, periodLabel;

  if (pf === 'month') {
    const y = parseInt(document.getElementById('pdfMonthYear').value);
    const m = parseInt(document.getElementById('pdfMonthMonth').value);
    if (!y || isNaN(y)) return null;
    startDate   = new Date(y, m, 1);
    endDate     = new Date(y, m + 1, 0, 23, 59, 59);
    numMonths   = 1;
    periodLabel = `${shortNames[m]} ${y}`;

  } else if (pf === 'quarter') {
    const y = parseInt(document.getElementById('pdfQuarterYear').value);
    const q = parseInt(document.getElementById('pdfQuarterQ').value);
    if (!y || isNaN(y)) return null;
    const startM = (q - 1) * 3;
    startDate   = new Date(y, startM, 1);
    endDate     = new Date(y, startM + 3, 0, 23, 59, 59);
    numMonths   = 3;
    periodLabel = `Q${q} ${y}`;

  } else if (pf === 'half') {
    const y = parseInt(document.getElementById('pdfHalfYear').value);
    const h = parseInt(document.getElementById('pdfHalfH').value);
    if (!y || isNaN(y)) return null;
    const startM = (h - 1) * 6;
    startDate   = new Date(y, startM, 1);
    endDate     = new Date(y, startM + 6, 0, 23, 59, 59);
    numMonths   = 6;
    periodLabel = `H${h} ${y}`;

  } else if (pf === 'year') {
    const y = parseInt(document.getElementById('pdfYearY').value);
    if (!y || isNaN(y)) return null;
    startDate   = new Date(y, 0, 1);
    endDate     = new Date(y, 12, 0, 23, 59, 59);
    numMonths   = 12;
    periodLabel = `${y}`;

  } else {
    // custom
    const fromVal = document.getElementById('pdfDateFrom').value;
    const toVal   = document.getElementById('pdfDateTo').value;
    if (!fromVal || !toVal) return null;
    startDate = new Date(fromVal);
    endDate   = new Date(toVal);
    endDate.setHours(23, 59, 59);
    numMonths = Math.max(1,
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) + 1);
    periodLabel = `${fromVal} \u2192 ${toVal}`;
  }

  return { startDate, endDate, numMonths, periodLabel };
}

function fixArabicWords(text) {
  if (!text) return text;
  return text.split(' ').reverse().join(' ');
}

// ── Renders a Chart.js bar chart to an offscreen canvas and returns base64 PNG ──
function buildChartImage(meterInfo, monthlyData) {
  return new Promise(resolve => {
    const offCanvas  = document.createElement('canvas');
    offCanvas.width  = 520;
    offCanvas.height = 220;

    const chartColors = {
      electricity_day:    { bg: 'rgba(247,37,133,0.85)',  border: '#f72585' },
      electricity_night:  { bg: 'rgba(181,23,158,0.85)',  border: '#b5179e' },
      electricity_single: { bg: 'rgba(247,37,133,0.85)',  border: '#f72585' },
      gas:                { bg: 'rgba(255,107,53,0.85)',   border: '#ff6b35' },
      water:              { bg: 'rgba(0,180,216,0.85)',    border: '#00b4d8' }
    };
    const clr = chartColors[meterInfo.key] || chartColors['electricity_day'];

    const tempChart = new Chart(offCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: meterInfo.label,
          data:  monthlyData.data,
          backgroundColor: clr.bg,
          borderColor:     clr.border,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        animation: false,
        responsive: false,
        plugins: {
          legend: {
            labels: { color: '#333333', font: { size: 11, weight: 'bold' } }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#333333', font: { size: 10 } },
            grid:  { color: 'rgba(0,0,0,0.1)' }
          },
          x: {
            ticks: { color: '#333333', font: { size: 10 }, maxRotation: 30 },
            grid:  { color: 'rgba(0,0,0,0.08)' }
          }
        }
      }
    });

    // One animation frame is enough for Chart.js to finish even with animation: false
    requestAnimationFrame(() => {
      const dataURL = offCanvas.toDataURL('image/png');
      tempChart.destroy();
      resolve(dataURL);
    });
  });
}

async function generatePDF() {
  try {
  const period = getPdfPeriod();
  if (!period) {
    alert(currentLang === 'ar' ? '\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0633\u0646\u0629 \u0623\u0648\u0644\u0627\u064B' :
          currentLang === 'nl' ? 'Voer eerst een jaar in' :
          currentLang === 'fr' ? 'Veuillez entrer une ann\u00E9e' :
          'Please enter a year first');
    return;
  }

  const { startDate, endDate, numMonths, periodLabel } = period;
  const t     = translations[currentLang];
  const isRTL = currentLang === 'ar';

  if (typeof pdfMake === 'undefined') {
    alert('PDF library not loaded');
    return;
  }

  const includeSummary = document.getElementById('pdfIncludeSummary').checked;
  const includeTable   = document.getElementById('pdfIncludeTable').checked;
  const includeChart   = document.getElementById('pdfIncludeChart').checked;

  // Build selected meters list
  const selectedMeters = [];
  if (document.getElementById('pdfElecDay')?.checked)
    selectedMeters.push({ key: 'electricity_day',    meter: 'electricity', period: 'day',    label: t.electricityDay   || 'Electricity \u2013 Day',   unit: 'kWh',   isGas: false });
  if (document.getElementById('pdfElecNight')?.checked)
    selectedMeters.push({ key: 'electricity_night',  meter: 'electricity', period: 'night',  label: t.electricityNight || 'Electricity \u2013 Night', unit: 'kWh',   isGas: false });
  if (document.getElementById('pdfElecSingle')?.checked)
    selectedMeters.push({ key: 'electricity_single', meter: 'electricity', period: 'single', label: t.electricity      || 'Electricity',              unit: 'kWh',   isGas: false });
  if (document.getElementById('pdfGas')?.checked)
    selectedMeters.push({ key: 'gas',   meter: 'gas',   period: null, label: t.gas   || 'Gas',   unit: 'm\u00B3', isGas: true  });
  if (document.getElementById('pdfWater')?.checked)
    selectedMeters.push({ key: 'water', meter: 'water', period: null, label: t.water || 'Water', unit: 'm\u00B3', isGas: false });

  if (selectedMeters.length === 0) {
    alert(currentLang === 'ar' ? '\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0639\u062F\u0627\u062F \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644' :
          currentLang === 'nl' ? 'Selecteer minimaal \u00E9\u00E9n meter' :
          currentLang === 'fr' ? 'S\u00E9lectionnez au moins un compteur' :
          'Please select at least one meter');
    return;
  }

  // ── Load Arabic font from almarai-font-data.js ──
  if (isRTL) {
    if (window.almaraiFontData) {
      pdfMake.vfs['Almarai-Regular.ttf'] = window.almaraiFontData;
    } else {
      console.error('Could not load Almarai font: window.almaraiFontData not found');
    }
  }

  pdfMake.fonts = {
    Almarai: {
      normal: 'Almarai-Regular.ttf',
      bold:   'Almarai-Regular.ttf'
    },
    Roboto: {
      normal:      'Roboto-Regular.ttf',
      bold:        'Roboto-Medium.ttf',
      italics:     'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    }
  };

  const font  = isRTL ? 'Almarai' : 'Roboto';
  const align = isRTL ? 'right' : 'left';

  // Format today's date
  const dateObj = new Date();
  const dd   = String(dateObj.getDate()).padStart(2, '0');
  const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const today = (currentLang === 'ar')
    ? `${yyyy}/${mm}/${dd}`
    : `${dd}/${mm}/${yyyy}`;

  // ── House info ──
  const pdfHouse  = houses.find(h => h.id === activeHouseId);
  const houseName = pdfHouse ? (pdfHouse.name || '') : '';
  const houseAddr = pdfHouse
    ? [pdfHouse.street, pdfHouse.number, pdfHouse.city, pdfHouse.postal].filter(Boolean).join(' ')
    : '';

  const docContent = [];

  // ── Header banner ──
  docContent.push({
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          {
            text: isRTL
              ? fixArabicWords(t.pdfReportTitle || '\u0639\u062F\u0627\u062F\u0627\u062A\u064A \u2013 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643')
              : (t.pdfReportTitle || 'Home Meters - Consumption Report'),
            font, fontSize: 16, bold: true, color: '#ffffff', alignment: 'center'
          },
          {
            text: isRTL
              ? [
                  { text: fixArabicWords(t.pdfPeriod || '\u0627\u0644\u0641\u062A\u0631\u0629'), font },
                  { text: ': ', font: 'Roboto' },
                  { text: periodLabel, font: 'Roboto' }
                ]
              : `${t.pdfPeriod || 'Period'}: ${periodLabel}`,
            font, fontSize: 11, color: '#ddddff', alignment: 'center', margin: [0, 4, 0, 0]
          }
        ],
        fillColor: '#323250',
        margin: [10, 12, 10, 12]
      }]]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 4]
  });

  // ── House name / address ──
  if (houseName || houseAddr) {
    const houseStack = [];
    if (houseName) houseStack.push({
      text: isRTL ? houseName : houseName,
      font, fontSize: 12, bold: true, color: '#323250', alignment: 'center'
    });
    if (houseAddr) houseStack.push({
      text: isRTL ? houseAddr : houseAddr,
      font, fontSize: 10, color: '#555577', alignment: 'center', margin: [0, 2, 0, 0]
    });
    docContent.push({ stack: houseStack, margin: [0, 0, 0, 8] });
  }

  // ── Generated-on date ──
  docContent.push({
    text: isRTL
      ? [
          { text: fixArabicWords(t.pdfGeneratedOn || '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0648\u0644\u064A\u062F'), font, fontSize: 9, color: '#888888' },
          { text: ': ', font: 'Roboto', fontSize: 9, color: '#888888' },
          { text: today, font: 'Roboto', fontSize: 9, color: '#888888' }
        ]
      : `${t.pdfGeneratedOn || 'Generated on'}: ${today}`,
    font, fontSize: 9, color: '#888888', alignment: align, margin: [0, 0, 0, 10]
  });

  // ── Each selected meter ──
  for (const meterInfo of selectedMeters) {
    const allForMeter = readings.filter(r =>
      r.meter === meterInfo.meter &&
      (meterInfo.period ? r.period === meterInfo.period : !r.period)
    );

    if (allForMeter.length === 0) continue;

    // Raw data (m³ for gas) for summary + table
    const monthlyDataRaw   = buildMonthlyConsumption(allForMeter, startDate, endDate, false);
    // Converted data (kWh for gas) for chart display
    const monthlyDataChart = buildMonthlyConsumption(allForMeter, startDate, endDate, meterInfo.isGas);

    const total = monthlyDataRaw.data.reduce((s, v) => s + parseFloat(v || 0), 0);
    const avg   = total / numMonths;

    // ── Meter section header ──
    docContent.push({
      table: {
        widths: ['*'],
        body: [[{
          text: isRTL ? meterInfo.label : meterInfo.label,
          font, fontSize: 12, bold: true,
          color: '#323250', fillColor: '#f0f0f5',
          margin: [8, 6, 8, 6], alignment: align
        }]]
      },
      layout: 'noBorders',
      margin: [0, 8, 0, 4]
    });

    // ── Summary box ──
    if (includeSummary) {
      docContent.push({
        columns: [
          {
            stack: [
              {
                text: isRTL
                  ? fixArabicWords(t.pdfTotal || '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643')
                  : (t.pdfTotal || 'Total Consumption'),
                font, fontSize: 8, color: '#888888', alignment: 'center'
              },
              {
                text: `${total.toFixed(1)} ${meterInfo.unit}`,
                font: 'Roboto', fontSize: 13, bold: true, color: '#323250', alignment: 'center'
              }
            ],
            width: '*', margin: [2, 4, 2, 4]
          },
          {
            stack: [
              {
                text: isRTL
                  ? fixArabicWords(t.pdfAvg || '\u0627\u0644\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0634\u0647\u0631\u064A')
                  : (t.pdfAvg || 'Monthly Average'),
                font, fontSize: 8, color: '#888888', alignment: 'center'
              },
              {
                text: `${avg.toFixed(1)} ${meterInfo.unit}`,
                font: 'Roboto', fontSize: 13, bold: true, color: '#323250', alignment: 'center'
              }
            ],
            width: '*', margin: [2, 4, 2, 4]
          }
        ],
        margin: [0, 0, 0, 6]
      });
    }

    // ── Monthly table ──
    if (includeTable && monthlyDataRaw.labels.length > 0) {
      const monthHdrCell = {
        text: isRTL
          ? (t.pdfMonth || '\u0627\u0644\u0634\u0647\u0631')
          : (t.pdfMonth || 'Month'),
        font, bold: true, color: '#ffffff', fillColor: '#323250', alignment: 'center'
      };
      const consumpHdrCell = {
        text: isRTL
          ? [
              { text: (t.pdfConsumption || '\u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643'), font, bold: true },
              { text: ` (${meterInfo.unit})`, font: 'Roboto', bold: true }
            ]
          : `${t.pdfConsumption || 'Consumption'} (${meterInfo.unit})`,
        font, bold: true, color: '#ffffff', fillColor: '#323250', alignment: 'center'
      };

      const tableBody = [isRTL ? [consumpHdrCell, monthHdrCell] : [monthHdrCell, consumpHdrCell]];

      monthlyDataRaw.labels.forEach((label, i) => {
        const val = parseFloat(monthlyDataRaw.data[i] || 0).toFixed(1);
        const bg  = i % 2 === 0 ? '#ffffff' : '#f8f8fc';

        // Split "MonthName\u00A0Year" for RTL mixed rendering
        const parts     = label.split('\u00A0');
        const monthName = parts[0] || label;
        const yearNum   = parts[1] || '';

        const cellLabel = (isRTL && yearNum)
          ? {
              text: [{ text: monthName, font }, { text: ' ' + yearNum, font: 'Roboto' }],
              fontSize: 10, alignment: 'center', fillColor: bg
            }
          : { text: label, font, fontSize: 10, alignment: 'center', fillColor: bg };

        const valCell = {
          text: `${val} ${meterInfo.unit}`,
          font: 'Roboto', fontSize: 10, alignment: 'center', fillColor: bg
        };

        tableBody.push(isRTL ? [valCell, cellLabel] : [cellLabel, valCell]);
      });

      docContent.push({
        table: { headerRows: 1, widths: ['*', '*'], body: tableBody },
        layout: { hLineColor: '#eeeeee', vLineColor: '#eeeeee' },
        margin: [0, 0, 0, 10]
      });
    }

    // ── Bar chart (canvas → base64 → pdfmake image) ──
    if (includeChart && monthlyDataChart.labels.length > 0) {
      try {
        const chartImg = await buildChartImage(meterInfo, monthlyDataChart);
        docContent.push({
          image: chartImg,
          width: 500,
          alignment: 'center',
          margin: [0, 4, 0, 12]
        });
      } catch (e) {
        console.warn('Chart render failed for', meterInfo.key, e);
      }
    }
  }

  // ── Footer ──
  docContent.push({
    text: 'Home Meters Pro',
    font, fontSize: 9, color: '#aaaaaa', alignment: 'center', margin: [0, 10, 0, 0]
  });

  const docDef = {
    content: docContent,
    defaultStyle: { font, fontSize: 10 },
    pageMargins: [15, 15, 15, 15]
  };

  const pdfNow  = new Date();
  const pdfDate = pdfNow.toISOString().split('T')[0];
  const pdfTime = pdfNow.toTimeString().slice(0, 8).replace(/:/g, '-');
  const safeLabel = periodLabel
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[\s\/\\:*?"<>|]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'report';
  const filename = `HomeMeters_${safeLabel}_${pdfDate}_${pdfTime}.pdf`;

  pdfMake.createPdf(docDef).download(filename);

  } catch (e) {
    console.error('generatePDF error:', e);
    alert(
      (currentLang === 'ar' ? 'فشل إنشاء PDF:\n' :
       currentLang === 'nl' ? 'PDF-fout:\n' :
       currentLang === 'fr' ? 'Erreur PDF :\n' :
       'PDF generation failed:\n')
      + (e.message || String(e))
    );
  }
}
