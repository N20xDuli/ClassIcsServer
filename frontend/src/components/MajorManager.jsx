import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { majorApi } from '../services/api';

const MajorManager = ({ majors, onClose, onUpdate }) => {
  const { colors, glass, animation, isDarkMode } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Submitting form data:', formData);
      if (editingMajor) {
        await majorApi.update(editingMajor.id, formData);
      } else {
        await majorApi.create(formData);
      }
      setFormData({ name: '', code: '', description: '' });
      setShowAddForm(false);
      setEditingMajor(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to save major:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMsg = error.response?.data?.detail || error.message || '未知错误';
      alert('保存失败: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (major) => {
    setEditingMajor(major);
    setFormData({
      name: major.name,
      code: major.code,
      description: major.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (majorId) => {
    if (deleteConfirm === majorId) {
      try {
        await majorApi.delete(majorId);
        setDeleteConfirm(null);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete major:', error);
        alert('删除失败，请重试');
      }
    } else {
      setDeleteConfirm(majorId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
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

  const glassButtonStyle = (color = colors.primary) => ({
    background: `linear-gradient(135deg, ${color}dd, ${color})`,
    backdropFilter: glass.blur.md,
    border: `1px solid ${glass.border.light}`,
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: `all ${animation.duration.normal} ${animation.spring}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 4px 15px ${color}40`,
  });

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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode 
        ? 'radial-gradient(ellipse at center, rgba(20,20,35,0.95) 0%, rgba(10,10,15,0.98) 100%)'
        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.98) 100%)',
      backdropFilter: glass.blur.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: `fadeIn ${animation.duration.normal} ease`,
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .glass-modal {
          animation: slideUp ${animation.duration.slow} ${animation.spring};
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
        }
        .input-focus:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primary}30, inset 0 1px 2px rgba(0,0,0,0.05);
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: ${glass.shadow.lg}, 0 0 40px ${colors.primary}20;
        }
        .btn-press:active {
          transform: scale(0.96);
        }
      `}</style>

      <div className="glass-modal" style={{
        ...glassCardStyle,
        width: '90%',
        maxWidth: '700px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Shimmer overlay */}
        <div className="shimmer-effect" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.3,
        }} />

        {/* Header */}
        <div style={{ 
          background: `linear-gradient(135deg, ${colors.indigo}dd, ${colors.primary}dd)`,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
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
              animation: `float 3s ease-in-out infinite`,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>专业管理</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
                管理专业和班级 · 共 {majors.length} 个专业
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
              position: 'relative',
              zIndex: 1,
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

        {/* Content */}
        <div style={{ 
          padding: '28px', 
          overflow: 'auto',
          flex: 1,
        }}>
          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingMajor(null);
                setFormData({ name: '', code: '', description: '' });
              }}
              style={{
                ...glassButtonStyle(colors.success),
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 24px',
                marginBottom: '24px',
              }}
              className="btn-press"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${colors.success}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 15px ${colors.success}40`;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>添加专业</span>
            </button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} style={{ 
              padding: '28px', 
              background: glass.surface.secondary,
              backdropFilter: glass.blur.lg,
              borderRadius: '20px',
              marginBottom: '24px',
              border: `1px solid ${glass.border.medium}`,
              boxShadow: glass.shadow.md,
              animation: `slideUp ${animation.duration.normal} ${animation.spring}`,
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: colors.textPrimary, 
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: editingMajor ? colors.warning : colors.success,
                  boxShadow: `0 0 10px ${editingMajor ? colors.warning : colors.success}`,
                }} />
                {editingMajor ? '编辑专业' : '添加专业'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    专业名称 <span style={{ color: colors.danger }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="如：计算机科学与技术"
                    style={inputStyle}
                    className="input-focus"
                  />
                </div>
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
                    专业代码 <span style={{ color: colors.danger }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="如：CS2024"
                    style={inputStyle}
                    className="input-focus"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: colors.textPrimary, 
                    marginBottom: '8px' 
                  }}>
                    描述
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="专业描述（可选）"
                    style={inputStyle}
                    className="input-focus"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMajor(null);
                  }}
                  style={{
                    ...glassButtonStyle(colors.textMuted),
                    padding: '12px 24px',
                    background: glass.surface.tertiary,
                    color: colors.textPrimary,
                    boxShadow: 'none',
                  }}
                  className="btn-press"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...glassButtonStyle(editingMajor ? colors.warning : colors.success),
                    padding: '12px 28px',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                  }}
                  className="btn-press"
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                      </svg>
                      保存中...
                    </span>
                  ) : (
                    editingMajor ? '保存更改' : '添加'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Major List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {majors.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                color: colors.textSecondary,
                background: glass.surface.secondary,
                backdropFilter: glass.blur.md,
                borderRadius: '20px',
                border: `1px dashed ${glass.border.medium}`,
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  background: glass.surface.tertiary,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
                    <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                  </svg>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>暂无专业</p>
                <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>点击上方按钮添加第一个专业</p>
              </div>
            ) : (
              majors.map((major, index) => (
                <div
                  key={major.id}
                  onMouseEnter={() => setHoveredCard(major.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...glassCardStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    transition: `all ${animation.duration.normal} ${animation.spring}`,
                    transform: hoveredCard === major.id ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredCard === major.id 
                      ? `${glass.shadow.lg}, 0 0 40px ${colors.primary}20`
                      : glass.shadow.md,
                    animation: `slideUp ${animation.duration.normal} ${animation.spring} ${index * 50}ms both`,
                  }}
                >
                  {/* Glow effect on hover */}
                  {hoveredCard === major.id && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: glass.gradient.glow,
                      pointerEvents: 'none',
                      borderRadius: '20px',
                    }} />
                  )}
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h4 style={{ 
                      fontSize: '17px', 
                      fontWeight: '700', 
                      color: colors.textPrimary, 
                      margin: '0 0 6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      {major.name}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 10px',
                        background: colors.primary + '20',
                        color: colors.primary,
                        borderRadius: '20px',
                        border: `1px solid ${colors.primary}40`,
                      }}>
                        {major.code}
                      </span>
                    </h4>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                      {major.description || '暂无描述'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
                    <button
                      onClick={() => handleEdit(major)}
                      style={{
                        padding: '10px 18px',
                        background: colors.primary + '15',
                        backdropFilter: glass.blur.md,
                        color: colors.primary,
                        border: `1px solid ${colors.primary}30`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: `all ${animation.duration.fast} ease`,
                      }}
                      className="btn-press"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary + '25';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.primary + '15';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(major.id)}
                      style={{
                        padding: '10px 18px',
                        background: deleteConfirm === major.id ? colors.danger : colors.danger + '15',
                        backdropFilter: glass.blur.md,
                        color: deleteConfirm === major.id ? 'white' : colors.danger,
                        border: `1px solid ${deleteConfirm === major.id ? colors.danger : colors.danger + '30'}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: `all ${animation.duration.fast} ease`,
                        boxShadow: deleteConfirm === major.id ? `0 4px 15px ${colors.danger}50` : 'none',
                      }}
                      className="btn-press"
                    >
                      {deleteConfirm === major.id ? '确认删除?' : '删除'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MajorManager;
