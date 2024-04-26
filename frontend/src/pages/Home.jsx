import React, { useState, useEffect } from "react";
import FormComponent from "../component/FormComponent";
import HealthChart from "../component/HealthChart";
import CardComponent from "../component/CardComponent";
import {
  getFromServer,
  postToServer,
  putToServer,
} from "../helpers/request";
import { toast } from "react-toastify";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await getFromServer("/Workers");
      console.log(response);
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

  const addWorker = async (workerData) => {
    const response = await postToServer("/workers", workerData);
    if (response.status) {
      fetchWorkers();
      setShowForm(false);
      toast.success("Worker successfully added!");
    } else {
      // Handle error
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

  return (
    <>
      <div className="container mt-5">
        <div className="row align-items-center">
          <div className="col-md-4"></div>
          <div className="col-md-4 d-flex justify-content-center">
            <input
              type="text"
              className="form-control"
              placeholder="Search by site name or URL..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ height: "40px" }}
            />
          </div>
          <div className="col-md-1 d-flex justify-content-start pl-2">
            <button
              className="btn btn-success"
              onClick={() => setShowForm(true)}
              style={{ height: "40px" }}
            >
              Add
            </button>
          </div>
          <div className="col-md-2"></div>
          <div className="col-md-1 d-flex justify-content-end">
            <button
              className="btn btn-danger"
              onClick={handleLogout}
              style={{ height: "40px" }}
            >
              Logout
            </button>
          </div>
        </div>
        {showForm ? (
          <FormComponent worker={currentWorker} onSubmit={handleWorkerSubmit} onCancel={handleCloseForm} />
        ) : (
          <div className="card-container mt-5">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <CardComponent
                  key={worker._id}
                  worker={worker}
                  onEdit={handleEdit}
                  fetchWorkers={fetchWorkers}
                />
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
