import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HealthChart.css';
import { getFromServer } from '../helpers/request';

const HealthChart = ({ workerId }) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await getFromServer(`get-latest-results/${workerId}`);
      
      if (response.status) {
        console.log('Fetched Data:', response.data);
        if (Array.isArray(response.data)) {
          setData(response.data);
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
        setData(JSON.parse(storedData));
        toast.info('Data loaded from local storage');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId); 
  }, [workerId]);

  const chartData = {
    labels: data.map(item => format(new Date(item.timestamp), 'pp')),
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
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (value === 0 || value === 1) {
              return value;
            }
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
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            return data[index].message || '';
          }
        }
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HealthChart;
