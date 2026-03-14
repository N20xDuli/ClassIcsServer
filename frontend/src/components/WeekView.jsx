import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// 24节气计算
const SOLAR_TERMS_ANGLES = [
  { name: '小寒', angle: 285 }, { name: '大寒', angle: 300 },
  { name: '立春', angle: 315 }, { name: '雨水', angle: 330 },
  { name: '惊蛰', angle: 345 }, { name: '春分', angle: 0 },
  { name: '清明', angle: 15 }, { name: '谷雨', angle: 30 },
  { name: '立夏', angle: 45 }, { name: '小满', angle: 60 },
  { name: '芒种', angle: 75 }, { name: '夏至', angle: 90 },
  { name: '小暑', angle: 105 }, { name: '大暑', angle: 120 },
  { name: '立秋', angle: 135 }, { name: '处暑', angle: 150 },
  { name: '白露', angle: 165 }, { name: '秋分', angle: 180 },
  { name: '寒露', angle: 195 }, { name: '霜降', angle: 210 },
  { name: '立冬', angle: 225 }, { name: '小雪', angle: 240 },
  { name: '大雪', angle: 255 }, { name: '冬至', angle: 270 },
];

const getSolarTermDate = (year, termIndex) => {
  const baseDates = {
    0: [6, 20], 2: [4, 19], 4: [5, 20], 6: [4, 20], 8: [5, 21],
    10: [5, 21], 12: [7, 22], 14: [7, 23], 16: [7, 23], 18: [8, 23],
    20: [7, 22], 22: [7, 21],
  };
  const base = baseDates[termIndex];
  if (!base) return null;
  const day = termIndex % 2 === 0 ? base[0] : base[1];
  const month = Math.floor(termIndex / 2) + 1;
  return new Date(year, month - 1, day);
};

const calculateSpringFestival = (year) => {
  const baseYear = 2000;
  const baseDate = new Date(2000, 1, 5);
  const yearDiff = year - baseYear;
  const daysOffset = yearDiff * 11;
  const date = new Date(baseDate);
  date.setDate(date.getDate() - daysOffset);
  while (date.getMonth() === 0 && date.getDate() < 21) date.setDate(date.getDate() + 29);
  while (date.getMonth() === 1 && date.getDate() > 20) date.setDate(date.getDate() - 29);
  return date;
};

const calculateHolidays = (year) => {
  const holidays = {};
  holidays[`${year}-01-01`] = '元旦';
  
  const springFestival = calculateSpringFestival(year);
  for (let i = 0; i < 8; i++) {
    const date = new Date(springFestival);
    date.setDate(date.getDate() + i);
    holidays[date.toISOString().split('T')[0]] = '春节';
  }
  
  const qingming = new Date(year, 3, 4);
  for (let i = 0; i < 3; i++) {
    const date = new Date(qingming);
    date.setDate(date.getDate() + i);
    holidays[date.toISOString().split('T')[0]] = '清明';
  }
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(year, 4, 1 + i);
    holidays[date.toISOString().split('T')[0]] = '劳动节';
  }
  
  const dragonBoat = new Date(calculateSpringFestival(year));
  dragonBoat.setMonth(dragonBoat.getMonth() + 4);
  dragonBoat.setDate(10);
  for (let i = 0; i < 3; i++) {
    const date = new Date(dragonBoat);
    date.setDate(date.getDate() + i);
    holidays[date.toISOString().split('T')[0]] = '端午';
  }
  
  const midAutumn = new Date(year, 8, 15);
  for (let i = 0; i < 3; i++) {
    const date = new Date(midAutumn);
    date.setDate(date.getDate() + i);
    holidays[date.toISOString().split('T')[0]] = '中秋';
  }
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(year, 9, 1 + i);
    holidays[date.toISOString().split('T')[0]] = '国庆';
  }
  
  return holidays;
};

const getSolarTermsForYear = (year) => {
  const terms = {};
  SOLAR_TERMS_ANGLES.forEach((term, index) => {
    const date = getSolarTermDate(year, index);
    if (date) terms[date.toISOString().split('T')[0]] = term.name;
  });
  return terms;
};

const getHolidayInfo = (date) => {
  const year = date.getFullYear();
  const holidays = calculateHolidays(year);
  const solarTerms = getSolarTermsForYear(year);
  const dateStr = date.toISOString().split('T')[0];
  return { holiday: holidays[dateStr], solarTerm: solarTerms[dateStr] };
};

// 合并单双周课程（用于总览视图）
const mergeOddEvenCourses = (courses) => {
  const merged = [];
  const courseMap = new Map();
  
  courses.forEach(course => {
    const key = `${course.name}-${course.start_time}-${course.end_time}-${course.day_of_week}`;
    if (courseMap.has(key)) {
      const existing = courseMap.get(key);
      if (existing.is_odd_week !== course.is_odd_week) {
        existing.is_both_weeks = true;
      }
    } else {
      courseMap.set(key, { ...course, is_both_weeks: false });
    }
  });
  
  return Array.from(courseMap.values());
};

