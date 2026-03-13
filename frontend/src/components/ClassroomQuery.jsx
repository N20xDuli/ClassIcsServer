import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { classroomApi } from '../services/api';

const ClassroomQuery = () => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '10:00',
  });
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
    setHasSearched(true);

    try {
      const params = {
        day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      const response = await classroomApi.queryAvailable(params);
      setAvailableClassrooms(response.data.classrooms || []);
    } catch (error) {
      console.error('Failed to query classrooms:', error);
      alert('查询失败，请重试');
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
      <div style={{ backgroundColor: colors.purple, padding: '16px 24px' }}>
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>空教室查询</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>查找指定时间段内的可用教室</p>
          </div>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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

          {/* Start time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
              开始时间 <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="time"
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
              type="time"
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
        </div>

        {/* Search button */}
        <div style={{ marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              backgroundColor: loading ? colors.textMuted : colors.purple,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20"></circle>
                </svg>
                查询中...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                查询空教室
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {hasSearched && (
        <div style={{ borderTop: `1px solid ${colors.border}` }}>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 16px 0' }}>
              查询结果
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: colors.textSecondary, marginLeft: '8px' }}>
                ({getDayOfWeekText(parseInt(formData.day_of_week))} {formData.start_time} - {formData.end_time})
              </span>
            </h3>

            {availableClassrooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: colors.border, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p style={{ color: colors.textSecondary, margin: 0 }}>该时间段暂无可用教室</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                {availableClassrooms.map((classroom, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: colors.success + '20',
                      color: colors.success,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {classroom}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomQuery;
