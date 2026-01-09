import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Enhanced theme-aware chart configuration
export const chartColors = {
  primary: 'hsl(43, 74%, 52%)',
  primaryRgb: '212, 175, 55',
  success: 'hsl(142, 76%, 36%)',
  successRgb: '34, 197, 94',
  destructive: 'hsl(0, 72%, 51%)',
  destructiveRgb: '239, 68, 68',
  accent: 'hsl(199, 89%, 48%)',
  accentRgb: '14, 165, 233',
  muted: 'hsl(215, 20%, 55%)',
  mutedRgb: '148, 163, 184',
  border: 'hsl(217, 33%, 20%)',
  borderRgb: '45, 55, 72',
  background: 'hsl(222, 47%, 9%)',
  backgroundRgb: '15, 23, 42',
};

// Create gradient for line/bar charts
export const createGradient = (ctx: CanvasRenderingContext2D, colorRgb: string, height: number = 300) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(${colorRgb}, 0.4)`);
  gradient.addColorStop(0.5, `rgba(${colorRgb}, 0.15)`);
  gradient.addColorStop(1, `rgba(${colorRgb}, 0)`);
  return gradient;
};

// Enhanced default options with animations
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: 'easeOutQuart' as const,
  },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        color: chartColors.muted,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: 500,
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: `rgba(${chartColors.primaryRgb}, 0.3)`,
      borderWidth: 1,
      titleColor: '#fff',
      titleFont: {
        size: 13,
        weight: 600,
        family: "'Inter', sans-serif",
      },
      bodyColor: chartColors.muted,
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      padding: 14,
      cornerRadius: 10,
      boxPadding: 6,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: chartColors.muted,
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: `rgba(${chartColors.borderRgb}, 0.5)`,
        drawBorder: false,
      },
      ticks: {
        color: chartColors.muted,
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
        padding: 12,
      },
      border: {
        display: false,
      },
    },
  },
};

// Enhanced radar options
export const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: `rgba(${chartColors.primaryRgb}, 0.3)`,
      borderWidth: 1,
      titleColor: '#fff',
      titleFont: {
        size: 13,
        weight: 600,
        family: "'Inter', sans-serif",
      },
      bodyColor: chartColors.muted,
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      padding: 14,
      cornerRadius: 10,
      boxPadding: 6,
    },
  },
  scales: {
    r: {
      angleLines: {
        color: 'rgba(255, 255, 255, 0.06)',
        lineWidth: 1,
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
        circular: true,
        lineWidth: 1,
      },
      pointLabels: {
        color: chartColors.muted,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: 500,
        },
        padding: 12,
      },
      ticks: {
        display: false,
        stepSize: 20,
      },
      suggestedMin: 0,
      suggestedMax: 100,
    },
  },
};

// Enhanced pie/doughnut options
export const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 800,
    easing: 'easeOutQuart' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: `rgba(${chartColors.primaryRgb}, 0.3)`,
      borderWidth: 1,
      titleColor: '#fff',
      titleFont: {
        size: 13,
        weight: 600,
        family: "'Inter', sans-serif",
      },
      bodyColor: chartColors.muted,
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      padding: 14,
      cornerRadius: 10,
      boxPadding: 6,
    },
  },
  cutout: '65%',
};

// Enhanced line chart options
export const lineOptions = {
  ...defaultOptions,
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2.5,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
    },
    point: {
      radius: 0,
      hoverRadius: 6,
      hoverBorderWidth: 2,
      hoverBackgroundColor: '#fff',
    },
  },
};

// Enhanced bar chart options
export const barOptions = {
  ...defaultOptions,
  elements: {
    bar: {
      borderRadius: 6,
      borderSkipped: false,
    },
  },
};

// Horizontal bar chart options
export const horizontalBarOptions = {
  ...barOptions,
  indexAxis: 'y' as const,
  plugins: {
    ...barOptions.plugins,
    legend: {
      display: false,
    },
  },
};
