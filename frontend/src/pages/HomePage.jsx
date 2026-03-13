import React, { useState, useEffect } from 'react';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import BatchEdit from '../components/BatchEdit';
import ClassroomQuery from '../components/ClassroomQuery';
import WeekView from '../components/WeekView';
import { useTheme } from '../contexts/ThemeContext';
import { courseApi } from '../services/api';

const HomePage = () => {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showClassroomQuery, setShowClassroomQuery] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [courses, setCourses] = useState([]);
  const [icsUrl, setIcsUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [importData, setImportData] = useState('');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'list'

  useEffect(() => {
    fetchCourses();
    const baseUrl = window.location.origin;
    setIcsUrl(`${baseUrl}/api/ics/subscribe/1`);
  }, [refresh]);

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
        await courseApi.create(event);
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Header */}
      <header style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: colors.primary, 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>ClassIcs</h1>
                <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>智能课表管理系统</p>
              </div>
            </div>
            
            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* ICS URL */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
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
                    color: colors.textSecondary,
                    width: '200px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleCopyIcsUrl}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: copied ? colors.success : colors.primary,
                    color: 'white'
                  }}
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  cursor: 'pointer'
                }}
                title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
              >
                {isDarkMode ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: colors.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>总课程数</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>{courses.length}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: isDarkMode ? '#1e3a5f' : '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>已选择</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>{selectedCourses.length}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: isDarkMode ? '#14532d' : '#d1fae5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>本周课程</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                  {courses.filter(c => c.day_of_week >= 1 && c.day_of_week <= 5).length}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: isDarkMode ? '#581c87' : '#f3e8ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>提醒设置</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>10分钟</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: isDarkMode ? '#7c2d12' : '#fed7aa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ backgroundColor: colors.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleAddCourse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加课程
            </button>

            <button 
              onClick={handleBatchEdit} 
              disabled={selectedCourses.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: selectedCourses.length === 0 ? colors.border : colors.success,
                color: selectedCourses.length === 0 ? colors.textMuted : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              批量编辑 ({selectedCourses.length})
            </button>

            <button 
              onClick={handleBatchDelete}
              disabled={selectedCourses.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: selectedCourses.length === 0 ? colors.border : colors.danger,
                color: selectedCourses.length === 0 ? colors.textMuted : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              批量删除
            </button>

            <button 
              onClick={handleClassroomQuery}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: showClassroomQuery ? (isDarkMode ? '#4c1d95' : '#f3e8ff') : colors.purple,
                color: showClassroomQuery ? (isDarkMode ? '#d8b4fe' : '#7c3aed') : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {showClassroomQuery ? '关闭空教室查询' : '空教室查询'}
            </button>

            <button 
              onClick={() => setShowImportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: colors.indigo,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              导入 ICS
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setViewMode('week')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'week' ? colors.primary : colors.surface,
              color: viewMode === 'week' ? 'white' : colors.textPrimary,
              border: `1px solid ${viewMode === 'week' ? colors.primary : colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            一周视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'list' ? colors.primary : colors.surface,
              color: viewMode === 'list' ? 'white' : colors.textPrimary,
              border: `1px solid ${viewMode === 'list' ? colors.primary : colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
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
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: colors.surface,
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: `1px solid ${colors.border}`
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '16px' }}>导入 ICS 课程</h2>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="在此粘贴 ICS 格式的课程数据..."
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  backgroundColor: colors.surface,
                  color: colors.textPrimary
                }}
              />
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px' }}>
                支持标准 ICS 格式，系统会自动解析课程名称、时间、地点等信息。
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => setShowImportModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.border,
                    color: colors.textPrimary,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button 
                  onClick={handleImportIcs}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  导入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forms */}
        {showForm && (
          <div style={{ marginBottom: '24px' }}>
            <CourseForm
              course={currentCourse}
              onClose={handleCloseForm}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {showBatchEdit && (
          <div style={{ marginBottom: '24px' }}>
            <BatchEdit
              selectedCourses={selectedCourses}
              onClose={handleCloseBatchEdit}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {showClassroomQuery && (
          <div style={{ marginBottom: '24px' }}>
            <ClassroomQuery />
          </div>
        )}

        {/* Main View */}
        {viewMode === 'week' ? (
          <WeekView courses={courses} />
        ) : (
          <div style={{ backgroundColor: colors.surface, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <CourseList 
              key={refresh} 
              onSelectCourses={handleSelectCourses}
              onEditCourse={handleEditCourse}
              courses={courses}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: colors.surface, borderTop: `1px solid ${colors.border}`, marginTop: '48px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: colors.textSecondary }}>
            <p>ClassIcs - 智能课表管理系统</p>
            <p>支持 iCalendar 订阅格式</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
