import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./UploadVideo.css";

const UploadVideo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const { lectureId } = useParams();

  const handleFileChange = async (event) => {
    const videoFile = event.target.files[0];
    if (!videoFile) return;

    const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(videoFile.type)) {
      setResponseMessage("Please upload a valid video file (MP4, AVI, MOV, or MKV)");
      setIsError(true);
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (videoFile.size > maxSize) {
      setResponseMessage("File size too large. Please upload a video smaller than 500MB.");
      setIsError(true);
      return;
    }

    setIsProcessing(true);
    setResponseMessage(null);
    setTranscript("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("lecture_id", lectureId);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/upload");
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setResponseMessage(response.message);
          setTranscript(response.transcript);
          setIsError(false);
        } else {
          const response = JSON.parse(xhr.responseText);
          setResponseMessage(`Error: ${response.error}`);
          setIsError(true);
        }
        setIsProcessing(false);
      };

      xhr.onerror = () => {
        setResponseMessage("An error occurred during the upload. Please try again.");
        setIsError(true);
        setIsProcessing(false);
      };

      xhr.send(formData);
    } catch (error) {
      setResponseMessage(`Error: ${error.message}`);
      setIsError(true);
      setIsProcessing(false);
    }
  };

  return (
    <div className="upload-video-container">
      <h2>Upload Video for Transcription</h2>
      <input type="file" onChange={handleFileChange} accept="video/*" />
      {isProcessing && <p>Processing... {uploadProgress.toFixed(2)}%</p>}
      {responseMessage && <p className={isError ? "error" : "success"}>{responseMessage}</p>}
      {transcript && (
        <div className="transcript-container">
          <h3>Transcript</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
