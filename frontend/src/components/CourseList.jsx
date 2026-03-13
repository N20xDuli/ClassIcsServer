import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { courseApi } from '../services/api';

const CourseList = ({ onSelectCourses, onEditCourse, courses: propCourses }) => {
  const { colors } = useTheme();
  const [courses, setCourses] = useState(propCourses || []);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('all');

  useEffect(() => {
    if (propCourses) {
      setCourses(propCourses);
      setLoading(false);
    } else {
      fetchCourses();
    }
  }, [propCourses]);

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (course) => {
    setSelectedCourses(prev => {
      let newSelected;
      if (prev.some(c => c.id === course.id)) {
        newSelected = prev.filter(c => c.id !== course.id);
      } else {
        newSelected = [...prev, course];
      }
      onSelectCourses(newSelected);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
      onSelectCourses([]);
    } else {
      setSelectedCourses(filteredCourses);
      onSelectCourses(filteredCourses);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('确定要删除这个课程吗？')) {
      try {
        await courseApi.delete(courseId);
        fetchCourses();
        setSelectedCourses(prev => {
          const newSelected = prev.filter(c => c.id !== courseId);
          onSelectCourses(newSelected);
          return newSelected;
        });
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const getDayOfWeekText = (day) => {
    const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days[day] || '未知';
  };

  const getWeekTypeText = (isOddWeek) => {
    if (isOddWeek === null) return '每周';
    return isOddWeek ? '单周' : '双周';
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = filterDay === 'all' || course.day_of_week === parseInt(filterDay);
    return matchesSearch && matchesDay;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid ' + colors.border, 
          borderTop: '3px solid ' + colors.primary, 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <span style={{ marginLeft: '12px', color: colors.textSecondary }}>加载课程中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>课程列表</h2>
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>
              共 {filteredCourses.length} 个课程
              {selectedCourses.length > 0 && `，已选择 ${selectedCourses.length} 个`}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  width: '200px',
                  backgroundColor: colors.surface,
                  color: colors.textPrimary
                }}
              />
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>

            {/* Day filter */}
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            >
              <option value="all">全部星期</option>
              <option value="1">周一</option>
              <option value="2">周二</option>
              <option value="3">周三</option>
              <option value="4">周四</option>
              <option value="5">周五</option>
              <option value="6">周六</option>
              <option value="7">周日</option>
            </select>

            {/* Select all */}
            <button
              onClick={handleSelectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.surface,
                fontSize: '14px',
                color: colors.textPrimary,
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                readOnly
                style={{ margin: 0 }}
              />
              <span>
                {selectedCourses.length === filteredCourses.length && filteredCourses.length > 0 ? '取消全选' : '全选'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: colors.border, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <p style={{ color: colors.textSecondary, fontSize: '16px', margin: '0 0 8px' }}>暂无课程</p>
          <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>点击 "添加课程" 按钮创建您的第一个课程</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '16px', 
          padding: '24px' 
        }}>
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              style={{
                position: 'relative',
                backgroundColor: colors.surface,
                border: selectedCourses.some(c => c.id === course.id) ? '2px solid ' + colors.primary : `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              {/* Checkbox */}
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <input
                  type="checkbox"
                  checked={selectedCourses.some(c => c.id === course.id)}
                  onChange={() => handleCheckboxChange(course)}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>

              {/* Content */}
              <div style={{ paddingLeft: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: colors.textPrimary, 
                  margin: '0 0 12px 0',
                  paddingRight: '80px'
                }}>
                  {course.name}
                </h3>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: colors.primary + '20',
                    color: colors.primary,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getDayOfWeekText(course.day_of_week)}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: course.is_odd_week === null ? colors.border : course.is_odd_week ? colors.success + '20' : colors.warning + '20',
                    color: course.is_odd_week === null ? colors.textSecondary : course.is_odd_week ? colors.success : colors.warning,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getWeekTypeText(course.is_odd_week)}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.textSecondary }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{course.teacher}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.textSecondary }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{course.location}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.textSecondary }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>
                      {new Date(course.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(course.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.textSecondary }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span>提前 {course.reminder_time} 分钟提醒</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '8px', 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <button
                    onClick={() => onEditCourse(course)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: colors.primary + '15',
                      color: colors.primary,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    编辑
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: colors.danger + '15',
                      color: colors.danger,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
