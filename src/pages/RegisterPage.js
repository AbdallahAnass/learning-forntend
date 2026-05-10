import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { register } from "@/api/auth";

const roles = [
  {
    value: "student",
    label: "I want to Learn",
    icon: GraduationCap,
  },
  {
    value: "instructor",
    label: "I want to Teach",
    icon: BookOpen,
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 text-primary-foreground p-12 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      >
        {/* Blue overlay */}
        <div className="absolute inset-0 bg-primary/80" />
        <Link to="/" className="relative z-10 text-2xl font-bold tracking-tight">
          LearnLite
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start your learning journey today.
          </h2>
          <p className="opacity-75 text-lg leading-relaxed">
            Join thousands of students and instructors building real skills on
            our platform.
          </p>
        </div>
        <p className="relative z-10 text-sm opacity-50">© 2026 LearnLite</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            to="/"
            className="md:hidden text-xl font-bold text-primary block mb-8"
          >
            LearnLite
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Already have one?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {roles.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: value }))}
                  className={cn(
                    "flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-colors",
                    form.role === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 8 characters"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                placeholder="Repeat your password"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
