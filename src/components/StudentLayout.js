import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Library, LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/courses",      icon: BookOpen, label: "Browse Courses" },
  { to: "/my-learning",  icon: Library,  label: "My Learning"    },
];

export default function StudentLayout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary tracking-tight">LearnLite</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
