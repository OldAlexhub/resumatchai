import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap
import "./ResuMatchAI.css"; // Custom CSS
import Footer from "./Footer";

export default function ResuMatchAI() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // AI typing indicator

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // 📂 Handle Resume Upload
  const handleResumeUpload = (event) => {
    setResumeFile(event.target.files[0]);
  };

  // 🔍 Analyze Resume Against Job Description
  const analyzeResume = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and provide a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyze_resume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume. Please try again.");
    }
    setLoading(false);
  };

  // 🤖 Ask AI Recruiter Agent
  const askChatbot = async () => {
    if (!chatQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }

    setIsTyping(true);
    const userMessage = { role: "user", content: chatQuestion };
    setChatResponse((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/resume_chat`,
        { question: chatQuestion },
        { headers: { "Content-Type": "application/json" } }
      );
      const aiMessage = { role: "bot", content: response.data.answer };
      setChatResponse((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error with AI chat:", error);
      setChatResponse((prev) => [
        ...prev,
        { role: "bot", content: "Error: Unable to connect to AI Recruiter." },
      ]);
    }

    setChatQuestion("");
    setIsTyping(false);
  };

  // Compute job fit percentage
  let jobFitPercentage = null;
  let recommendation = "";
  if (analysisResult && analysisResult["Job Fit Score"] !== undefined) {
    jobFitPercentage = (analysisResult["Job Fit Score"] * 100).toFixed(0);
    recommendation =
      jobFitPercentage >= 70 ? "✅ Recommended" : "❌ Not Recommended";
  }

  return (
    <div className="container my-5">
      {/* 🏆 Header Section with Image */}
      <div className="text-center mb-4">
        <h1 className="text-primary fw-bold">ResuMatch AI</h1>
        <p className="text-muted">
          AI-powered Resume Analyzer for Job Seekers & Recruiters 🚀
        </p>
        <div className="image-placeholder mt-3">
          <div className="image-placeholder mt-3">
            <img
              src="https://img-cdn.inc.com/image/upload/f_webp,c_fit,w_1920,q_auto/vip/2025/01/GettyImages-2159627665.jpg"
              alt="ResuMatch AI"
              className="img-fluid"
            />
          </div>
        </div>
      </div>

      {/* 📝 Instructions Section */}
      <div className="bg-light p-4 rounded shadow-sm">
        <h4 className="text-secondary text-center">🔍 How It Works</h4>
        <ul className="list-group list-group-flush text-left">
          <li className="list-group-item">
            <strong>📂 Upload Your Resume:</strong> Select a PDF or DOCX file.
          </li>
          <li className="list-group-item">
            <strong>📄 Paste the Job Description:</strong> Copy and paste the
            job requirements.
          </li>
          <li className="list-group-item">
            <strong>📊 Analyze:</strong> Click "Analyze Resume" and let AI do
            the work.
          </li>
          <li className="list-group-item">
            <strong>✅ View Results:</strong> Get a **Job Fit Score**, see
            **matching skills**, and learn what’s **missing**.
          </li>
          <li className="list-group-item">
            <strong>💬 Chat with AI Recruiter:</strong> Ask questions about your
            resume and get AI-driven insights.
          </li>
        </ul>
      </div>

      {/* 📂 Upload & Analyze Section */}
      <div className="bg-white shadow-lg p-4 rounded mt-4">
        <h2 className="text-secondary">Upload Resume</h2>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleResumeUpload}
          className="form-control mb-3"
        />

        <h2 className="text-secondary">Paste Job Description</h2>
        <textarea
          className="form-control"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        ></textarea>

        <button onClick={analyzeResume} className="btn btn-primary mt-3 w-100">
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* 📊 Analysis Result */}
        {analysisResult && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h3 className="text-dark">Analysis Result</h3>
            <p>
              <strong>Name:</strong> {analysisResult.Name}
            </p>
            <p>
              <strong>Email:</strong> {analysisResult.Email}
            </p>
            <p>
              <strong>Phone:</strong> {analysisResult.Phone}
            </p>
            <p>
              <strong>Job Fit Score:</strong>{" "}
              {jobFitPercentage
                ? `${jobFitPercentage}%`
                : analysisResult["Job Fit Score"]}
            </p>
            {jobFitPercentage && (
              <p>
                <strong>Recommendation:</strong> {recommendation}
              </p>
            )}
            <p>
              <strong>Matching Skills:</strong>{" "}
              {analysisResult["Matching Skills"].join(", ")}
            </p>
            <p>
              <strong>Missing Skills:</strong>{" "}
              {analysisResult["Missing Skills"].join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* 🤖 AI Chatbox */}
      <div className={`chatbox ${chatVisible ? "active" : ""}`}>
        <div className="chatbox-header">
          <span>💬 AI Recruiter Agent</span>
          <button className="close-btn" onClick={() => setChatVisible(false)}>
            ×
          </button>
        </div>
        <div className="chatbox-body">
          {chatResponse.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.role === "user" ? "user-message" : "bot-message"
              }`}
            >
              <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>{" "}
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">AI Recruiter is typing...</div>
          )}
        </div>
        <div className="chatbox-footer">
          <input
            type="text"
            className="form-control"
            placeholder="Ask AI Recruiter..."
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && askChatbot()}
          />
          <button className="btn btn-success" onClick={askChatbot}>
            Ask AI
          </button>
        </div>
      </div>

      {/* 🟢 Chat Toggle & Footer */}
      <button
        className="chat-toggle"
        onClick={() => setChatVisible(!chatVisible)}
      >
        💬 Chat with AI
      </button>
      <Footer />
    </div>
  );
}