const WeekView = ({ courses, onEditCourse }) => {
  const { colors, glass, animation, isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewMode, setViewMode] = useState('single'); // 'single', 'dual', 'overview'
  const [weekOffset, setWeekOffset] = useState(0);
  const [showTimeLabels, setShowTimeLabels] = useState(true);
  const [showGaps, setShowGaps] = useState(true);
  const [hoveredCourse, setHoveredCourse] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    setCurrentWeek(((weekNumber + weekOffset) % 2 === 1) ? 1 : 2);
  }, [weekOffset]);

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const timeRange = useMemo(() => {
    const allCourses = viewMode === 'dual' 
      ? courses 
      : viewMode === 'overview' 
        ? mergeOddEvenCourses(courses)
        : courses.filter(c => c.is_odd_week === null || 
            (c.is_odd_week === true && currentWeek === 1) || 
            (c.is_odd_week === false && currentWeek === 2));
    
    if (!allCourses || allCourses.length === 0) {
      return { startHour: 8, endHour: 21, hours: Array.from({ length: 14 }, (_, i) => i + 8) };
    }

    let minHour = 24, maxHour = 0;
    allCourses.forEach(course => {
      const startHour = new Date(course.start_time).getHours();
      const endHour = new Date(course.end_time).getHours();
      const endMinute = new Date(course.end_time).getMinutes();
      if (startHour < minHour) minHour = startHour;
      const effectiveEndHour = endMinute > 0 ? endHour + 1 : endHour;
      if (effectiveEndHour > maxHour) maxHour = effectiveEndHour;
    });

    minHour = Math.max(0, minHour - 1);
    maxHour = Math.min(24, maxHour + 1);
    if (maxHour - minHour < 8) maxHour = Math.min(24, minHour + 8);

    return { startHour: minHour, endHour: maxHour, hours: Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i) };
  }, [courses, currentWeek, viewMode]);

  const getWeekDates = (offset = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);
    const currentDayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek + 1);
    return days.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const getCoursePosition = (course) => {
    const startDate = new Date(course.start_time);
    const endDate = new Date(course.end_time);
    const startPos = (startDate.getHours() - timeRange.startHour) * 60 + startDate.getMinutes();
    const duration = (endDate.getHours() - startDate.getHours()) * 60 + (endDate.getMinutes() - startDate.getMinutes());
    return { top: startPos, height: Math.max(duration, 25) };
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getCourseColor = (index, isOddWeek, isBothWeeks = false) => {
    if (isBothWeeks) {
      return { 
        bg: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)', 
        border: '#8b5cf6', 
        text: isDarkMode ? '#c4b5fd' : '#6d28d9', 
        gradient: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(124,58,237,0.3))' 
      };
    }
    const colorPalette = [
      { bg: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: isDarkMode ? '#93c5fd' : '#1d4ed8', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(37,99,235,0.3))' },
      { bg: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: isDarkMode ? '#6ee7b7' : '#047857', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(5,150,105,0.3))' },
      { bg: isDarkMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.15)', border: '#f97316', text: isDarkMode ? '#fdba74' : '#c2410c', gradient: 'linear-gradient(135deg, rgba(249,115,22,0.4), rgba(234,88,12,0.3))' },
      { bg: isDarkMode ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: isDarkMode ? '#d8b4fe' : '#7c3aed', gradient: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(147,51,234,0.3))' },
      { bg: isDarkMode ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: isDarkMode ? '#f9a8d4' : '#be185d', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.4), rgba(219,39,119,0.3))' },
      { bg: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: isDarkMode ? '#a5b4fc' : '#4338ca', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(79,70,229,0.3))' },
      { bg: isDarkMode ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.15)', border: '#eab308', text: isDarkMode ? '#fde047' : '#a16207', gradient: 'linear-gradient(135deg, rgba(234,179,8,0.4), rgba(202,138,4,0.3))' },
      { bg: isDarkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: isDarkMode ? '#d1d5db' : '#374151', gradient: 'linear-gradient(135deg, rgba(107,114,128,0.4), rgba(75,85,99,0.3))' },
    ];
    return colorPalette[index % colorPalette.length];
  };

  const calculateCourseLayout = (dayCourses) => {
    if (dayCourses.length === 0) return [];
    const sorted = [...dayCourses].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const layout = [];
    const columns = [];
    
    sorted.forEach((course) => {
      const courseStart = new Date(course.start_time).getTime();
      const courseEnd = new Date(course.end_time).getTime();
      let columnIndex = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= courseStart) { columnIndex = i; break; }
      }
      if (columnIndex === -1) { columnIndex = columns.length; columns.push(courseEnd); } 
      else { columns[columnIndex] = courseEnd; }
      layout.push({ course, columnIndex, totalColumns: columns.length });
    });
    layout.forEach(item => item.totalColumns = columns.length);
    return layout;
  };

  const renderDayColumn = (dayIndex, dayCourses, weekDates, isDual = false, weekLabel = '') => {
    const dayNumber = dayIndex + 1;
    const isToday = dayNumber === (currentTime.getDay() || 7);
    const courseLayout = calculateCourseLayout(dayCourses);
    const date = weekDates[dayIndex];
    const { holiday, solarTerm } = getHolidayInfo(date);
    const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });

    return (
      <div key={`${weekLabel}-${dayIndex}`} style={{
        flex: 1,
        minWidth: isDual ? '120px' : '160px',
        borderRight: `1px solid ${glass.border.light}`,
        background: isToday ? (isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)') : 'transparent',
      }}>
        <div style={{
          height: '60px',
          borderBottom: `1px solid ${glass.border.medium}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isToday ? `linear-gradient(135deg, ${colors.primary}dd, ${colors.indigo}dd)` : glass.surface.secondary,
          position: 'relative',
        }}>
          {weekLabel && (
            <span style={{ fontSize: '10px', color: isToday ? 'rgba(255,255,255,0.7)' : colors.textMuted, fontWeight: '600' }}>
              {weekLabel}
            </span>
          )}
          <span style={{ fontSize: '14px', fontWeight: '700', color: isToday ? 'white' : colors.textPrimary }}>
            {days[dayIndex]}
          </span>
          <span style={{ fontSize: '10px', color: isToday ? 'rgba(255,255,255,0.8)' : colors.textSecondary, marginTop: '2px' }}>
            {dateStr}
          </span>
          {(holiday || solarTerm) && (
            <div style={{ position: 'absolute', top: '2px', right: '2px' }}>
              {holiday ? (
                <span style={{ fontSize: '8px', fontWeight: '700', padding: '1px 4px', background: colors.danger, color: 'white', borderRadius: '3px' }}>
                  {holiday}
                </span>
              ) : (
                <span style={{ fontSize: '8px', fontWeight: '700', padding: '1px 4px', background: colors.warning, color: 'white', borderRadius: '3px' }}>
                  {solarTerm}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          {timeRange.hours.map(hour => (
            <div key={hour} style={{ height: '60px', borderBottom: `1px solid ${glass.border.light}` }} />
          ))}
          
          {courseLayout.map(({ course, columnIndex, totalColumns }, index) => {
            const position = getCoursePosition(course);
            const courseColor = getCourseColor(index, course.is_odd_week, course.is_both_weeks);
            const columnWidth = totalColumns > 1 ? (100 - 8) / totalColumns : 100;
            const leftOffset = totalColumns > 1 ? 4 + (columnIndex * columnWidth) : 4;
            const width = totalColumns > 1 ? columnWidth - 2 : 'calc(100% - 8px)';

            return (
              <div
                key={course.id}
                className="course-card"
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => onEditCourse && onEditCourse(course)}
                style={{
                  position: 'absolute',
                  left: `${leftOffset}%`,
                  width: typeof width === 'number' ? `${width}%` : width,
                  top: position.top,
                  height: position.height,
                  background: courseColor.gradient,
                  border: `1px solid ${courseColor.border}`,
                  borderRadius: '6px',
                  padding: '2px 4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  zIndex: hoveredCourse === course.id ? 20 : 10,
                  fontSize: totalColumns > 2 || isDual ? '9px' : '10px',
                }}
              >
                <div style={{ fontSize: totalColumns > 2 || isDual ? '9px' : '10px', fontWeight: '700', color: courseColor.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.name}
                </div>
                {showTimeLabels && position.height > 20 && !isDual && (
                  <div style={{ fontSize: '8px', color: courseColor.text, opacity: 0.9, fontFamily: 'monospace' }}>
                    {formatTime(course.start_time)}-{formatTime(course.end_time)}
                  </div>
                )}
                {course.is_both_weeks && (
                  <div style={{ position: 'absolute', top: '1px', right: '1px', width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 3px #8b5cf6' }} />
                )}
                {course.is_odd_week !== null && !course.is_both_weeks && (
                  <div style={{ position: 'absolute', top: '1px', right: '1px', width: '5px', height: '5px', borderRadius: '50%', background: course.is_odd_week ? colors.primary : colors.success, boxShadow: `0 0 3px ${course.is_odd_week ? colors.primary : colors.success}` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeColumn = () => (
    <div style={{ width: '60px', flexShrink: 0, borderRight: `1px solid ${glass.border.medium}`, background: glass.surface.secondary }}>
      <div style={{ height: '60px', borderBottom: `1px solid ${glass.border.medium}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: colors.textSecondary }}>
        时间
      </div>
      {timeRange.hours.map(hour => (
        <div key={hour} style={{ height: '60px', borderBottom: `1px solid ${glass.border.light}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px', fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>
          {hour}:00
        </div>
      ))}
    </div>
  );

  const glassCardStyle = {
    background: glass.surface.primary,
    backdropFilter: glass.blur.lg,
    WebkitBackdropFilter: glass.blur.lg,
    border: `1px solid ${glass.border.medium}`,
    borderRadius: '20px',
    boxShadow: `${glass.shadow.md}, ${glass.shadow.inner}`,
    overflow: 'hidden',
  };

  const weekDates = getWeekDates(weekOffset);
  const nextWeekDates = getWeekDates(weekOffset + 1);

  // Filter courses for current view
  const getFilteredCourses = (weekNum) => {
    if (viewMode === 'overview') return mergeOddEvenCourses(courses);
    return courses.filter(c => c.is_odd_week === null || c.is_odd_week === (weekNum === 1));
  };

  return (
    <div style={{ ...glassCardStyle }}>
      <style>{`
        .course-card { transition: all ${animation.duration.normal} ${animation.spring}; }
        .course-card:hover { transform: scale(1.02); z-index: 20 !important; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${glass.border.medium}`, background: `linear-gradient(135deg, ${colors.primary}dd, ${colors.indigo}dd)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: glass.gradient.top, pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', backdropFilter: glass.blur.md, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>
                {viewMode === 'dual' ? '双周视图' : viewMode === 'overview' ? '总览视图' : `第 ${currentWeek === 1 ? '一' : '二'} 周视图`}
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', margin: '2px 0 0 0' }}>
                {timeRange.startHour}:00 - {timeRange.endHour}:00 · {weekOffset === 0 ? '本周' : weekOffset > 0 ? `+${weekOffset}周` : `${weekOffset}周`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View mode buttons */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', backdropFilter: glass.blur.md, borderRadius: '10px', padding: '3px' }}>
              <button onClick={() => setViewMode('single')} style={{ padding: '6px 12px', background: viewMode === 'single' ? 'rgba(255,255,255,0.25)' : 'transparent', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>单周</button>
              <button onClick={() => setViewMode('dual')} style={{ padding: '6px 12px', background: viewMode === 'dual' ? 'rgba(255,255,255,0.25)' : 'transparent', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>双周</button>
              <button onClick={() => setViewMode('overview')} style={{ padding: '6px 12px', background: viewMode === 'overview' ? 'rgba(255,255,255,0.25)' : 'transparent', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>总览</button>
            </div>

            {/* Week navigation */}
            {viewMode !== 'dual' && viewMode !== 'overview' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => setWeekOffset(weekOffset - 1)} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)', backdropFilter: glass.blur.md, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 12px', background: weekOffset === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', backdropFilter: glass.blur.md, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  本周
                </button>
                <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)', backdropFilter: glass.blur.md, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}

            <button onClick={() => setShowTimeLabels(!showTimeLabels)} style={{ padding: '6px 12px', background: showTimeLabels ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', backdropFilter: glass.blur.md, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {showTimeLabels ? '✓' : ''} 时间
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', overflow: 'auto', maxHeight: '750px' }}>
        {renderTimeColumn()}
        
        {viewMode === 'dual' ? (
          // Dual week view - side by side
          <>
            <div style={{ flex: 1, minWidth: '400px', borderRight: `2px solid ${glass.border.strong}` }}>
              <div style={{ height: '30px', background: colors.primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: colors.primary, borderBottom: `1px solid ${glass.border.medium}` }}>
                单周
              </div>
              <div style={{ display: 'flex' }}>
                {days.map((_, dayIndex) => renderDayColumn(dayIndex, getFilteredCourses(1).filter(c => c.day_of_week === dayIndex + 1), weekDates, true, ''))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '400px' }}>
              <div style={{ height: '30px', background: colors.success + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: colors.success, borderBottom: `1px solid ${glass.border.medium}` }}>
                双周
              </div>
              <div style={{ display: 'flex' }}>
                {days.map((_, dayIndex) => renderDayColumn(dayIndex, getFilteredCourses(2).filter(c => c.day_of_week === dayIndex + 1), weekDates, true, ''))}
              </div>
            </div>
          </>
        ) : (
          // Single week or overview
          days.map((_, dayIndex) => renderDayColumn(dayIndex, getFilteredCourses(currentWeek).filter(c => c.day_of_week === dayIndex + 1), weekDates))
        )}
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${glass.border.medium}`, background: glass.surface.secondary, display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.primary }}></div>
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>单周课程</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.success }}></div>
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>双周课程</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#8b5cf6' }}></div>
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>单双周都有</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.textMuted }}></div>
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>每周都有</span>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
