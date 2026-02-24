/**
 * Paramount Partner Growth Dashboard - Main Application Logic
 */

let chartInstance = null;
let selectedPlanValue = 50;
let eduSlideIndex = 0;

// Growth Intelligence Data
const eduSlides = [
    {
        title: "How You Get Paid",
        subtitle: "Quick Cash + Stay Bonuses",
        content: `<div class="space-y-4"><div class="stack-bar"><div class="stack-segment bg-total-red" style="width: 12%"></div><div class="stack-segment bg-total-ice" style="width: 88%"></div></div><div class="grid grid-cols-2 gap-4"><div><p class="text-[11px] font-black text-white italic uppercase">50% Quick Cash</p><p class="text-[8px] text-white/40 uppercase leading-none mt-1">Month 1</p></div><div><p class="text-[11px] font-black text-total-ice italic uppercase">375% Stay Bonus</p><p class="text-[8px] text-white/40 uppercase mt-1">Months 2-6</p></div></div><p class="text-[9px] font-bold text-white/50 leading-relaxed uppercase mt-3 italic">Month 1 covers costs. Mo 2 to 6 is pure profit.</p></div>`
    },
    {
        title: "Forever Money (17%)",
        subtitle: "The Paramount Residual Moat",
        content: `<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="bg-black/20 p-3 rounded border border-white/5 text-center"><p class="text-xl font-black italic text-total-ice">8.5%</p><p class="text-[8px] font-black text-white/40 uppercase mt-1 leading-none">Airtime</p></div><div class="bg-black/20 p-3 rounded border border-white/5 text-center"><p class="text-xl font-black italic text-total-ice">8.5%</p><p class="text-[8px] font-black text-white/40 uppercase mt-1 leading-none">Autopay</p></div></div><p class="text-[9px] font-bold text-white/60 text-center uppercase italic leading-tight mt-2">Yield on every active line, every month.</p></div>`
    },
    {
        title: "Portfolio Snowball",
        subtitle: "Wealth stacking in action",
        content: `<div class="space-y-3"><div class="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3"><div class="w-1.5 h-8 bg-total-red rounded"></div><div><p class="text-[11px] font-black text-white italic uppercase leading-none">The Stack Effect</p><p class="text-[8px] text-white/40 font-bold uppercase mt-1 leading-none">Cohorts scale as they overlap</p></div></div><div class="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3"><div class="w-1.5 h-8 bg-total-ice rounded"></div><div><p class="text-[11px] font-black text-white italic uppercase leading-none">Base Value</p><p class="text-[8px] text-white/40 font-bold uppercase mt-1 leading-none">Equity grows with line count</p></div></div></div>`
    },
    {
        title: "Fighter Brand Strategy",
        subtitle: "Winning the Metro and Cricket Market",
        content: `<div class="space-y-4"><div class="bg-black/20 p-3 rounded border border-white/5"><p class="text-[9px] font-bold text-white/60 uppercase italic leading-relaxed">Eliminate customer pain points: <span class="text-total-ice">No Activation Fees</span>, <span class="text-total-ice">No Hidden Taxes</span>, and Verizon speed power.</p></div></div>`
    },
    {
        title: "12X Faster Network",
        subtitle: "Leveraging Verizon 5G Power",
        content: `<div class="space-y-3"><div class="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-total-red"></div><p class="text-[10px] font-bold text-white uppercase italic leading-none">12X Faster Unlimited Data</p></div><p class="text-[9px] font-bold text-white/50 leading-relaxed italic uppercase mt-1">Superior speed drives word-of-mouth growth.</p></div>`
    },
    {
        title: "Success Habits",
        subtitle: "Simple steps for more profit",
        content: `<div class="space-y-2"><div class="bg-white/5 p-2 rounded border border-white/10 flex items-center gap-3 mb-1"><span class="text-total-ice font-black">01</span><span class="text-[9px] font-bold text-white/80 uppercase">Keep Customer 3 Months+</span></div><div class="bg-white/5 p-2 rounded border border-white/10 flex items-center gap-3 mb-1"><span class="text-total-ice font-black">02</span><span class="text-[9px] font-bold text-white/80 uppercase">Sell Family Plans</span></div><div class="bg-white/5 p-2 rounded border border-white/10 flex items-center gap-3"><span class="text-total-ice font-black">03</span><span class="text-[9px] font-bold text-white/80 uppercase">Port-In from competitors</span></div></div>`
    }
];

