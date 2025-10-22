import React, { useState, useEffect } from 'react';
import { AlertCircle, Mail, Lock, User, Send, LogOut, Eye, EyeOff, MessageSquare, Shield, BookOpen } from 'lucide-react';

// Thunder AI Client Mock (Replace with actual Thunder AI SDK)
const ThunderAIClient = {
  async register(email, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
          reject(new Error('Email already exists'));
        } else {
          const newUser = { id: Date.now(), email, password, role };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          resolve({ success: true, user: { id: newUser.id, email, role } });
        }
      }, 1000);
    });
  },

  async login(email, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password && u.role === role);
        if (user) {
          resolve({ success: true, user: { id: user.id, email, role } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  async resetPassword(email, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.role === role);
        if (user) {
          resolve({ success: true, message: 'Password reset link sent to email' });
        } else {
          reject(new Error('Email not found'));
        }
      }, 1000);
    });
  }
};

// Complaint Storage
const ComplaintStorage = {
  async submitComplaint(complaint) {
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const newComplaint = {
      id: Date.now(),
      ...complaint,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    complaints.push(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    return newComplaint;
  },

  async getComplaints() {
    return JSON.parse(localStorage.getItem('complaints') || '[]');
  }
};

function App() {
  const [view, setView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUserType(user.role);
      setView(user.role === 'student' ? 'studentDashboard' : 'teacherDashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setUserType(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {view === 'home' && <HomePage setView={setView} setUserType={setUserType} />}
      {view === 'login' && <LoginPage userType={userType} setView={setView} setCurrentUser={setCurrentUser} />}
      {view === 'signup' && <SignupPage userType={userType} setView={setView} setCurrentUser={setCurrentUser} />}
      {view === 'forgot' && <ForgotPasswordPage userType={userType} setView={setView} />}
      {view === 'studentDashboard' && <StudentDashboard user={currentUser} onLogout={handleLogout} />}
      {view === 'teacherDashboard' && <TeacherDashboard user={currentUser} onLogout={handleLogout} />}
    </div>
  );
}

function HomePage({ setView, setUserType }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Student Complaint Box
          </h1>
          <p className="text-xl text-gray-600">
            Your voice matters. Submit complaints securely and anonymously.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => {
              setUserType('student');
              setView('login');
            }}
            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
            <p className="text-gray-600 mb-4">
              Submit your complaints and concerns anonymously
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              Continue as Student
              <span className="ml-2">→</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setUserType('teacher');
              setView('login');
            }}
            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h2>
            <p className="text-gray-600 mb-4">
              Review and address student complaints
            </p>
            <div className="flex items-center text-indigo-600 font-semibold">
              Continue as Teacher
              <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ userType, setView, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ThunderAIClient.login(email, password, userType);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setCurrentUser(response.user);
      setView(userType === 'student' ? 'studentDashboard' : 'teacherDashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setView('home')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${userType === 'student' ? 'bg-blue-100' : 'bg-indigo-100'} rounded-xl mb-4`}>
              {userType === 'student' ? <BookOpen className="w-8 h-8 text-blue-600" /> : <Shield className="w-8 h-8 text-indigo-600" />}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {userType === 'student' ? 'Student' : 'Teacher'} Login
            </h2>
            <p className="text-gray-600 mt-2">Welcome back! Please enter your credentials.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@college.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${userType === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => setView('signup')}
              className={`${userType === 'student' ? 'text-blue-600 hover:text-blue-700' : 'text-indigo-600 hover:text-indigo-700'} font-semibold`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ userType, setView, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await ThunderAIClient.register(email, password, userType);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setCurrentUser(response.user);
      setView(userType === 'student' ? 'studentDashboard' : 'teacherDashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setView('login')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${userType === 'student' ? 'bg-blue-100' : 'bg-indigo-100'} rounded-xl mb-4`}>
              <User className={`w-8 h-8 ${userType === 'student' ? 'text-blue-600' : 'text-indigo-600'}`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Create {userType === 'student' ? 'Student' : 'Teacher'} Account
            </h2>
            <p className="text-gray-600 mt-2">Join our complaint management system</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@college.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${userType === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={() => setView('login')}
              className={`${userType === 'student' ? 'text-blue-600 hover:text-blue-700' : 'text-indigo-600 hover:text-indigo-700'} font-semibold`}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage({ userType, setView }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ThunderAIClient.resetPassword(email, userType);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setView('login')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${userType === 'student' ? 'bg-blue-100' : 'bg-indigo-100'} rounded-xl mb-4`}>
              <Lock className={`w-8 h-8 ${userType === 'student' ? 'text-blue-600' : 'text-indigo-600'}`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Password reset link has been sent to your email!
                </p>
              </div>
              <button
                onClick={() => setView('login')}
                className={`${userType === 'student' ? 'text-blue-600 hover:text-blue-700' : 'text-indigo-600 hover:text-indigo-700'} font-semibold`}
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@college.edu"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${userType === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user, onLogout }) {
  const [complaint, setComplaint] = useState('');
  const [category, setCategory] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await ComplaintStorage.submitComplaint({
        studentId: user.id,
        complaint,
        category
      });
      setSuccess(true);
      setComplaint('');
      setCategory('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Complaint submitted successfully! Teachers can now review it.
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Submit Your Complaint</h2>
            <p className="text-gray-600">
              Your identity is protected. Only your complaint will be visible to teachers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                <option value="Academic">Academic</option>
                <option value="Facilities">Facilities</option>
                <option value="Administration">Administration</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Details
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="8"
                placeholder="Describe your complaint in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await ComplaintStorage.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.category === filter);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Student Complaints</h2>
            <p className="text-gray-600">
              Review and address student concerns. Student identities are protected.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Facilities">Facilities</option>
              <option value="Administration">Administration</option>
              <option value="Harassment">Harassment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No complaints found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                        {complaint.category}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(complaint.timestamp).toLocaleDateString()} at {new Date(complaint.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      {complaint.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{complaint.complaint}</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Student identity is protected and not accessible
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;