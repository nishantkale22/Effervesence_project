import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import '../../styles/volunteers.css';

const Volunteers = () => {
  const { _id, department } = useParams();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [taskDetails, setTaskDetails] = useState({ title: '', description: '' });
  const [resourceDetails, setResourceDetails] = useState({
    title: '',
    description: '',
    fileType: '',
    fileUrl: ''
  });
  const [error, setError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [attachResource, setAttachResource] = useState(false); // Toggle for resource form
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/user/${_id}/volunteers/${department}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        setVolunteers(data.volunteers);
      } catch (err) {
        setError('Failed to fetch volunteers.');
        console.error(err);
      }
    };

    fetchVolunteers();
  }, [_id, department]);

  const handleAssignTask = () => setIsAssigning(!isAssigning);

  const handleVolunteerSelect = (volunteerId) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId) ? prev.filter((id) => id !== volunteerId) : [...prev, volunteerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedVolunteers.length === 0) {
      alert('Please select at least one volunteer.');
      return;
    }

    const payload = {
      id: { _id },
      task: { ...taskDetails },
      assignedTo: selectedVolunteers,
      resource: attachResource ? { ...resourceDetails } : {}
    };

    try {
      await axiosInstance.post('/task/assign', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      alert('Task and Resource assigned successfully!');
      setIsAssigning(false);
      setTaskDetails({ title: '', description: '' });
      setResourceDetails({ title: '', description: '', fileType: '', fileUrl: '' });
      setSelectedVolunteers([]);
      setAttachResource(false);
    } catch (error) {
      console.error('Failed to assign task and resource:', error);
    }
  };

  return (
    <div className="volunteers-container">
      <div className="header">
        <h1>{department}</h1>
        <button
          onClick={handleAssignTask}
          className={`assign-task-button ${isAssigning ? 'active' : ''}`}
        >
          {isAssigning ? 'Cancel' : 'Assign Task'}
        </button>
      </div>

      <h2>Volunteers</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : volunteers.length > 0 ? (
        volunteers.map((volunteer) => (
          <div key={volunteer._id} className="volunteer-card">
            <img src={volunteer.photo} alt={`${volunteer.name}'s profile`} className="volunteer-photo" />
            <h3>{volunteer.name}</h3>
            {/* <div className="volunteer-details">
              <div className="contact-info">
                <p>{volunteer.email}</p>
                <p>{volunteer.phone}</p>
              </div>
            </div> */}
            {isAssigning && (
              <input
                type="checkbox"
                checked={selectedVolunteers.includes(volunteer._id)}
                onChange={() => handleVolunteerSelect(volunteer._id)}
              />
            )}
          </div>
        ))
      ) : (
        <p>No volunteers assigned.</p>
      )}

      {isAssigning && (
        <form onSubmit={handleSubmit} className="task-assignment-form">
          <div className="form-section">
            <h3>Task Details</h3>
            <input
              type="text"
              value={taskDetails.title}
              onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
              placeholder="Task Title"
              required
            />
            <textarea
              value={taskDetails.description}
              onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
              placeholder="Task Description"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setAttachResource(!attachResource)}
            className={`attach-resource-button ${attachResource ? 'active' : ''}`}
          >
            {attachResource ? 'Remove Resource' : 'Attach Resource'}
          </button>

          {attachResource && (
            <div className="form-section">
              <h3>Resource Details</h3>
              <input
                type="text"
                value={resourceDetails.title}
                onChange={(e) => setResourceDetails({ ...resourceDetails, title: e.target.value })}
                placeholder="Resource Title"
                required
              />
              <textarea
                value={resourceDetails.description}
                onChange={(e) => setResourceDetails({ ...resourceDetails, description: e.target.value })}
                placeholder="Resource Description"
                required
              />
              <select
                value={resourceDetails.fileType}
                onChange={(e) => setResourceDetails({ ...resourceDetails, fileType: e.target.value })}
                required
              >
                <option value="">Select File Type</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <input
                type="text"
                value={resourceDetails.fileUrl}
                onChange={(e) => setResourceDetails({ ...resourceDetails, fileUrl: e.target.value })}
                placeholder="Resource File URL"
                required
              />
            </div>
          )}

          <button type="submit">Submit Task and Resource</button>
        </form>
      )}
    </div>
  );
};

export default Volunteers;
