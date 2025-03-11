import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import axios from "axios"; // Using axios for consistent API calls

const LecturePlan = () => {
  const { lectureId } = useParams(); // Get lecture ID from the URL
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null); 
  const [lecturePlan, setLecturePlan] = useState(""); 
  const [editMode, setEditMode] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [duration, setDuration] = useState(60); 
  
  // Store API key in state but don't hardcode it
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Try to get the stored API key from localStorage only (not hardcoded)
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    if (lectureId) {
      fetchLectureDetails();
    } else {
      setError("No lecture ID provided in the URL.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId]);

  // Get the JWT token from local storage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch lecture details by lecture ID
  const fetchLectureDetails = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await axios.get(`http://localhost:5000/lecture/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLecture(response.data);
      fetchLecturePlan(response.data.id); // Fetch the lecture plan after getting lecture details
    } catch (error) {
      console.error("Error fetching lecture details:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          navigate('/login');
        } else if (error.response.status === 404) {
          setError("Lecture not found.");
        } else {
          setError(`Failed to fetch lecture details. Server responded with ${error.response.status}`);
        }
      } else {
        setError(error.message || "An error occurred while fetching lecture details.");
      }
      setLoading(false);
    }
  };

  // Fetch lecture plan by lecture ID
  const fetchLecturePlan = async (lectureId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await axios.get(`http://localhost:5000/lectureplan/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLecturePlan(response.data.content);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lecture plan:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          navigate('/login');
        } else if (error.response.status === 404) {
          // If no lecture plan exists, initialize as empty but don't show error
          setLecturePlan("");
          setLoading(false);
        } else {
          setError(`Failed to fetch lecture plan. Server responded with ${error.response.status}`);
        }
      } else {
        setError(error.message || "An error occurred while fetching the lecture plan.");
      }
      setLoading(false);
    }
  };

  // Generate dynamic lecture plan with API key
  const generateDynamicLecturePlan = async () => {
    if (!lectureId) {
      console.error("Lecture ID not available");
      return;
    }
    
    // If no API key is in state, prompt the user
    let currentApiKey = apiKey;
    if (!currentApiKey) {
      const userInput = prompt("Please enter your API key for generating the lecture plan:");
      if (!userInput) {
        alert("API key is required to generate the lecture plan.");
        return;
      }
      currentApiKey = userInput;
      // Save to localStorage for future use
      localStorage.setItem('apiKey', currentApiKey);
      setApiKey(currentApiKey);
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Show loading state
      setLoading(true);
      
      const response = await axios.post(`http://localhost:5000/generatelectureplan/${lectureId}`, 
        { 
          duration: duration,
          apiKey: currentApiKey  // Include in body for flexibility
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-API-Key": currentApiKey  // Include API key in header
          }
        }
      );
      
      setLecturePlan(response.data.content);
      alert("Lecture plan generated successfully!");
    } catch (error) {
      console.error("Error generating lecture plan:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          alert("Authentication failed. Please log in again.");
          navigate('/login');
        } else if (error.response.status === 403) {
          // Handle invalid API key
          localStorage.removeItem('apiKey'); // Clear the invalid key
          setApiKey("");
          alert("Invalid or expired API key. Please try again with a valid key.");
        } else {
          alert(`Failed to generate lecture plan. Server responded with ${error.response.status}`);
        }
      } else {
        alert(error.message || "An error occurred while generating the lecture plan.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save lecture plan after editing
  const saveLecturePlan = async () => {
    if (!lectureId) {
      console.error("Lecture ID not available");
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      await axios.put(`http://localhost:5000/lectureplan/${lectureId}`, 
        { content: lecturePlan },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      setEditMode(false);
      alert("Lecture plan updated successfully!");
    } catch (error) {
      console.error("Error updating lecture plan:", error);
      
      if (error.response && error.response.status === 401) {
        alert("Authentication failed. Please log in again.");
        navigate('/login');
      } else {
        alert(error.message || "An error occurred while updating the lecture plan.");
      }
    }
  };

  // Cancel editing and revert changes
  const cancelEdit = () => {
    setEditMode(false);
    if (lectureId) {
      fetchLecturePlan(lectureId); // Reload the lecture plan
    }
  };

  // Handle API key change
  const resetApiKey = () => {
    const confirmReset = window.confirm("Are you sure you want to reset your API key?");
    if (confirmReset) {
      localStorage.removeItem('apiKey');
      setApiKey("");
      alert("API key has been reset. You will be prompted for a new key when generating a lecture plan.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ textAlign: "center", color: "purple" }}>Lecture Plan</h1>
        <p style={{ textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ textAlign: "center", color: "purple" }}>Lecture Plan</h1>
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "purple",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Back to Course Outline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", marginTop: "20px", paddingTop: "60px", overflowX: "hidden"}}>
      <h1 style={{ textAlign: "center", color: "purple", marginBottom: "20px" }}>Lecture Plan</h1>
      {lecture && (
        <h2 style={{ textAlign: "center" }}>
          Lecture {lecture.lecture_number}: {lecture.title}
        </h2>
      )}

      {/* Dynamic Lecture Plan Generation */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label htmlFor="duration" style={{ marginRight: "10px" }}>
          Duration (minutes):
        </label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{ padding: "5px", marginRight: "10px", width: "80px" }}
        />
        <button
          onClick={generateDynamicLecturePlan}
          style={{
            padding: "10px 20px",
            backgroundColor: "purple",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Generate Lecture Plan
        </button>
        
        {/* Show API key status and reset button */}
        {apiKey ? (
          <>
            <span style={{ 
              padding: "5px 10px", 
              backgroundColor: "#e6f7ff", 
              color: "#0077cc", 
              borderRadius: "3px",
              marginRight: "10px"
            }}>
              API Key: Set ✓
            </span>
            <button
              onClick={resetApiKey}
              style={{
                padding: "5px 10px",
                backgroundColor: "#f0f0f0",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.8em"
              }}
            >
              Reset API Key
            </button>
          </>
        ) : (
          <span style={{ 
            padding: "5px 10px", 
            backgroundColor: "#fff0f0", 
            color: "#cc0000", 
            borderRadius: "3px" 
          }}>
            No API Key Set
          </span>
        )}
      </div>

      {/* Lecture Plan Content */}
      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "20px",
          minHeight: "200px",
          maxHeight: "50vh", 
          overflowY: "auto",
        }}
      >
        <h3 style={{ color: "purple" }}>Lecture Plan Content</h3>
        {editMode ? (
          <textarea
            value={lecturePlan}
            onChange={(e) => setLecturePlan(e.target.value)}
            style={{ width: "100%", height: "200px", padding: "10px" }}
          />
        ) : (
          <ReactMarkdown>{lecturePlan || "No lecture plan available."}</ReactMarkdown>
        )}
      </div>

      {/* Edit and Save Buttons */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {editMode ? (
          <>
            <button
              onClick={saveLecturePlan}
              style={{
                padding: "10px 20px",
                backgroundColor: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              style={{
                padding: "10px 20px",
                backgroundColor: "gray",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: lecturePlan ? "orange" : "gray",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: lecturePlan ? "pointer" : "not-allowed",
            }}
            disabled={!lecturePlan}
          >
            Edit Lecture Plan
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "purple",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "250px"
          }}
        >
          Back to Dashboard
        </button>

        <button
          onClick={() => navigate(`/quiz/${lectureId}`)}
          style={{
            padding: "10px 20px",
            backgroundColor: "purple",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "250px"
          }}
        >
          Generate Quiz
        </button>

        <button
          onClick={() => navigate(`/notes/${lectureId}`)}
          style={{
            padding: "10px 20px",
            backgroundColor: "purple",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "250px"
          }}
        >
          Generate Notes
        </button>

        <button
          onClick={() => navigate(`/upload/${lectureId}`)}
          style={{
            padding: "10px 20px",
            backgroundColor: "purple",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "250px",
            marginBottom: "20px"
          }}
        >
          Upload Class Video
        </button>
      </div>
    </div>
  );
};

export default LecturePlan;