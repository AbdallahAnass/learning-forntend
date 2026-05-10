import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">
          LearnLite
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-foreground font-medium"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
          <Button onClick={() => navigate("/register")}>Get Started</Button>
        </div>
      </div>
    </nav>
  );
}
