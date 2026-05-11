import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, BookOpen } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";
import { listCourses, listSkills, searchCourses, fetchThumbnailUrl } from "@/api/courses";

function StarRating({ value }) {
  const full = Math.round(value ?? 0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= full ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    let active = true;
    fetchThumbnailUrl(course.id)
      .then((url) => { if (active) setThumb(url); })
      .catch(() => {});
    return () => { active = false; };
  }, [course.id]);

  const skills = course.skills ?? [];

  return (
    <button
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group flex flex-col bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-left overflow-hidden"
    >
      <div className="w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {skills.slice(0, 3).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {s}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}

        {course.avg_rating != null && (
          <div className="flex items-center gap-1.5 pt-1">
            <StarRating value={course.avg_rating} />
            <span className="text-xs text-muted-foreground">{Number(course.avg_rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function SkeletonGrid({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-white overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-4 flex flex-col gap-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");
  const debounceRef = useRef(null);

  useEffect(() => {
    listSkills().then(setSkills).catch(() => {});
  }, []);

  function load(params) {
    setLoading(true);
    setError("");
    listCourses(params)
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load({ limit: 5 });
  }, []);

  function handleSkillClick(skillValue) {
    setActiveSkill(skillValue);
    setQuery("");
    clearTimeout(debounceRef.current);
    if (skillValue === "All") {
      load({ limit: 5 });
    } else {
      load({ skill: skillValue, limit: 100 });
    }
  }

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    setActiveSkill("All");
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      load({ limit: 5 });
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError("");
      searchCourses(val.trim())
        .then(setCourses)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 350);
  }

  const subtitle = activeSkill !== "All"
    ? `Showing all "${activeSkill}" courses`
    : query
    ? `Results for "${query}"`
    : "Showing 5 featured courses";

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Browse Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...skills].map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillClick(skill)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                activeSkill === skill
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No courses found.</p>
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
