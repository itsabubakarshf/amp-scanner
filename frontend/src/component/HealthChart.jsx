import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HealthChart.css';

const HealthChart = () => {
  // No change needed for useSelector if it's being used elsewhere in your component
  const responseData = useSelector((state) => state.form.responseData);

  // Initialize data with an empty array
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-latest-results');
      const fetchedData = response.data;

      // Access the 'results' array from the API response
      if (fetchedData.success && Array.isArray(fetchedData.results)) {
        localStorage.setItem('healthData', JSON.stringify(fetchedData.results));
        setData(fetchedData.results);
        toast.success('Data fetched and saved successfully');
      } else {
        throw new Error('Invalid data structure from API');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
      // Attempt to load from local storage if the API call fails
      const storedData = localStorage.getItem('healthData');
      if (storedData) {
        setData(JSON.parse(storedData));
        toast.info('Data loaded from local storage');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000); // 4 minutes
    return () => clearInterval(intervalId);
  }, []);

  // Define chartData using the updated 'data' state
  const chartData = {
    labels: data.map(item => format(new Date(item.timestamp), 'pp')),
    datasets: [
      {
        label: 'Health Status',
        data: data.map(item => item.success ? 5 : 0),
        backgroundColor: data.map(item => item.success ? 'green' : 'red'),
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className='chart'>
      <ToastContainer />
      <div className="custom-legend">
        <div><span className="legend-key" style={{background: 'green'}}></span> Up (Success)</div>
        <div><span className="legend-key" style={{background: 'red'}}></span> Down (Failure)</div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HealthChart;
