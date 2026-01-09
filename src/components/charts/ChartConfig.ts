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

// Theme-aware chart configuration and colors
export const chartColors = {
  primary: 'hsl(43, 74%, 52%)',
  success: 'hsl(142, 76%, 36%)',
  destructive: 'hsl(0, 72%, 51%)',
  accent: 'hsl(199, 89%, 48%)',
  muted: 'hsl(215, 20%, 55%)',
  border: 'hsl(217, 33%, 20%)',
  background: 'hsl(222, 47%, 9%)',
};

export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartColors.muted,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: chartColors.background,
      borderColor: chartColors.border,
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: chartColors.muted,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: chartColors.muted,
        font: {
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: chartColors.border,
      },
      ticks: {
        color: chartColors.muted,
        font: {
          size: 12,
        },
      },
    },
  },
};

export const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: chartColors.background,
      borderColor: chartColors.border,
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: chartColors.muted,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    r: {
      angleLines: {
        color: chartColors.border,
      },
      grid: {
        color: chartColors.border,
      },
      pointLabels: {
        color: chartColors.muted,
        font: {
          size: 12,
        },
      },
      ticks: {
        color: chartColors.muted,
        backdropColor: 'transparent',
        font: {
          size: 10,
        },
      },
      suggestedMin: 0,
      suggestedMax: 100,
    },
  },
};

export const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: chartColors.background,
      borderColor: chartColors.border,
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: chartColors.muted,
      padding: 12,
      cornerRadius: 8,
    },
  },
};
