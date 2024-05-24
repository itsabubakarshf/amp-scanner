import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import HealthChart from '../component/HealthChart';
import './CardDetail.css'; // Import the CSS file for styling

const CardDetail = ({ worker, onBack }) => {
  return (
    <div className="container mt-5">
      <button className="btn btn-primary" onClick={onBack} title="Go Back">
        <FaArrowLeft />
      </button>
      <div className="row">
        <div className="col-md-6">
          <h5 className="section-title">Worker Details</h5>
          <p><strong>Site Name:</strong> {worker.siteName}</p>
          <p><strong>Data AMP URL:</strong> {worker.dataAmpUrl}</p>
          <p><strong>Data AMP Current:</strong> {worker.dataAmpCurrent}</p>
          <p><strong>Data AMP Title:</strong> {worker.dataAmpTitle}</p>
          <p><strong>Href:</strong> {worker.href}</p>
          <p><strong>Duration:</strong> {worker.interval} s</p>
        </div>
        <div className="col-md-6">
          <HealthChart workerId={worker._id} />
        </div>
      </div>
    </div>
  );
};

export default CardDetail;