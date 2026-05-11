import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { getStats } from "@/api/admin";

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {value === null ? (
          <div className="h-6 w-16 bg-muted rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

function QuizCard({ label, value, suffix = "" }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      {value === null ? (
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-foreground">
          {value}{suffix}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const s = stats;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview</p>
        </div>

        {error && <p className="text-sm text-destructive mb-6">{error}</p>}

        {/* Main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Users}          label="Total Students"             value={s?.total_students ?? null} />
          <StatCard icon={GraduationCap}  label="Total Instructors"          value={s?.total_instructors ?? null} />
          <StatCard icon={BookOpen}       label="Total Courses"              value={s?.total_courses ?? null} />
          <StatCard icon={TrendingUp}     label="Active Enrollments"         value={s?.total_active_enrollments ?? null} color="text-emerald-600" />
          <StatCard icon={TrendingUp}     label="Completed Enrollments"      value={s?.total_completed_enrollments ?? null} color="text-amber-500" />
        </div>

        {/* Quiz metrics */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quiz Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuizCard
            label="Overall Pass Rate"
            value={s ? Math.round(s.overall_quiz_pass_rate * 100) : null}
            suffix="%"
          />
          <QuizCard
            label="Average Quiz Score"
            value={s ? s.overall_quiz_avg_score.toFixed(1) : null}
            suffix=" pts"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
