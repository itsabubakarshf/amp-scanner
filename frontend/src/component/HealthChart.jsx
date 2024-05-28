import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HealthChart.css';
import { getFromServer } from '../helpers/request';

const HealthChart = ({ workerId }) => {
  const [data, setData] = useState([]);
  const chartRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await getFromServer(`get-latest-results/${workerId}`);
      
      if (response.status) {
        console.log('Fetched Data:', response.data);
        if (Array.isArray(response.data)) {
          setData(response.data.reverse());  // Reverse data here
          // toast.success('Data fetched successfully');
        } else {
          throw new Error('Invalid data structure from API');
        }
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      toast.error('Failed to fetch data');
      const storedData = localStorage.getItem('healthData');
      if (storedData) {
        setData(JSON.parse(storedData).reverse());  // Reverse stored data here
        toast.info('Data loaded from local storage');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId); 
  }, [workerId]);

  const customTooltip = (context) => {
    const tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
      const el = document.createElement('div');
      el.id = 'chartjs-tooltip';
      el.className = 'chartjs-tooltip';
      el.innerHTML = '<table></table>';
      document.body.appendChild(el);
    }
  
    const tooltipModel = context.tooltip;
    const tooltip = document.getElementById('chartjs-tooltip');
    if (tooltipModel.opacity === 0) {
      tooltip.style.opacity = 0;
      return;
    }
  
    const index = tooltipModel.dataPoints[0].dataIndex;
    const item = data[index];
    const date = format(new Date(item.timestamp), 'dd MMM yyyy');
    const time = format(new Date(item.timestamp), 'hh:mm:ss a');
    const message = item.message || '';
    const imageUrl = item.ss || 'https://via.placeholder.com/150';
    const dataAmp = item.data ? item.data['data-amp'] : '';
    const dataAmpCur = item.data ? item.data['data-amp-cur'] : '';
    const dataAmpTitle = item.data ? item.data['data-amp-title'] : '';
    const href = item.data ? item.data.href : '';
  
    const innerHtml = `
      <div class="tooltip-content bg-secondary text-white rounded p-2">
        <div class="tooltip-text">${date} ${time}</div>
        <div class="tooltip-text">${message}</div>
        <div class="tooltip-text">Data AMP: ${dataAmp}</div>
        <div class="tooltip-text">Data AMP Current: ${dataAmpCur}</div>
        <div class="tooltip-text">Data AMP Title: ${dataAmpTitle}</div>
        <div class="tooltip-text">Href: ${href}</div>
        <div class="tooltip-image"><img src="${imageUrl}" alt="Image" /></div>
      </div>
    `;
  
    const tableRoot = tooltip.querySelector('table');
    tableRoot.innerHTML = innerHtml;
  
    const position = context.chart.canvas.getBoundingClientRect();
    tooltip.style.opacity = 1;
    tooltip.style.position = 'absolute';
    tooltip.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
    tooltip.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
    tooltip.style.pointerEvents = 'none';
  };
  
  

  const chartData = {
    labels: data.map(item => [format(new Date(item.timestamp), 'dd MMM yyyy'), format(new Date(item.timestamp), 'hh:mm:ss a')]),
    datasets: [
      {
        label: 'Health Status',
        data: data.map(item => item.success ? 1 : 0),
        borderColor: 'green', 
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: data.map(item => item.success ? 'green' : 'red'),
        pointBorderColor: data.map(item => item.success ? 'green' : 'red'),
        pointBorderWidth: 2,
        segment: {
          borderColor: ctx => (data[ctx.p1DataIndex].success ? 'green' : 'red'),
        },
        stepped: true,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1.05, 
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (value === 0 || value === 1) {
              return value;
            }
          },
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          callback: function(value, index, values) {
            const label = this.getLabelForValue(value);
            return `${label[0]}\n${label[1]}`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: customTooltip,
      }
    }
  };

  return (
    <div className="chart-container">
      <ToastContainer />
      <div className="custom-legend">
        <div><span className="legend-key" style={{ background: 'green' }}></span> Up </div>
        <div><span className="legend-key" style={{ background: 'red' }}></span> Down </div>
      </div>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default HealthChart;
