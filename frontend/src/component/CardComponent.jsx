import React, { useEffect, useState } from "react";
import {
  postToServer,
  deleteFromServer,
  getFromServer,
} from "../helpers/request";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";
const ApexChart = ({ workerId }) => {
  const [chartData, setChartData] = useState({
    series: [{
      data: []
    }],
    options: {
      chart: {
        type: 'line',
        height: 350,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000
          }
        }
      },
      stroke: {
        curve: 'stepline'
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: 'System Status',
        align: 'left'
      },
      xaxis: {
        type: 'datetime',
        tickAmount: 6,
        labels: {
          formatter: function (value) {
            return new Date(value).toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false 
            });
          }
        }
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy HH:mm:ss'
        }
      },
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestResults(workerId);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchLatestResults = async (workerId) => {
    try {
        const response = await getFromServer(`get-latest-results/${workerId}`);
        if (response.status && Array.isArray(response.data)) {
            const newSeriesData = response.data.map(result => ({
                x: new Date(result.timestamp).getTime(),
                y: result.success ? 1 : 0
            }));

            setChartData(prevState => ({
                ...prevState,
                series: [{ data: newSeriesData }]
            }));
        } else {
            toast.error("Failed to fetch latest results or no results found.");
        }
    } catch (error) {
        console.error("Failed to fetch latest results:", error);
        toast.error(`Error fetching latest results. ${error.message}`);
    }
};
  

  return (
    <ReactApexChart
      options={chartData.options}
      series={chartData.series}
      type="line"
      height={300}
    />
  );
};
const CardComponent = ({ worker, onEdit, fetchWorkers }) => {
  const toggleRunningState = async () => {
    try {
      const response = await postToServer(`update-process/${worker._id}`, {
        isRunning: !worker.isRunning,
      });
      if (response.status) {
        fetchWorkers();
      } else {
        toast.error("Failed to toggle state: " + response.message);
      }
    } catch (error) {
      alert("Error toggling process state.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteFromServer(`/Workers/${worker._id}`);
      if (response.status) {
        fetchWorkers();
      } else {
        alert("Failed to delete worker: " + response.message);
      }
    } catch (error) {
      alert("Error deleting worker.");
    }
  };

  return (
    <div className="card mb-4 d-flex flex-row">
      {" "}
      <div className="card-body">
        <h5 className="card-title">{worker.siteName}</h5>
        <p className="card-text">{worker.dataAmpUrl}</p>
        <p className="card-text">{worker.dataAmpCurrent}</p>
        <p className="card-text">{worker.dataAmpTitle}</p>
        <p className="card-text">{worker.href}</p>
        <div className="card-buttons">
          <button onClick={toggleRunningState} className="btn btn-primary">
            {worker.isRunning ? "Stop" : "Start"}
          </button>
          <button
            onClick={() => onEdit(worker)}
            className="btn btn-secondary mx-2"
          >
            Edit
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
      <div className="chart-container">
        {worker.isRunning && <ApexChart workerId={worker._id} />}
      </div>
    </div>
  );
};

export default CardComponent;
