import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { batchApi } from '../services/api';

const BatchEdit = ({ selectedCourses, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    teacher: '',
    location: '',
    reminder_time: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const courseIds = selectedCourses.map(course => course.id);
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      
      if (Object.keys(updateData).length === 0) {
        alert('请至少填写一个要修改的字段');
        setLoading(false);
        return;
      }

      await batchApi.updateCourses(courseIds, updateData);
      onSubmit();
      onClose();
      alert(`成功更新 ${selectedCourses.length} 个课程！`);
    } catch (error) {
      console.error('Failed to batch update courses:', error);
      alert('批量更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div style={{ backgroundColor: colors.success, padding: '16px 24px' }}>
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>批量编辑课程</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>已选择 {selectedCourses.length} 个课程</p>
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

      {/* Selected courses */}
      <div style={{ padding: '16px 24px', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary, margin: '0 0 8px 0' }}>选中的课程:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedCourses.map(course => (
            <span 
              key={course.id}
              style={{
                padding: '4px 10px',
                backgroundColor: colors.primary + '20',
                color: colors.primary,
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              {course.name}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Teacher */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              教师 <span style={{ color: colors.textSecondary, fontWeight: 'normal' }}>(可选)</span>
            </label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              placeholder="输入教师姓名"
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
              地点 <span style={{ color: colors.textSecondary, fontWeight: 'normal' }}>(可选)</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="输入上课地点"
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

          {/* Reminder time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              提醒时间 <span style={{ color: colors.textSecondary, fontWeight: 'normal' }}>(可选)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                min="0"
                placeholder="输入提醒时间"
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

        {/* Info */}
        <div style={{ 
          marginTop: '20px', 
          padding: '12px 16px', 
          backgroundColor: colors.primary + '10', 
          borderRadius: '6px',
          border: `1px solid ${colors.border}`
        }}>
          <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
            只有填写了值的字段会被更新。留空的字段将保持原值不变。
          </p>
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
              backgroundColor: loading ? colors.textMuted : colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchEdit;
