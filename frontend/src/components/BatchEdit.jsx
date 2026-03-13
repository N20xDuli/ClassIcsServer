import React, { useState } from 'react';
import { batchApi } from '../services/api';

const BatchEdit = ({ selectedCourses, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    teacher: '',
    location: '',
    reminder_time: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courseIds = selectedCourses.map(course => course.id);
      // 过滤掉空值
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      await batchApi.updateCourses(courseIds, updateData);
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to batch update courses:', error);
    }
  };

  return (
    <div className="batch-edit">
      <h2>批量编辑课程</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>教师:</label>
          <input
            type="text"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            placeholder="输入教师姓名"
          />
        </div>
        <div>
          <label>地点:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="输入上课地点"
          />
        </div>
        <div>
          <label>提醒时间 (分钟):</label>
          <input
            type="number"
            name="reminder_time"
            value={formData.reminder_time}
            onChange={handleChange}
            min="0"
            placeholder="输入提醒时间"
          />
        </div>
        <div>
          <button type="submit">保存</button>
          <button type="button" onClick={onClose}>取消</button>
        </div>
      </form>
    </div>
  );
};

export default BatchEdit;
