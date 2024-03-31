import React from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { TimeScale, TimeSeriesScale } from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TimeScale,
  TimeSeriesScale,
  Tooltip,
  Legend,
  Filler
);

const HealthChart = () => {
  const responseData = useSelector((state) => state.form.responseData);

  const data = {
    labels: responseData.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'System Health',
        data: responseData.map((data) => ({
          x: new Date(data.timestamp).toLocaleTimeString(),
          y: data.success ? 1 : 0
        })),
        borderColor: responseData.map((data) => data.success ? 'green' : 'red'),
        backgroundColor: responseData.map((data) => data.success ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'),
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
        spanGaps: true,
        fill: true
      }
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (value === 1) return "Healthy";
            if (value === 0) return "Unhealthy";
            return value;
          }
        },
        title: {
          display: true,
          text: 'Status'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default HealthChart;
