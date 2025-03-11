import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./courseoutline.css";

const CourseOutline = () => {
  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({ name: "", total_lectures: "" });
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);
  const [newTopic, setNewTopic] = useState({
    name: "",
    description: "",
    number_of_lectures: "",
  });
  const [lectures, setLectures] = useState([]);
  const [newLectureNumber, setNewLectureNumber] = useState("");
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  console.log(chapters)

  useEffect(() => {
    fetchChapters();
    fetchLectures();
  }, []);

  const apiCall = async (url, method = 'GET', body = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
  
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    
    return response.json();
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`http://localhost:5000/chapters/${subjectId}`);
      setChapters(data);
    } catch (error) {
      console.error("Error fetching chapters:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/lectures/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch lectures");
      const data = await response.json();
      data.sort((a, b) => a.lecture_number - b.lecture_number);
      setLectures(data);
    } catch (error) {
      console.error("Error fetching lectures:", error.message);
    }
  };

  const goToLecturePlan = (lectureId) => {
    navigate(`/lecture/${lectureId}`);
  };

  const addLecture = async () => {
    if (!newLectureNumber.trim()) {
      alert("Please enter a valid lecture number");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const lectureData = {
        lecture_number: newLectureNumber,
        subject_id: subjectId,
      };
      const response = await fetch("http://localhost:5000/lecture", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(lectureData),
      });
      if (!response.ok) throw new Error("Failed to add lecture");
      const addedLecture = await response.json();
      setLectures((prev) => [...prev, addedLecture].sort((a, b) => a.lecture_number - b.lecture_number));
      setNewLectureNumber("");
    } catch (error) {
      console.error("Error adding lecture:", error.message);
      alert("An error occurred while adding the lecture.");
    }
  };

  const addChapter = async () => {
    if (!newChapter.name.trim() || !newChapter.total_lectures) {
      alert("Please fill out all required fields.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const chapterData = { ...newChapter, subject_id: subjectId };
      const response = await fetch("http://localhost:5000/chapter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(chapterData),
      });
      if (!response.ok) throw new Error("Failed to add chapter");
      const addedChapter = await response.json();
      setChapters([...chapters, { ...addedChapter, topics: [] }]);
      setNewChapter({ name: "", total_lectures: "" });
    } catch (error) {
      console.error("Error adding chapter:", error.message);
    }
  };

  const deleteChapter = async (index) => {
    const chapterId = chapters[index].id;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/chapter/${chapterId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setChapters(chapters.filter((_, i) => i !== index));
      setSelectedChapterIndex(null);
    } catch (error) {
      console.error("Error deleting chapter:", error.message);
    }
  };

  const selectChapter = async (index) => {
    setSelectedChapterIndex(index);
    const chapterId = chapters[index].id;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/topics/${chapterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch topics");
      const topics = await response.json();
      setChapters((prev) => {
        const updatedChapters = [...prev];
        updatedChapters[index].topics = topics;
        return updatedChapters;
      });
    } catch (error) {
      console.error("Error fetching topics:", error.message);
    }
  };

  const addTopicToChapter = async () => {
    if (selectedChapterIndex === null || !newTopic.name || !newTopic.number_of_lectures) {
      alert("Please fill all required fields and select a chapter.");
      return;
    }
  
    const chapter = chapters[selectedChapterIndex];
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch("http://localhost:5000/topic", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTopic,
          chapter_id: chapter.id,
          Status: "Incomplete",
        }),
      });
      if (!response.ok) throw new Error("Failed to add topic");
      await selectChapter(selectedChapterIndex);
      setNewTopic({ name: "", description: "", number_of_lectures: "" });
    } catch (error) {
      console.error("Error adding topic:", error.message);
    }
  };

  const toggleTopicStatus = async (chapterIndex, topicIndex, currentStatus) => {
    const topicId = chapters[chapterIndex].topics[topicIndex].id;
    // Change "Completed" to "Complete" to match what the server expects
    const newStatus = currentStatus === "Incomplete" ? "Complete" : "Incomplete";
  
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/topic/${topicId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ Status: newStatus }),
      });
      setChapters((prev) => {
        const updatedChapters = [...prev];
        updatedChapters[chapterIndex].topics[topicIndex].Status = newStatus;
        return updatedChapters;
      });
    } catch (error) {
      console.error("Error updating topic status:", error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No authentication token found!");
      navigate('/login'); // Redirect to login if no token
      return;
    }
    
    fetchChapters();
    fetchLectures();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="body">
      <div className="course-container">
        <h1>ClassLog</h1>
        <h3>Subject Course Outline</h3>

        <div className="chapter-container">
          <div className="chapter-inputs">
            <input
              type="text"
              placeholder="Chapter Name"
              value={newChapter.name}
              onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Total Lectures"
              value={newChapter.total_lectures}
              onChange={(e) => setNewChapter({ ...newChapter, total_lectures: e.target.value })}
            />
            <button onClick={addChapter}>Add Chapter</button>
          </div>

          <div className="chapter-list">
            {chapters.map((chapter, chapterIndex) => (
              <div key={chapter.id} className="chapter-item">
                <div className="chapter-header">
                  <h4 onClick={() => selectChapter(chapterIndex)}>{chapter.name}</h4>
                  <button onClick={() => deleteChapter(chapterIndex)}>Delete</button>
                </div>
                {selectedChapterIndex === chapterIndex && (
                  <div className="topic-section">
                    <table className="topic-table">
                      <thead>
                        <tr>
                          <th className="name-header">Name</th>
                          <th className="description-header">Description</th>
                          <th className="lectures-header">Lectures</th>
                          <th className="status-header">Status</th>
                          <th className="actions-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedChapterIndex === chapterIndex && (
                          chapter.topics?.map((topic, topicIndex) => (
                            <tr key={topicIndex}>
                              <td data-label="Name">{topic.name}</td>
                              <td data-label="Description">{topic.description}</td>
                              <td data-label="Lectures" style={{textAlign: 'center'}}>{topic.number_of_lectures}</td>
                              <td data-label="Status" style={{textAlign: 'center'}}>{topic.Status}</td>
                              <td data-label="Actions" style={{textAlign: 'right'}}>
                                <button 
                                  onClick={() => toggleTopicStatus(chapterIndex, topicIndex, topic.Status)}
                                  className="status-button"
                                  data-status={topic.Status}
                                >
                                  {topic.Status === "Incomplete" ? "Complete" : "Incomplete"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="topic-inputs">
                      <input
                        type="text"
                        placeholder="Topic Name"
                        value={newTopic.name}
                        onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newTopic.description}
                        onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Number of Lectures"
                        value={newTopic.number_of_lectures}
                        onChange={(e) => setNewTopic({ ...newTopic, number_of_lectures: e.target.value })}
                      />
                      <button onClick={addTopicToChapter}>Add Topic</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lecture-container">
          <h3>Lectures</h3>
          <div className="lecture-inputs">
            <input
              type="number"
              placeholder="Lecture Number"
              value={newLectureNumber}
              onChange={(e) => setNewLectureNumber(e.target.value)}
            />
            <button onClick={addLecture}>Add Lecture</button>
          </div>
          <div className="lecture-list">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="lecture-item"
                onClick={() => goToLecturePlan(lecture.id)}
              >
                <p>Lecture {lecture.lecture_number}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOutline;