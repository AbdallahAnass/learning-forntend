import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, LogOut, GraduationCap, UserCircle } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/instructor/courses",   icon: BookOpen,        label: "My Courses" },
  { to: "/profile",              icon: UserCircle,      label: "My Profile" },
];

export default function InstructorLayout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-border flex flex-col fixed top-0 left-0 h-screen z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <GraduationCap className="w-6 h-6 text-primary mr-2" />
          <span className="text-lg font-bold text-primary tracking-tight">
            LearnLite
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
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
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-60">
        {children}
      </main>
    </div>
  );
}
