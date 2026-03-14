import React, { useState, useEffect } from 'react';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import BatchEdit from '../components/BatchEdit';
import ClassroomQuery from '../components/ClassroomQuery';
import WeekView from '../components/WeekView';
import MajorManager from '../components/MajorManager';
import { useTheme } from '../contexts/ThemeContext';
import { courseApi, majorApi, icsApi } from '../services/api';

const HomePage = () => {
  const { colors, glass, animation, isDarkMode, toggleDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showClassroomQuery, setShowClassroomQuery] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMajorManager, setShowMajorManager] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [currentMajor, setCurrentMajor] = useState(null);
  const [icsUrl, setIcsUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [importData, setImportData] = useState('');
  const [viewMode, setViewMode] = useState('week');
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    fetchMajors();
  }, []);

  useEffect(() => {
    fetchCourses();
    updateIcsUrl();
  }, [refresh, currentMajor]);

  const fetchMajors = async () => {
    try {
      const response = await majorApi.getAll();
      setMajors(response.data);
      if (response.data.length > 0 && !currentMajor) {
        setCurrentMajor(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch majors:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAll(currentMajor?.id);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const updateIcsUrl = () => {
    const baseUrl = window.location.origin;
    if (currentMajor) {
      setIcsUrl(`${baseUrl}/api/ics/majors/${currentMajor.id}/subscribe`);
    } else {
      setIcsUrl(`${baseUrl}/api/ics/subscribe/1`);
    }
  };

  const handleAddCourse = () => {
    setCurrentCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setCurrentCourse(course);
    setShowForm(true);
  };

  const handleBatchEdit = () => {
    if (selectedCourses.length > 0) {
      setShowBatchEdit(true);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedCourses.length === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selectedCourses.length} 个课程吗？`)) {
      try {
        const courseIds = selectedCourses.map(course => course.id);
        for (const id of courseIds) {
          await courseApi.delete(id);
        }
        setRefresh(!refresh);
        setSelectedCourses([]);
        alert('批量删除成功！');
      } catch (error) {
        console.error('Failed to batch delete courses:', error);
        alert('批量删除失败，请重试');
      }
    }
  };

  const handleClassroomQuery = () => {
    setShowClassroomQuery(!showClassroomQuery);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentCourse(null);
  };

  const handleCloseBatchEdit = () => {
    setShowBatchEdit(false);
  };

  const handleSubmit = () => {
    setRefresh(!refresh);
  };

  const handleSelectCourses = (courses) => {
    setSelectedCourses(courses);
  };

  const handleCopyIcsUrl = async () => {
    try {
      await navigator.clipboard.writeText(icsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('复制失败，请手动复制链接');
    }
  };

  const handleImportIcs = async () => {
    if (!importData.trim()) {
      alert('请输入 ICS 数据');
      return;
    }

    try {
      const events = parseICS(importData);
      for (const event of events) {
        await courseApi.create({ ...event, major_id: currentMajor?.id });
      }
      setRefresh(!refresh);
      setShowImportModal(false);
      setImportData('');
      alert(`成功导入 ${events.length} 个课程！`);
    } catch (error) {
      console.error('Failed to import ICS:', error);
      alert('导入失败，请检查 ICS 格式是否正确');
    }
  };

  const parseICS = (icsData) => {
    const events = [];
    const lines = icsData.split('\n');
    let currentEvent = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT') {
        if (currentEvent && currentEvent.name) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.name = line.substring(8);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        } else if (line.startsWith('DTSTART')) {
          const dateStr = line.split(':')[1];
          currentEvent.start_time = parseICSDatetime(dateStr);
        } else if (line.startsWith('DTEND')) {
          const dateStr = line.split(':')[1];
          currentEvent.end_time = parseICSDatetime(dateStr);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.teacher = line.substring(12);
        }
      }
    }

    return events.map(event => ({
      ...event,
      teacher: event.teacher || '未知教师',
      location: event.location || '未知地点',
      day_of_week: new Date(event.start_time).getDay() || 1,
      is_odd_week: null,
      reminder_time: 10
    }));
  };

  const parseICSDatetime = (dateStr) => {
    if (dateStr.includes('T')) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(9, 11);
      const minute = dateStr.substring(11, 13);
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    return dateStr;
  };

  // Glass card style
  const glassCardStyle = {
    background: glass.surface.primary,
    backdropFilter: glass.blur.lg,
    WebkitBackdropFilter: glass.blur.lg,
    border: `1px solid ${glass.border.medium}`,
    borderRadius: '20px',
    boxShadow: `${glass.shadow.md}, ${glass.shadow.inner}`,
    position: 'relative',
    overflow: 'hidden',
  };

  const glassButtonStyle = (color = colors.primary, isActive = false) => ({
    background: isActive 
      ? `linear-gradient(135deg, ${color}dd, ${color})`
      : glass.surface.secondary,
    backdropFilter: glass.blur.md,
    border: `1px solid ${isActive ? color + '60' : glass.border.medium}`,
    borderRadius: '14px',
    color: isActive ? 'white' : colors.textPrimary,
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: `all ${animation.duration.normal} ${animation.spring}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: isActive ? `0 4px 20px ${color}40` : 'none',
  });

  const statCardStyle = (accentColor) => ({
    ...glassCardStyle,
    padding: '24px',
    transition: `all ${animation.duration.normal} ${animation.spring}`,
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f0f2f5 0%, #e8ecf1 50%, #f5f7fa 100%)',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${colors.primary}30; }
          50% { box-shadow: 0 0 40px ${colors.primary}50; }
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${glass.gradient.shimmer};
          animation: shimmer 3s infinite;
          pointer-events: none;
        }
        .btn-press:active {
          transform: scale(0.96) !important;
        }
        .card-hover {
          transition: all ${animation.duration.normal} ${animation.spring};
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: ${glass.shadow.lg}, 0 0 50px ${colors.primary}25;
        }
        .input-glass:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 4px ${colors.primary}20, inset 0 1px 2px rgba(0,0,0,0.05);
        }
        .select-glass {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
      `}</style>

      {/* Background decorative elements */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: `radial-gradient(circle, ${colors.purple}15 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        filter: 'blur(50px)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Header */}
      <header style={{ 
        background: glass.surface.elevated,
        backdropFilter: glass.blur.xl,
        borderBottom: `1px solid ${glass.border.medium}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.indigo})`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 30px ${colors.primary}50`,
                animation: 'float 4s ease-in-out infinite',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>ClassIcs</h1>
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0 0', fontWeight: '500' }}>智能课表管理系统</p>
              </div>
            </div>
            
            {/* Major Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={currentMajor?.id || ''}
                  onChange={(e) => {
                    const major = majors.find(m => m.id === parseInt(e.target.value));
                    setCurrentMajor(major);
                    setSelectedCourses([]);
                  }}
                  style={{
                    padding: '12px 40px 12px 18px',
                    border: `1px solid ${glass.border.medium}`,
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: glass.surface.secondary,
                    backdropFilter: glass.blur.md,
                    color: colors.textPrimary,
                    minWidth: '180px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: `all ${animation.duration.fast} ease`,
                  }}
                  className="select-glass input-glass"
                >
                  <option value="">选择专业</option>
                  {majors.map(major => (
                    <option key={major.id} value={major.id}>{major.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowMajorManager(true)}
                style={{
                  ...glassButtonStyle(colors.indigo),
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="btn-press"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.indigo}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
                管理专业
              </button>
            </div>
            
            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* ICS URL */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                background: glass.surface.secondary,
                backdropFilter: glass.blur.md,
                padding: '10px 14px',
                borderRadius: '14px',
                border: `1px solid ${glass.border.medium}`,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <input 
                  type="text" 
                  value={icsUrl} 
                  readOnly 
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    fontSize: '13px', 
                    fontWeight: '500',
                    color: colors.textSecondary,
                    width: '180px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleCopyIcsUrl}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    background: copied ? colors.success : colors.primary,
                    color: 'white',
                    boxShadow: copied ? `0 4px 15px ${colors.success}50` : `0 4px 15px ${colors.primary}40`,
                    transition: `all ${animation.duration.fast} ease`,
                  }}
                  className="btn-press"
                >
                  {copied ? '已复制!' : '复制'}
                </button>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  border: `1px solid ${glass.border.medium}`,
                  background: glass.surface.secondary,
                  backdropFilter: glass.blur.md,
                  cursor: 'pointer',
                  transition: `all ${animation.duration.normal} ${animation.spring}`,
                }}
                className="btn-press"
                title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)';
                  e.currentTarget.style.boxShadow = glass.shadow.glow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isDarkMode ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div className="card-hover" style={statCardStyle(colors.primary)}>
            <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 6px 0', fontWeight: '500' }}>总课程数</p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: colors.textPrimary, margin: 0, letterSpacing: '-1px' }}>{courses.length}</p>
              </div>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}10)`,
                backdropFilter: glass.blur.md,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.primary}30`,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="card-hover" style={statCardStyle(colors.success)}>
            <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 6px 0', fontWeight: '500' }}>已选择</p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: colors.textPrimary, margin: 0, letterSpacing: '-1px' }}>{selectedCourses.length}</p>
              </div>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: `linear-gradient(135deg, ${colors.success}30, ${colors.success}10)`,
                backdropFilter: glass.blur.md,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.success}30`,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div className="card-hover" style={statCardStyle(colors.purple)}>
            <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 6px 0', fontWeight: '500' }}>本周课程</p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: colors.textPrimary, margin: 0, letterSpacing: '-1px' }}>
                  {courses.filter(c => c.day_of_week >= 1 && c.day_of_week <= 5).length}
                </p>
              </div>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: `linear-gradient(135deg, ${colors.purple}30, ${colors.purple}10)`,
                backdropFilter: glass.blur.md,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.purple}30`,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>

          <div className="card-hover" style={statCardStyle(colors.indigo)}>
            <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 6px 0', fontWeight: '500' }}>当前专业</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>
                  {currentMajor?.name || '未选择'}
                </p>
              </div>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: `linear-gradient(135deg, ${colors.indigo}30, ${colors.indigo}10)`,
                backdropFilter: glass.blur.md,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.indigo}30`,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.indigo} strokeWidth="2">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          ...glassCardStyle,
          padding: '20px 24px',
          marginBottom: '24px',
        }}>
          <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <button 
              onClick={handleAddCourse}
              disabled={!currentMajor}
              style={{
                ...glassButtonStyle(colors.primary, false),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                opacity: currentMajor ? 1 : 0.5,
                cursor: currentMajor ? 'pointer' : 'not-allowed',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                if (currentMajor) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.primary}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加课程
            </button>

            <button 
              onClick={handleBatchEdit} 
              disabled={selectedCourses.length === 0}
              style={{
                ...glassButtonStyle(colors.success, false),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                opacity: selectedCourses.length === 0 ? 0.5 : 1,
                cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                if (selectedCourses.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.success}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              批量编辑 ({selectedCourses.length})
            </button>

            <button 
              onClick={handleBatchDelete}
              disabled={selectedCourses.length === 0}
              style={{
                ...glassButtonStyle(colors.danger, false),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                opacity: selectedCourses.length === 0 ? 0.5 : 1,
                cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                if (selectedCourses.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.danger}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              批量删除
            </button>

            <button 
              onClick={handleClassroomQuery}
              style={{
                ...glassButtonStyle(colors.purple, showClassroomQuery),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                if (!showClassroomQuery) {
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.purple}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (!showClassroomQuery) {
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {showClassroomQuery ? '关闭空教室查询' : '空教室查询'}
            </button>

            <button 
              onClick={() => setShowImportModal(true)}
              disabled={!currentMajor}
              style={{
                ...glassButtonStyle(colors.indigo, false),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                marginLeft: 'auto',
                opacity: currentMajor ? 1 : 0.5,
                cursor: currentMajor ? 'pointer' : 'not-allowed',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                if (currentMajor) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.indigo}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              导入 ICS
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setViewMode('week')}
            style={{
              ...glassButtonStyle(colors.primary, viewMode === 'week'),
              padding: '10px 24px',
              fontWeight: '700',
            }}
            className="btn-press"
          >
            一周视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              ...glassButtonStyle(colors.primary, viewMode === 'list'),
              padding: '10px 24px',
              fontWeight: '700',
            }}
            className="btn-press"
          >
            列表视图
          </button>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkMode 
              ? 'rgba(10, 10, 15, 0.9)'
              : 'rgba(240, 242, 245, 0.9)',
            backdropFilter: glass.blur.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: `fadeIn ${animation.duration.normal} ease`,
          }}>
            <div style={{
              ...glassCardStyle,
              padding: '32px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              animation: `slideUp ${animation.duration.slow} ${animation.spring}`,
            }}>
              <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15 }} />
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.textPrimary, marginBottom: '16px', position: 'relative', zIndex: 1 }}>导入 ICS 课程</h2>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                导入到专业: <strong style={{ color: colors.textPrimary }}>{currentMajor?.name}</strong>
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="在此粘贴 ICS 格式的课程数据..."
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '16px',
                  border: `1px solid ${glass.border.medium}`,
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  background: glass.surface.secondary,
                  backdropFilter: glass.blur.md,
                  color: colors.textPrimary,
                  outline: 'none',
                }}
                className="input-glass"
              />
              <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '12px', position: 'relative', zIndex: 1 }}>
                支持标准 ICS 格式，系统会自动解析课程名称、时间、地点等信息。
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
                <button 
                  onClick={() => setShowImportModal(false)}
                  style={{
                    ...glassButtonStyle(),
                    padding: '12px 24px',
                  }}
                  className="btn-press"
                >
                  取消
                </button>
                <button 
                  onClick={handleImportIcs}
                  style={{
                    ...glassButtonStyle(colors.primary, true),
                    padding: '12px 28px',
                  }}
                  className="btn-press"
                >
                  导入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Major Manager Modal */}
        {showMajorManager && (
          <MajorManager
            majors={majors}
            onClose={() => setShowMajorManager(false)}
            onUpdate={() => {
              fetchMajors();
              setRefresh(!refresh);
            }}
          />
        )}

        {/* Forms */}
        {showForm && (
          <div style={{ marginBottom: '24px', animation: `slideUp ${animation.duration.normal} ease` }}>
            <CourseForm
              course={currentCourse}
              currentMajor={currentMajor}
              onClose={handleCloseForm}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {showBatchEdit && (
          <div style={{ marginBottom: '24px', animation: `slideUp ${animation.duration.normal} ease` }}>
            <BatchEdit
              selectedCourses={selectedCourses}
              onClose={handleCloseBatchEdit}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {showClassroomQuery && (
          <div style={{ marginBottom: '24px', animation: `slideUp ${animation.duration.normal} ease` }}>
            <ClassroomQuery />
          </div>
        )}

        {/* Main View */}
        <div style={{ animation: `fadeIn ${animation.duration.slow} ease` }}>
          {viewMode === 'week' ? (
            <WeekView courses={courses} onEditCourse={handleEditCourse} />
          ) : (
            <div style={{ ...glassCardStyle, padding: '4px' }}>
              <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <CourseList 
                  key={refresh} 
                  onSelectCourses={handleSelectCourses}
                  onEditCourse={handleEditCourse}
                  courses={courses}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: glass.surface.elevated,
        backdropFilter: glass.blur.xl,
        borderTop: `1px solid ${glass.border.medium}`,
        marginTop: '48px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: colors.textSecondary }}>
            <p style={{ margin: 0, fontWeight: '500' }}>ClassIcs - 智能课表管理系统</p>
            <p style={{ margin: 0, fontWeight: '500' }}>支持 iCalendar 订阅格式</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
