/**
 * MOVAI Admin - Charts (Chart.js Integration)
 */

const ChartColors = {
  primary: '#0A2342',
  secondary: '#1565C0',
  accent: '#1976D2',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  purple: '#7C3AED',
  gray: '#6B7280',
  palette: ['#1565C0', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED', '#0A2342', '#06B6D4', '#EC4899'],
  paletteBg: ['rgba(21,101,192,.15)', 'rgba(22,163,74,.15)', 'rgba(245,158,11,.15)', 'rgba(220,38,38,.15)', 'rgba(124,58,237,.15)', 'rgba(10,35,66,.15)', 'rgba(6,182,212,.15)', 'rgba(236,72,153,.15)'],
};

const ChartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: "'Inter', sans-serif", size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
    tooltip: { backgroundColor: '#1F2937', titleFont: { family: "'Inter', sans-serif" }, bodyFont: { family: "'Inter', sans-serif" }, padding: 10, cornerRadius: 6 }
  }
};

function createBarChart(ctx, labels, datasets, options = {}) {
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      ...ChartDefaults,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      },
      ...options
    }
  });
}

function createLineChart(ctx, labels, datasets, options = {}) {
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...ChartDefaults,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      },
      elements: { line: { tension: .3 }, point: { radius: 4, hoverRadius: 6 } },
      ...options
    }
  });
}

function createDoughnutChart(ctx, labels, data, options = {}) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ChartColors.palette.slice(0, data.length),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      ...ChartDefaults,
      cutout: '65%',
      plugins: { ...ChartDefaults.plugins, legend: { ...ChartDefaults.plugins.legend, position: 'bottom' } },
      ...options
    }
  });
}

function createPieChart(ctx, labels, data, options = {}) {
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ChartColors.palette.slice(0, data.length),
        borderWidth: 1,
        borderColor: '#fff',
      }]
    },
    options: {
      ...ChartDefaults,
      plugins: { ...ChartDefaults.plugins, legend: { ...ChartDefaults.plugins.legend, position: 'bottom' } },
      ...options
    }
  });
}

// Helper to destroy chart before re-creating
function destroyChart(chartInstance) {
  if (chartInstance) chartInstance.destroy();
  return null;
}
