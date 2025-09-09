"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  User, 
  MessageCircle, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Users,
  TrendingUp,
  Bell,
  Phone,
  Mail,
  Filter,
  Search,
  Eye,
  UserCheck
} from "lucide-react";

export default function CounselorDashboard() {
  const [counselorData, setCounselorData] = useState({
    name: "Dr. Sarah Johnson",
    id: "COUNS001",
    school: "Springfield High School",
    specialization: "Academic & Career Counseling"
  });
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual endpoints
      const mockRequests = [
        {
          id: 1,
          student_name: "Alex Johnson",
          student_id: "STU001",
          urgency_level: "high",
          status: "pending",
          message: "Struggling with math and feeling overwhelmed",
          created_at: "2024-01-15T10:30:00Z",
          requester_type: "teacher"
        },
        {
          id: 2,
          student_name: "Maria Garcia",
          student_id: "STU002",
          urgency_level: "medium",
          status: "in_progress",
          message: "Student requested counseling support",
          created_at: "2024-01-14T14:20:00Z",
          requester_type: "student"
        },
        {
          id: 3,
          student_name: "David Chen",
          student_id: "STU003",
          urgency_level: "low",
          status: "completed",
          message: "Career guidance needed for college applications",
          created_at: "2024-01-13T09:15:00Z",
          requester_type: "parent"
        }
      ];

      const mockStudents = [
        {
          student_id: "STU001",
          name: "Alex Johnson",
          class: "10",
          section: "A",
          risk_level: "at-risk",
          overall_score: 35,
          attendance_rate: 65,
          last_interaction: "2024-01-10"
        },
        {
          student_id: "STU002",
          name: "Maria Garcia",
          class: "11",
          section: "B",
          risk_level: "warning",
          overall_score: 55,
          attendance_rate: 78,
          last_interaction: "2024-01-12"
        },
        {
          student_id: "STU004",
          name: "Emma Wilson",
          class: "9",
          section: "C",
          risk_level: "at-risk",
          overall_score: 42,
          attendance_rate: 70,
          last_interaction: "2024-01-08"
        }
      ];

      const mockAnalytics = {
        totalRequests: 15,
        pendingRequests: 5,
        completedRequests: 8,
        atRiskStudents: 12,
        requestsByUrgency: [
          { name: 'High', value: 3, color: '#ef4444' },
          { name: 'Medium', value: 7, color: '#f59e0b' },
          { name: 'Low', value: 5, color: '#10b981' }
        ],
        weeklyRequests: [
          { day: 'Mon', requests: 2 },
          { day: 'Tue', requests: 4 },
          { day: 'Wed', requests: 1 },
          { day: 'Thu', requests: 3 },
          { day: 'Fri', requests: 5 },
          { day: 'Sat', requests: 0 },
          { day: 'Sun', requests: 0 }
        ]
      };

      setRequests(mockRequests);
      setStudents(mockStudents);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      // Simulate API call
      console.log(`${action} request ${requestId}`);
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'in_progress' : 'completed' }
          : req
      ));
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at-risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    const matchesSearch = request.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading counselor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {counselorData.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {counselorData.specialization} • {counselorData.school}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell size={20} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {analytics?.pendingRequests || 0}
                </span>
              </div>
              <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.totalRequests}</p>
              </div>
              <MessageCircle size={24} className="text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-orange-600">{analytics?.pendingRequests}</p>
              </div>
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{analytics?.completedRequests}</p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At-Risk Students</p>
                <p className="text-2xl font-semibold text-red-600">{analytics?.atRiskStudents}</p>
              </div>
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Counseling Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Counseling Requests</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{request.student_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency_level)}`}>
                            {request.urgency_level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{request.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Requested by: {request.requester_type}</span>
                          <span>•</span>
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRequestAction(request.id, 'accept')}
                              className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200"
                            >
                              Accept
                            </button>
                            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">
                              View Details
                            </button>
                          </>
                        )}
                        {request.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => handleRequestAction(request.id, 'complete')}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors duration-200"
                            >
                              Complete
                            </button>
                            <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors duration-200">
                              Contact
                            </button>
                          </>
                        )}
                        {request.status === 'completed' && (
                          <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Requests Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Request Volume</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.weeklyRequests || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
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
                    <Bar dataKey="requests" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* At-Risk Students */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">At-Risk Students</h3>
              <div className="space-y-4">
                {students.filter(s => s.risk_level === 'at-risk').map((student) => (
                  <div key={student.student_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">Class {student.class}-{student.section}</p>
                      <p className="text-xs text-red-600">Score: {student.overall_score}/100</p>
                    </div>
                    <button className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200">
                      Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Priority</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.requestsByUrgency || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {analytics?.requestsByUrgency?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                {analytics?.requestsByUrgency?.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                  <Users size={20} className="text-purple-600" />
                  <span className="text-purple-700 font-medium">View All Students</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">Schedule Session</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <TrendingUp size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
