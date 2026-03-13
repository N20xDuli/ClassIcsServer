import React, { useState, useEffect } from 'react';
import { courseApi } from '../services/api';

const CourseList = ({ onSelectCourses }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAll();
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCheckboxChange = (course) => {
    setSelectedCourses(prev => {
      if (prev.some(c => c.id === course.id)) {
        const newSelected = prev.filter(c => c.id !== course.id);
        onSelectCourses(newSelected);
        return newSelected;
      } else {
        const newSelected = [...prev, course];
        onSelectCourses(newSelected);
        return newSelected;
      }
    });
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="course-list">
      <h2>课程列表</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <input
              type="checkbox"
              checked={selectedCourses.some(c => c.id === course.id)}
              onChange={() => handleCheckboxChange(course)}
            />
            <h3>{course.name}</h3>
            <p>教师: {course.teacher}</p>
            <p>地点: {course.location}</p>
            <p>时间: {new Date(course.start_time).toLocaleString()} - {new Date(course.end_time).toLocaleString()}</p>
            <p>星期: {course.day_of_week}</p>
            <p>单双周: {course.is_odd_week === null ? '每周' : course.is_odd_week ? '单周' : '双周'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
