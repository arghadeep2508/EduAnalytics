"use client";

import { useState } from "react";
import { User, GraduationCap, Users, ArrowRight, BookOpen, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your progress, chat with AI assistant, and track your academic journey',
      icon: GraduationCap,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/student/login'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Upload attendance, manage assessments, and monitor student progress',
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      href: '/teacher/login'
    },
    {
      id: 'counselor',
      title: 'Counselor',
      description: 'Provide guidance, manage counseling requests, and support student wellbeing',
      icon: User,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/counselor/dashboard'
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Analytics',
      description: 'Advanced machine learning algorithms predict dropout risk and provide early intervention.'
    },
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Daily MCQs, progress tracking, and personalized AI chatbot assistance.'
    },
    {
      icon: Shield,
      title: 'Comprehensive Support',
      description: 'Integrated counseling system with automated alerts and parent notifications.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduAnalytics</span>
            </div>
            <div className="text-sm text-gray-600">
              AI-based Drop-out Prediction & Counseling System
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-playfair text-[clamp(3rem,5vw,6rem)] font-bold leading-[0.9] text-gray-900 mb-6">
            Transform Education with{" "}
            <span className="italic font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Analytics
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
            Empower educators, support students, and prevent dropouts with our comprehensive 
            analytics platform that combines machine learning insights with personalized counseling.
          </p>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <a
                  key={role.id}
                  href={role.href}
                  className={`
                    group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                    ${selectedRole === role.id 
                      ? `border-${role.color.split('-')[1]}-500 ${role.lightColor}` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  onMouseEnter={() => setSelectedRole(role.id)}
                  onMouseLeave={() => setSelectedRole(null)}
                >
                  <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${selectedRole === role.id ? role.textColor : 'text-gray-900'}`}>
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center justify-center text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    Get Started
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Educational Analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI with intuitive design to create 
              a holistic support system for educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-16">
            Making a Real Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Accuracy in Predictions</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Students Supported</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Schools Partnered</div>
            </div>
            <div className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">AI Assistant Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold">EduAnalytics</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 EduAnalytics. Empowering education through AI.
            </div>
          </div>
        </div>
      </footer>

      {/* Google Fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap');
        
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
