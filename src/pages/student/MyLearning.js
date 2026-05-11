import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Heart, MessageCircle } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";
import { getEnrolledCourses, getCourseProgress } from "@/api/enrollment";
import { fetchThumbnailUrl } from "@/api/courses";
import { getWellnessAdvice } from "@/api/wellness";

function ProgressBar({ pct }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();
  const [thumb, setThumb] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let active = true;
    fetchThumbnailUrl(course.id).then((u) => { if (active) setThumb(u); }).catch(() => {});
    getCourseProgress(course.id)
      .then((data) => { if (active) setProgress(typeof data === "number" ? data : 0); })
      .catch(() => { if (active) setProgress(0); });
    return () => { active = false; };
  }, [course.id]);

  const pct = progress ?? 0;
  const isCompleted = pct >= 100;

  return (
    <button
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group flex flex-col bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-left overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {thumb
          ? <img src={thumb} alt={course.title} className="w-full h-full object-cover" />
          : <BookOpen className="w-10 h-10 text-muted-foreground/30" />}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors capitalize">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 capitalize">{course.description}</p>
        )}

        {/* Progress */}
        <div className="mt-auto pt-2">
          {progress === null ? (
            <div className="h-1.5 bg-muted rounded-full animate-pulse" />
          ) : (
            <>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">
                  {isCompleted ? "Completed" : "Progress"}
                </span>
                <span className={`text-xs font-medium ${isCompleted ? "text-emerald-600" : "text-primary"}`}>
                  {Math.round(pct)}%
                </span>
              </div>
              <ProgressBar pct={pct} />
            </>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="px-4 pb-4">
        <div className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition-colors
          ${isCompleted
            ? "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
            : "bg-primary/10 text-primary group-hover:bg-primary/20"}`}
        >
          {isCompleted ? "Review Course" : "Continue Learning"}
        </div>
      </div>
    </button>
  );
}

export default function MyLearning() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    getEnrolledCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
    getWellnessAdvice()
      .then((data) => setAdvice(data.advice))
      .catch(() => {});
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Learning</h1>
          <p className="text-sm text-muted-foreground mt-1">Pick up where you left off.</p>
        </div>

        {/* Wellness section */}
        <div className="mb-8 rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground mb-1">Wellness Companion</h2>
              {advice === null ? (
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{advice}</p>
              )}
            </div>
          </div>
          <div className="border-t border-border px-5 py-3 flex justify-end">
            <button
              onClick={() => navigate("/wellness")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Companion
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {courses === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-white overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-1.5 bg-muted rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <GraduationCap className="w-14 h-14 text-muted-foreground/20 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No courses yet</h2>
            <p className="text-sm text-muted-foreground mb-5">Start learning something new today.</p>
            <button
              onClick={() => navigate("/courses")}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
