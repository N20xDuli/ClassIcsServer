import React, { useState } from 'react';
import { courseApi } from '../services/api';

const CourseForm = ({ course, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    teacher: course?.teacher || '',
    location: course?.location || '',
    start_time: course?.start_time || new Date().toISOString().slice(0, 16),
    end_time: course?.end_time || new Date().toISOString().slice(0, 16),
    day_of_week: course?.day_of_week || 1,
    is_odd_week: course?.is_odd_week !== undefined ? course.is_odd_week : null,
    reminder_time: course?.reminder_time || 10,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (course) {
        await courseApi.update(course.id, formData);
      } else {
        await courseApi.create(formData);
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  return (
    <div className="course-form">
      <h2>{course ? '编辑课程' : '添加课程'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>课程名称:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>教师:</label>
          <input
            type="text"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>地点:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>开始时间:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>结束时间:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>星期:</label>
          <select
            name="day_of_week"
            value={formData.day_of_week}
            onChange={handleChange}
            required
          >
            <option value={1}>周一</option>
            <option value={2}>周二</option>
            <option value={3}>周三</option>
            <option value={4}>周四</option>
            <option value={5}>周五</option>
            <option value={6}>周六</option>
            <option value={7}>周日</option>
          </select>
        </div>
        <div>
          <label>单双周:</label>
          <select
            name="is_odd_week"
            value={formData.is_odd_week === null ? '' : formData.is_odd_week}
            onChange={(e) => setFormData({ ...formData, is_odd_week: e.target.value === '' ? null : e.target.value === 'true' })}
          >
            <option value="">每周</option>
            <option value="true">单周</option>
            <option value="false">双周</option>
          </select>
        </div>
        <div>
          <label>提醒时间 (分钟):</label>
          <input
            type="number"
            name="reminder_time"
            value={formData.reminder_time}
            onChange={handleChange}
            min="0"
            required
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

export default CourseForm;
