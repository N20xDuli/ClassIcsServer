import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { courseApi } from '../services/api';

const CourseForm = ({ course, currentMajor, onClose, onSubmit }) => {
  const { colors, glass, animation, isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: course?.name || '',
    teacher: course?.teacher || '',
    location: course?.location || '',
    start_time: course?.start_time ? new Date(course.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    end_time: course?.end_time ? new Date(course.end_time).toISOString().slice(0, 16) : new Date(Date.now() + 90 * 60 * 1000).toISOString().slice(0, 16),
    day_of_week: course?.day_of_week || 1,
    is_odd_week: course?.is_odd_week !== undefined ? course.is_odd_week : null,
    reminder_time: course?.reminder_time || 10,
    major_id: course?.major_id || currentMajor?.id || null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        is_odd_week: formData.is_odd_week === '' ? null : formData.is_odd_week === 'true',
        major_id: formData.major_id || currentMajor?.id
      };

      if (course) {
        await courseApi.update(course.id, submitData);
      } else {
        await courseApi.create(submitData);
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('保存失败，请检查网络连接或后端服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeekText = (day) => {
    const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days[day] || '未知';
  };

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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${glass.border.medium}`,
    borderRadius: '12px',
    fontSize: '15px',
    background: glass.surface.secondary,
    backdropFilter: glass.blur.md,
    color: colors.textPrimary,
    transition: `all ${animation.duration.fast} ease`,
    outline: 'none',
  };

  const glassButtonStyle = (color = colors.primary, isActive = false) => ({
    background: isActive 
      ? `linear-gradient(135deg, ${color}dd, ${color})`
      : glass.surface.tertiary,
    backdropFilter: glass.blur.md,
    border: `1px solid ${isActive ? color + '60' : glass.border.medium}`,
    borderRadius: '12px',
    color: isActive ? 'white' : colors.textPrimary,
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: `all ${animation.duration.normal} ${animation.spring}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: isActive ? `0 4px 20px ${color}40` : 'none',
  });

  return (
    <div style={{
      ...glassCardStyle,
      animation: `slideUp ${animation.duration.slow} ${animation.spring}`,
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
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
        .input-glass:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 4px ${colors.primary}20, inset 0 1px 2px rgba(0,0,0,0.05);
        }
        .btn-press:active {
          transform: scale(0.96) !important;
        }
      `}</style>

      {/* Shimmer overlay */}
      <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15 }} />

      {/* Header */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.primary}dd, ${colors.indigo}dd)`,
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: glass.gradient.top,
          pointerEvents: 'none',
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: glass.blur.md,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {course ? (
                  <>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </>
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </>
                )}
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {course ? '编辑课程' : '添加课程'}
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
                {currentMajor?.name ? `专业: ${currentMajor.name}` : '请选择专业'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: glass.blur.md,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: `all ${animation.duration.fast} ease`,
            }}
            className="btn-press"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Course name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              课程名称 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入课程名称"
              style={inputStyle}
              className="input-glass"
            />
          </div>

          {/* Teacher */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              教师 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              required
              placeholder="请输入教师姓名"
              style={inputStyle}
              className="input-glass"
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              地点 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="请输入上课地点"
              style={inputStyle}
              className="input-glass"
            />
          </div>

          {/* Start time */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              开始时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              style={inputStyle}
              className="input-glass"
            />
          </div>

          {/* End time */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              结束时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              style={inputStyle}
              className="input-glass"
            />
          </div>

          {/* Day of week */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              星期 <span style={{ color: colors.danger }}>*</span>
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: '40px',
              }}
              className="input-glass"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>{getDayOfWeekText(day)}</option>
              ))}
            </select>
          </div>

          {/* Week type */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px' 
            }}>
              单双周
            </label>
            <select
              name="is_odd_week"
              value={formData.is_odd_week === null ? '' : formData.is_odd_week}
              onChange={(e) => setFormData({ ...formData, is_odd_week: e.target.value === '' ? null : e.target.value === 'true' })}
              style={{
                ...inputStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: '40px',
              }}
              className="input-glass"
            >
              <option value="">每周</option>
              <option value="true">单周</option>
              <option value="false">双周</option>
            </select>
          </div>

          {/* Reminder time */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.textPrimary, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              提醒时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                min="0"
                required
                placeholder="请输入提醒时间"
                style={inputStyle}
                className="input-glass"
              />
              <span style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: '500', whiteSpace: 'nowrap' }}>分钟</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px', 
          marginTop: '28px', 
          paddingTop: '24px', 
          borderTop: `1px solid ${glass.border.light}` 
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...glassButtonStyle(),
              padding: '12px 24px',
            }}
            className="btn-press"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...glassButtonStyle(colors.primary, true),
              padding: '12px 28px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            className="btn-press"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
                保存中...
              </span>
            ) : (
              course ? '保存更改' : '创建课程'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
