"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Upload, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Download,
  Plus
} from "lucide-react";

export default function TeacherDashboard() {
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);

  useEffect(() => {
    // Get teacher data from localStorage
    const storedData = localStorage.getItem("teacherData");
    if (storedData) {
      const teacher = JSON.parse(storedData);
      setTeacherData(teacher);
      fetchStudents(teacher.schoolId);
    } else {
      // Redirect to login if no teacher data
      window.location.href = "/teacher/login";
    }
  }, []);

  const fetchStudents = async (schoolId) => {
    try {
      const response = await fetch(`/api/teacher/students?schoolId=${schoolId}`);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
        // Initialize attendance records
        initializeAttendanceRecords(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendanceRecords = (studentList) => {
    const records = studentList.map(student => ({
      studentId: student.student_id,
      studentName: student.name,
      class: student.class_level,
      section: student.section,
      present: true,
      remarks: ""
    }));
    setAttendanceRecords(records);
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleAttendanceSubmit = async () => {
    setUploadingAttendance(true);
    
    try {
      const attendanceData = attendanceRecords.map(record => ({
        studentId: record.studentId,
        date: attendanceDate,
        present: record.present,
        remarks: record.remarks
      }));

      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceData,
          teacherId: teacherData.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Attendance uploaded successfully!");
        // Refresh students data to get updated progress
        fetchStudents(teacherData.schoolId);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error uploading attendance:", error);
      alert("Failed to upload attendance. Please try again.");
    } finally {
      setUploadingAttendance(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacherData");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const riskCounts = students.reduce((acc, student) => {
    const risk = student.risk_level || 'safe';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const atRiskStudents = students.filter(s => s.risk_level === 'at-risk');
  const warningStudents = students.filter(s => s.risk_level === 'warning');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {teacherData?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {teacherData?.subject} Teacher • {teacherData?.school}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'students', label: 'Students', icon: User },
              { id: 'marks', label: 'Marks', icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                  </div>
                  <Users size={32} className="text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Safe Students</p>
                    <p className="text-3xl font-bold text-green-600">{riskCounts.safe || 0}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Warning</p>
                    <p className="text-3xl font-bold text-yellow-600">{riskCounts.warning || 0}</p>
                  </div>
                  <Clock size={32} className="text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">At Risk</p>
                    <p className="text-3xl font-bold text-red-600">{riskCounts['at-risk'] || 0}</p>
                  </div>
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
              </div>
            </div>

            {/* At-Risk Students Alert */}
            {atRiskStudents.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <AlertTriangle size={24} className="text-red-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Students at Risk of Dropping Out
                    </h3>
                    <p className="text-red-700 mb-4">
                      The following students require immediate attention and intervention:
                    </p>
                    <div className="space-y-2">
                      {atRiskStudents.map(student => (
                        <div key={student.student_id} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">
                              Class {student.class_level}-{student.section} • 
                              Score: {student.overall_score || 'N/A'}/100
                            </p>
                          </div>
                          <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200">
                            Contact Counselor
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Students */}
            {warningStudents.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <Clock size={24} className="text-yellow-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Students Requiring Attention
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      These students may need additional support:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {warningStudents.map(student => (
                        <div key={student.student_id} className="bg-white rounded-lg p-3">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            Class {student.class_level}-{student.section} • 
                            Score: {student.overall_score || 'N/A'}/100
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Record Attendance</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAttendanceSubmit}
                    disabled={uploadingAttendance}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>{uploadingAttendance ? "Uploading..." : "Submit Attendance"}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Present</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map(record => (
                      <tr key={record.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{record.studentName}</p>
                          <p className="text-sm text-gray-600">{record.studentId}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.class}-{record.section}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={record.present}
                            onChange={(e) => handleAttendanceChange(record.studentId, 'present', e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={record.remarks}
                            onChange={(e) => handleAttendanceChange(record.studentId, 'remarks', e.target.value)}
                            placeholder="Optional remarks..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Students</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Overall Score</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const riskLevel = student.risk_level || 'safe';
                    const riskColors = {
                      safe: 'bg-green-100 text-green-800',
                      warning: 'bg-yellow-100 text-yellow-800',
                      'at-risk': 'bg-red-100 text-red-800'
                    };

                    return (
                      <tr key={student.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.student_id}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {student.class_level}-{student.section}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {student.overall_score || 'N/A'}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[riskLevel]}`}>
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {student.last_progress_update ? 
                            new Date(student.last_progress_update).toLocaleDateString() : 
                            'Never'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Marks Management</h3>
              <p className="text-gray-600 mb-6">Upload and manage student assessment marks</p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 mx-auto">
                <Plus size={20} />
                <span>Add Assessment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
