import React, { useState } from 'react';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import BatchEdit from '../components/BatchEdit';
import ClassroomQuery from '../components/ClassroomQuery';

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showClassroomQuery, setShowClassroomQuery] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const handleAddCourse = () => {
    setCurrentCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setCurrentCourse(course);
    setShowForm(true);
  };

  const handleBatchEdit = () => {
    if (selectedCourses.length > 0) {
      setShowBatchEdit(true);
    }
  };

  const handleClassroomQuery = () => {
    setShowClassroomQuery(!showClassroomQuery);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentCourse(null);
  };

  const handleCloseBatchEdit = () => {
    setShowBatchEdit(false);
  };

  const handleSubmit = () => {
    setRefresh(!refresh);
  };

  const handleSelectCourses = (courses) => {
    setSelectedCourses(courses);
  };

  return (
    <div className="home-page">
      <h1>ClassIcs - 课表管理系统</h1>
      <div className="actions">
        <button onClick={handleAddCourse}>添加课程</button>
        <button onClick={handleBatchEdit} disabled={selectedCourses.length === 0}>
          批量编辑 ({selectedCourses.length})
        </button>
        <button onClick={handleClassroomQuery}>
          {showClassroomQuery ? '关闭空教室查询' : '空教室查询'}
        </button>
      </div>
      {showForm && (
        <CourseForm
          course={currentCourse}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}
      {showBatchEdit && (
        <BatchEdit
          selectedCourses={selectedCourses}
          onClose={handleCloseBatchEdit}
          onSubmit={handleSubmit}
        />
      )}
      {showClassroomQuery && (
        <ClassroomQuery />
      )}
      <CourseList key={refresh} onSelectCourses={handleSelectCourses} />
    </div>
  );
};

export default HomePage;
