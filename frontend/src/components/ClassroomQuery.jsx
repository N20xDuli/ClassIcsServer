import React, { useState } from 'react';
import axios from 'axios';

const ClassroomQuery = () => {
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '08:00',
    end_time: '10:00',
  });
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
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
      const response = await axios.get('/api/classroom/available', {
        params: formData,
      });
      setAvailableClassrooms(response.data.available_classrooms);
    } catch (error) {
      console.error('Failed to query available classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="classroom-query">
      <h2>空教室查询</h2>
      <form onSubmit={handleSubmit}>
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
          <label>开始时间:</label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>结束时间:</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </form>
      {availableClassrooms.length > 0 && (
        <div className="available-classrooms">
          <h3>可用教室:</h3>
          <ul>
            {availableClassrooms.map((classroom, index) => (
              <li key={index}>{classroom}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClassroomQuery;
