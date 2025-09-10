"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  User, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Upload,
  HelpCircle
} from "lucide-react";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Get student data from localStorage
    const storedData = localStorage.getItem("studentData");
    if (storedData) {
      const student = JSON.parse(storedData);
      setStudentData(student);
      fetchProgressData(student.id);
    } else {
      // Redirect to login if no student data
      window.location.href = "/student/login";
    }
  }, []);

  const fetchProgressData = async (studentId) => {
    try {
      const response = await fetch(`/api/students/progress/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setProgressData(data.data);
        // Generate sine wave data for visualization
        generateSineWaveData(data.data);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSineWaveData = (data) => {
    // Create sine wave-like data points for the last 30 days
    const chartData = [];
    const baseScore = data.currentMetrics?.overallScore || 75;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      // Create sine wave variation around the base score
      const variation = Math.sin(i * 0.3) * 10 + Math.random() * 8 - 4;
      const score = Math.max(30, Math.min(100, baseScore + variation));
      
      chartData.push({
        day: i + 1,
        date: date.toLocaleDateString(),
        score: Math.round(score),
        marker: i === 29 // Last day gets the profile marker
      });
    }
    
    setProgressData(prev => ({ ...prev, chartData }));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !studentData) return;

    const userMessage = { type: 'user', message: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentData.id,
          question: chatInput
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const botMessage = { 
          type: 'bot', 
          message: data.response, 
          timestamp: new Date(),
          contextData: data.contextData 
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setChatInput("");
      setChatLoading(false);
    }
  };

  const handleCounselorRequest = async () => {
    try {
      const response = await fetch("/api/counselor/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentData.id,
          requesterType: 'student',
          requesterId: studentData.id,
          message: "Student has requested counseling support.",
          urgencyLevel: 'medium'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Counselor request submitted successfully! A counselor will contact you soon.");
      }
    } catch (error) {
      console.error("Counselor request error:", error);
      alert("Failed to submit counselor request. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    window.location.href = "/";
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.marker) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#3B82F6" stroke="#1E40AF" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
        </g>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const riskLevel = progressData?.currentMetrics?.riskLevel || 'safe';
  const riskColors = {
    safe: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    'at-risk': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome, {studentData?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Class {studentData?.class}-{studentData?.section} • {studentData?.school}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCounselorRequest}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <HelpCircle size={18} />
                <span>Ask Counselor</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Graph */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Academic Progress</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[riskLevel].bg} ${riskColors[riskLevel].text} ${riskColors[riskLevel].border} border`}>
                  {riskLevel === 'safe' && <CheckCircle size={16} className="inline mr-1" />}
                  {riskLevel === 'warning' && <Clock size={16} className="inline mr-1" />}
                  {riskLevel === 'at-risk' && <AlertTriangle size={16} className="inline mr-1" />}
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).replace('-', ' ')}
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData?.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Risk Line" />
                    <Line 
                      type="cardinal" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={<CustomDot />}
                      activeDot={{ r: 6, fill: '#1E40AF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                Your progress over the last 30 days. The red line at 40 indicates the risk threshold.
              </p>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {progressData?.recentMarks?.slice(0, 5).map((mark, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{mark.subject}</p>
                        <p className="text-sm text-gray-500">{mark.assessment_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {mark.marks_obtained}/{mark.total_marks}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round((mark.marks_obtained / mark.total_marks) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Score</span>
                  <span className="font-semibold text-xl text-gray-900">
                    {progressData?.currentMetrics?.overallScore || 0}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attendance</span>
                  <span className="font-semibold text-green-600">
                    {progressData?.currentMetrics?.attendanceRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Academic Performance</span>
                  <span className="font-semibold text-blue-600">
                    {progressData?.currentMetrics?.academicPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                >
                  <MessageCircle size={20} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Ask AI Assistant</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">View Schedule</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <TrendingUp size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">Progress Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Hi! I'm here to help you with your studies.</p>
                  <p className="text-sm mt-2">Ask me about your attendance, marks, or request practice questions!</p>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-40"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
