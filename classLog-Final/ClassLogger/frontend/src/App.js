import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CourseOutline from "./components/CourseOutline";
import LecturePlan from "./components/LecturePlan";
import Dashboard from "./components/Dashboard"; // Assuming you have a Dashboard component
import PDFPreview from './components/generate';
import UploadVideo from "./components/UploadVideo";
import Library from "./components/library";
import Login from './components/login/login';
import Register from "./components/login/register";
import Home from "./components/login/home";
import Profile from "./components/login/profile";
// import RequestResetPassword from "./components/login/requestresetpassword";
// import ResetPassword from "./components/login/resetpasswords";
import Hi from "./components/login/resetpasswords";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/home" element={<Home />}/>
        <Route path="/Profile" element={<Profile />}/>
        <Route path="/request_reset_password" element={<Hi />}/>
        {/* <Route path="/reset_password" element={<ResetPassword />}/> */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courseOutline/:subjectId" element={<CourseOutline />} />
        <Route path="/lecture/:lectureId" element={<LecturePlan />} />
        <Route path="/quiz/:lectureId" element={<PDFPreview pdfFileName="Quiz.pdf" heading="Generate Quiz"/>} />
        <Route path="/notes/:lectureId" element={<PDFPreview pdfFileName="Notes.pdf" heading="Generate Notes"/>} />
        <Route path="/upload/:lectureId" element={<UploadVideo/>} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Router>
  );
}

export default App;