/**
 * Sync PSA value between input and slider
 */
function syncPSA(val, targetType) {
    let numVal = parseInt(val) || 0;
    if (numVal > 9999) numVal = 9999;
    
    if (targetType === 'input') { 
        document.getElementById('psaInput').value = numVal; 
    } else { 
        document.getElementById('psaSlider').value = Math.min(numVal, 1000); 
        document.getElementById('psaInput').value = numVal;
    }
    
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    runCalculation();
}

/**
 * Main calculation logic for revenue forecasting
 */
function runCalculation() {
    const monthlyPSA = parseInt(document.getElementById('psaInput').value) || 0;
    const planPrice = selectedPlanValue;
    const churnRate = parseInt(document.getElementById('churn').value) / 100;
    document.getElementById('churnDisplay').innerText = (churnRate * 100).toFixed(0) + '%';

    const SPIFF_M1 = 0.50, SPIFF_RET = 0.75, AIRTIME_TOTAL = 0.17, RESIDUAL = 0.03, DEVICE_MARGIN = 10.00;

    let data = [], cumulativeComp = 0, cohorts = new Array(12).fill(0);
    for (let m = 0; m < 12; m++) {
        cohorts[m] = monthlyPSA;
        let monthlyInstant = monthlyPSA * ( (planPrice * SPIFF_M1) + DEVICE_MARGIN );
        let monthlyRetention = 0, monthlyResid = 0, currentActive = 0;
        for (let prev = 0; prev <= m; prev++) {
            let monthsOld = m - prev;
            let survivors = cohorts[prev] * Math.pow(1 - churnRate, monthsOld);
            currentActive += survivors;
            if (monthsOld >= 1 && monthsOld <= 5) monthlyRetention += survivors * (planPrice * SPIFF_RET);
            monthlyResid += survivors * (planPrice * (AIRTIME_TOTAL + RESIDUAL));
        }
        let total = monthlyInstant + monthlyRetention + monthlyResid;
        cumulativeComp += total;
        data.push({ month: m + 1, activeBase: Math.round(currentActive), instant: monthlyInstant, retention: monthlyRetention, resid: monthlyResid, total: total });
    }
    updateUI(data, cumulativeComp);
}

/**
 * Update the DOM elements with calculated data
 */
