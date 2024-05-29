import React from "react";
import { postToServer, deleteFromServer } from "../helpers/request";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlay, FaStop } from 'react-icons/fa';
import './CardComponent.css'; 

const CardComponent = ({ worker, latestResult, onEdit, fetchWorkers, onClick }) => {
  const toggleRunningState = async (e) => {
    e.stopPropagation();
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

  const handleDelete = async (e) => {
    e.stopPropagation();
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

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(worker);
  };

  const getBackgroundColor = () => {
    if (!latestResult) {
      return "lightyellow";
    } else if (latestResult.success) {
      return "white";
    } else {
      return "lightcoral";
    }
  };

  return (
    <div className="card mb-2 card-shadow" onClick={onClick} style={{ backgroundColor: getBackgroundColor() }}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-0">{worker.siteName}</h5>
          <p className="card-text mb-0">{worker.dataAmpUrl}</p>
        </div>
        <div className="card-buttons d-flex">
          <button onClick={toggleRunningState} className="btn btn-primary mx-1" title={worker.isRunning ? "Stop" : "Start"}>
            {worker.isRunning ? <FaStop size={16} /> : <FaPlay size={16} />}
          </button>
          <button onClick={handleEdit} className="btn btn-secondary mx-1" title="Edit">
            <FaEdit size={16} />
          </button>
          <button onClick={handleDelete} className="btn btn-danger mx-1" title="Delete">
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;