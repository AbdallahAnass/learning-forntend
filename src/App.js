import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import InstructorDashboard from "@/pages/instructor/Dashboard";
import InstructorMyCourses from "@/pages/instructor/MyCourses";
import InstructorCreateCourse from "@/pages/instructor/CreateCourse";
import InstructorManageCourse from "@/pages/instructor/ManageCourse";
import InstructorQuizBuilder from "@/pages/instructor/QuizBuilder";
import StudentCourseCatalog from "@/pages/student/CourseCatalog";
import StudentCourseDetail from "@/pages/student/CourseDetail";
import StudentMyLearning from "@/pages/student/MyLearning";
import StudentLessonViewer from "@/pages/student/LessonViewer";
import StudentWellnessChat from "@/pages/student/WellnessChat";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminCourses from "@/pages/admin/Courses";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute role="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute role="instructor">
              <InstructorMyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/new"
          element={
            <ProtectedRoute role="instructor">
              <InstructorCreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId"
          element={
            <ProtectedRoute role="instructor">
              <InstructorManageCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/lessons/:lessonId/quiz"
          element={
            <ProtectedRoute role="instructor">
              <InstructorQuizBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute role="student">
              <StudentCourseCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute role="student">
              <StudentCourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute role="student">
              <StudentMyLearning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/learn"
          element={
            <ProtectedRoute role="student">
              <StudentLessonViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness"
          element={
            <ProtectedRoute role="student">
              <StudentWellnessChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="administrator">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute role="administrator">
              <AdminCourses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
