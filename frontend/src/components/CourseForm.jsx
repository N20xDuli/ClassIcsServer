import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { courseApi } from '../services/api';

const CourseForm = ({ course, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: course?.name || '',
    teacher: course?.teacher || '',
    location: course?.location || '',
    start_time: course?.start_time ? new Date(course.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    end_time: course?.end_time ? new Date(course.end_time).toISOString().slice(0, 16) : new Date(Date.now() + 90 * 60 * 1000).toISOString().slice(0, 16),
    day_of_week: course?.day_of_week || 1,
    is_odd_week: course?.is_odd_week !== undefined ? course.is_odd_week : null,
    reminder_time: course?.reminder_time || 10,
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
        is_odd_week: formData.is_odd_week === '' ? null : formData.is_odd_week === 'true'
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

  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div style={{ backgroundColor: colors.primary, padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {course ? '编辑课程' : '添加课程'}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                {course ? '修改课程信息' : '创建新课程'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Course name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              课程名称 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入课程名称"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            />
          </div>

          {/* Teacher */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              教师 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              required
              placeholder="请输入教师姓名"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              地点 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="请输入上课地点"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            />
          </div>

          {/* Start time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              开始时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            />
          </div>

          {/* End time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              结束时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            />
          </div>

          {/* Day of week */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              星期 <span style={{ color: colors.danger }}>*</span>
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>{getDayOfWeekText(day)}</option>
              ))}
            </select>
          </div>

          {/* Week type */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              单双周
            </label>
            <select
              name="is_odd_week"
              value={formData.is_odd_week === null ? '' : formData.is_odd_week}
              onChange={(e) => setFormData({ ...formData, is_odd_week: e.target.value === '' ? null : e.target.value === 'true' })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.surface,
                color: colors.textPrimary
              }}
            >
              <option value="">每周</option>
              <option value="true">单周</option>
              <option value="false">双周</option>
            </select>
          </div>

          {/* Reminder time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              提醒时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                min="0"
                required
                placeholder="请输入提醒时间"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: colors.surface,
                  color: colors.textPrimary
                }}
              />
              <span style={{ fontSize: '14px', color: colors.textSecondary, whiteSpace: 'nowrap' }}>分钟</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${colors.border}` }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.border,
              color: colors.textPrimary,
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? colors.textMuted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '保存中...' : (course ? '保存更改' : '创建课程')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
