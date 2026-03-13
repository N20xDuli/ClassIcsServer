import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const WeekView = ({ courses }) => {
  const { colors, isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Get current week number (odd or even)
  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    setCurrentWeek(weekNumber % 2 === 1 ? 1 : 2); // 1 for odd week, 2 for even week
  }, []);

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

  const getDayOfWeek = (date) => {
    const day = date.getDay();
    return day === 0 ? 7 : day; // Convert Sunday (0) to 7
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    if (hour < 8 || hour > 21) return null;
    return (hour - 8) * 60 + minute;
  };

  const isCourseVisible = (course) => {
    // Check if course should be shown based on odd/even week
    if (course.is_odd_week === null) return true;
    if (course.is_odd_week === true && currentWeek === 1) return true;
    if (course.is_odd_week === false && currentWeek === 2) return true;
    return false;
  };

  const getCoursePosition = (course) => {
    const startDate = new Date(course.start_time);
    const endDate = new Date(course.end_time);
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinute = endDate.getMinutes();
    
    const startPos = (startHour - 8) * 60 + startMinute;
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    
    return { top: startPos, height: duration };
  };

  const getCourseColor = (index) => {
    const colorPalette = [
      { bg: isDarkMode ? '#1e3a5f' : '#dbeafe', border: isDarkMode ? '#3b82f6' : '#3b82f6', text: isDarkMode ? '#93c5fd' : '#1e40af' },
      { bg: isDarkMode ? '#14532d' : '#d1fae5', border: isDarkMode ? '#10b981' : '#10b981', text: isDarkMode ? '#6ee7b7' : '#047857' },
      { bg: isDarkMode ? '#7c2d12' : '#fed7aa', border: isDarkMode ? '#f97316' : '#f97316', text: isDarkMode ? '#fdba74' : '#c2410c' },
      { bg: isDarkMode ? '#581c87' : '#f3e8ff', border: isDarkMode ? '#a855f7' : '#a855f7', text: isDarkMode ? '#d8b4fe' : '#7c3aed' },
      { bg: isDarkMode ? '#831843' : '#fce7f3', border: isDarkMode ? '#ec4899' : '#ec4899', text: isDarkMode ? '#f9a8d4' : '#be185d' },
      { bg: isDarkMode ? '#312e81' : '#e0e7ff', border: isDarkMode ? '#6366f1' : '#6366f1', text: isDarkMode ? '#a5b4fc' : '#4338ca' },
      { bg: isDarkMode ? '#713f12' : '#fef3c7', border: isDarkMode ? '#eab308' : '#eab308', text: isDarkMode ? '#fde047' : '#a16207' },
      { bg: isDarkMode ? '#374151' : '#f3f4f6', border: isDarkMode ? '#9ca3af' : '#9ca3af', text: isDarkMode ? '#d1d5db' : '#374151' },
    ];
    return colorPalette[index % colorPalette.length];
  };

  const timePosition = getCurrentTimePosition();
  const currentDay = getDayOfWeek(currentTime);

  return (
    <div style={{ 
      backgroundColor: colors.surface, 
      borderRadius: '8px', 
      border: `1px solid ${colors.border}`,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: colors.textPrimary, 
            margin: '0 0 4px 0' 
          }}>
            一周视图
          </h2>
          <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
            第 {currentWeek === 1 ? '一' : '二'} 周 · {currentTime.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.primary, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>单周</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.success, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>双周</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.textMuted, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>每周</span>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div style={{ display: 'flex', overflow: 'auto' }}>
        {/* Time column */}
        <div style={{ 
          width: '60px', 
          flexShrink: 0, 
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.surface
        }}>
          <div style={{ height: '40px', borderBottom: `1px solid ${colors.border}` }}></div>
          {hours.map(hour => (
            <div 
              key={hour} 
              style={{ 
                height: '60px', 
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '4px',
                fontSize: '12px',
                color: colors.textMuted
              }}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const isToday = dayNumber === currentDay;
          const dayCourses = courses.filter(c => c.day_of_week === dayNumber && isCourseVisible(c));

          return (
            <div 
              key={day} 
              style={{ 
                flex: 1, 
                minWidth: '140px',
                borderRight: dayIndex < 6 ? `1px solid ${colors.border}` : 'none',
                backgroundColor: isToday ? (isDarkMode ? '#1e293b' : '#f0f9ff') : colors.surface
              }}
            >
              {/* Day header */}
              <div style={{ 
                height: '40px', 
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isToday ? colors.primary : colors.surface
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: isToday ? 'white' : colors.textPrimary 
                }}>
                  {day}
                </span>
                {isToday && (
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>今天</span>
                )}
              </div>

              {/* Time slots */}
              <div style={{ position: 'relative' }}>
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    style={{ 
                      height: '60px', 
                      borderBottom: `1px solid ${colors.border}` 
                    }}
                  ></div>
                ))}

                {/* Current time indicator */}
                {isToday && timePosition !== null && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: timePosition,
                    height: '2px',
                    backgroundColor: '#ef4444',
                    zIndex: 10
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '-4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444'
                    }}></div>
                  </div>
                )}

                {/* Courses */}
                {dayCourses.map((course, index) => {
                  const position = getCoursePosition(course);
                  const courseColor = getCourseColor(index);
                  
                  return (
                    <div
                      key={course.id}
                      style={{
                        position: 'absolute',
                        left: '4px',
                        right: '4px',
                        top: position.top,
                        height: position.height,
                        backgroundColor: courseColor.bg,
                        border: `1px solid ${courseColor.border}`,
                        borderRadius: '4px',
                        padding: '4px 6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        zIndex: 5
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: courseColor.text,
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {course.name}
                      </div>
                      {position.height > 30 && (
                        <div style={{
                          fontSize: '10px',
                          color: courseColor.text,
                          opacity: 0.8,
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {course.location}
                        </div>
                      )}
                      {position.height > 45 && (
                        <div style={{
                          fontSize: '10px',
                          color: courseColor.text,
                          opacity: 0.7,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {course.teacher}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