function updateUI(data, cumulativeComp) {
    const m6 = data[5], plan = selectedPlanValue;
    const valPerAct = (plan * 0.5) + (plan * 0.75 * 5) + 10 + (plan * 0.17 * 6);
    
    document.getElementById('statPerAct').innerText = Math.round(valPerAct).toLocaleString();
    document.getElementById('statM6').innerText = Math.round(m6.total).toLocaleString();
    document.getElementById('statYear').innerText = Math.round(cumulativeComp).toLocaleString();
    
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "roadmap-row";
        let tag = row.month === 1 ? `<span class="milestone-tag">Launch</span>` : (row.month === 6 ? `<span class="milestone-tag" style="background:var(--total-ice)">Peak</span>` : "");
        let growth = row.month > 1 ? `<span class="growth-badge">+${((row.total - data[0].total) / data[0].total * 100).toFixed(0)}%</span>` : "";
        
        tr.innerHTML = `
            <td class="px-8 py-3">
                <div class="flex flex-col">
                    <span class="font-black text-slate-500 italic text-[11px] uppercase leading-none">Month ${row.month < 10 ? '0'+row.month : row.month}</span>
                    ${tag}
                </div>
            </td>
            <td class="px-4 py-3 text-right"><span class="font-bold text-white text-[14px]">${row.activeBase.toLocaleString()}</span></td>
            <td class="px-4 py-3 text-right text-slate-400 font-medium text-[14px]">$${Math.round(row.instant).toLocaleString()}</td>
            <td class="px-4 py-3 text-right text-slate-400 font-medium text-[14px]">$${Math.round(row.retention).toLocaleString()}</td>
            <td class="px-4 py-3 text-right text-slate-400 font-medium text-[14px]">$${Math.round(row.resid).toLocaleString()}</td>
            <td class="pr-10 py-3 text-right">
                <div class="flex flex-col items-end">
                    <span class="font-black text-total-ice text-[16px] leading-tight">$${Math.round(row.total).toLocaleString()}</span>
                    ${growth}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderChart(data);
}

/**
 * Handle Intelligence Deck Slide rendering
 */
function renderEduSlide() {
    const content = document.getElementById('eduContent');
    const indicatorsContainer = document.getElementById('eduIndicators');
    const slide = eduSlides[eduSlideIndex];
    if(!slide || !content) return;
    indicatorsContainer.innerHTML = eduSlides.map((_, i) => `<div class="edu-indicator ${i === eduSlideIndex ? 'active' : ''}"></div>`).join('');
    content.classList.add('edu-fade');
    setTimeout(() => {
        content.innerHTML = `
            <h4 class="text-[10px] font-black uppercase text-total-ice tracking-widest mb-1 italic">Growth Intelligence</h4>
            <p class="text-xl font-black italic text-white mb-1 leading-tight tracking-tight">${slide.title}</p>
            <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-4 italic">${slide.subtitle}</p>
            ${slide.content}
        `;
        content.classList.remove('edu-fade');
    }, 300);
}

/**
 * Chart Visualization using Chart.js
 */
function renderChart(data) {
    const ctx = document.getElementById('compChart');
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(237, 28, 36, 0.4)'); gradient.addColorStop(1, 'rgba(237, 28, 36, 0)');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => 'Month ' + d.month),
            datasets: [{ label: 'Check Total', data: data.map(d => d.total), borderColor: '#ed1c24', borderWidth: 4, fill: true, backgroundColor: gradient, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ed1c24', yAxisID: 'y' },
                       { label: 'Lines', data: data.map(d => d.activeBase), borderColor: '#00a3e0', borderWidth: 3, borderDash: [5, 5], fill: false, yAxisID: 'y1', pointRadius: 4, pointBackgroundColor: '#00a3e0' }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#4b5563', font: { weight: 'bold', size: 10 } }, grid: { display: false } },
                y: { position: 'left', ticks: { color: '#ffffff', font: { weight: 'bold', size: 10 }, callback: v => '$' + v.toLocaleString() }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y1: { position: 'right', display: true, ticks: { color: '#00a3e0', font: { weight: 'bold', size: 10 } }, grid: { display: false } }
            }
        }
    });
}

// Initial Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    document.getElementById('psaInput').addEventListener('input', (e) => syncPSA(e.target.value, 'slider'));
    document.getElementById('psaSlider').addEventListener('input', (e) => syncPSA(e.target.value, 'input'));
    document.getElementById('churn').addEventListener('input', runCalculation);
    
    // Preset Chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const psa = chip.dataset.psa;
            const churn = chip.dataset.churn;
            document.getElementById('psaSlider').value = psa;
            document.getElementById('psaInput').value = psa;
            document.getElementById('churn').value = churn;
            document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            runCalculation();
        });
    });

    // Plan Cards
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPlanValue = parseInt(card.dataset.value);
            runCalculation();
        });
    });

    // Intelligence Carousel
    document.getElementById('nextEduBtn').addEventListener('click', () => {
        eduSlideIndex = (eduSlideIndex + 1) % eduSlides.length;
        renderEduSlide();
    });
    setInterval(() => {
        eduSlideIndex = (eduSlideIndex + 1) % eduSlides.length;
        renderEduSlide();
    }, 30000);

    // Initial Load
    renderEduSlide();
    runCalculation();
});
