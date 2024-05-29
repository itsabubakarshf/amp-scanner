import React, { useState, useEffect } from "react";
import FormComponent from "../component/FormComponent";
import CardComponent from "../component/CardComponent";
import { getFromServer, postToServer, putToServer } from "../helpers/request";
import { toast } from "react-toastify";
import CardDetail from "./CardDetail";
import { FaPlus, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import './Home.css'; 

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [latestResults, setLatestResults] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
    fetchLatestResults(); 
    const intervalId = setInterval(fetchLatestResults, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await getFromServer("/Workers");
      if (response.status) {
        setWorkers(response.data);
        setError(false);
      } else {
        setError(true);
        toast.error(response.message);
      }
    } catch (error) {
      setError(true);
      toast.error(error.message);
    }
  };

  const fetchLatestResults = async () => {
    try {
      const response = await getFromServer("/get-latest-worker-results");
      if (response.status) {
        const results = response.data.reduce((acc, result) => {
          acc[result.workerId] = result;
          return acc;
        }, {});
        setLatestResults(results);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addWorker = async (workerData) => {
    const response = await postToServer("/workers", workerData);
    if (response.status) {
      fetchWorkers();
      setShowForm(false);
      toast.success("Worker successfully added!");
    } else {
      toast.error("Failed to add worker: " + response.message);
    }
  };

  const handleWorkerSubmit = async (workerData, id) => {
    let response;
    if (id) {
      // Update existing worker
      response = await putToServer(`/Workers/${id}`, workerData);
      if (response.status) {
        toast.success("Worker updated successfully!");
      } else {
        toast.error("Failed to update worker: " + response.message);
      }
    } else {
      // Add new worker
      response = await postToServer("/workers", workerData);
      if (response.status) {
        toast.success("Worker successfully added!");
      } else {
        toast.error("Failed to add worker: " + response.message);
      }
    }
    if (response.status) {
      fetchWorkers();
      setShowForm(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.dataAmpUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (worker) => {
    setCurrentWorker(worker);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentWorker(null);
  };

  const handleCardClick = (worker) => {
    setSelectedWorker(worker);
  };

  const handleBack = () => {
    setSelectedWorker(null);
  };

  return (
    <>
      <div className="container mt-5 home-container">
        <div className="row align-items-center">
          <div className="col-md-4"></div>
          <div className="col-md-4 d-flex justify-content-center">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by site name or URL..."
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: "40px" }}
              />
            </div>
          </div>
          <div className="col-md-1 d-flex justify-content-start pl-2">
            <button
              className="btn btn-success"
              onClick={() => setShowForm(true)}
              style={{ height: "40px" }}
              title="Add Worker"
            >
              <FaPlus />
            </button>
          </div>
          <div className="col-md-2"></div>
          <div className="col-md-1 d-flex justify-content-end">
            <button
              className="btn btn-danger"
              onClick={handleLogout}
              style={{ height: "40px" }}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
        {showForm ? (
          <FormComponent worker={currentWorker} onSubmit={handleWorkerSubmit} onCancel={handleCloseForm} />
        ) : selectedWorker ? (
          <CardDetail worker={selectedWorker} onBack={handleBack} />
        ) : (
          <div className="row mt-5">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <div key={worker._id} className="col-12 mb-4">
                  <CardComponent
                    worker={worker}
                    latestResult={latestResults[worker._id]}
                    onEdit={handleEdit}
                    fetchWorkers={fetchWorkers}
                    onClick={() => handleCardClick(worker)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center">
                {error
                  ? "Error loading data. Please try again."
                  : "No data Found"}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
