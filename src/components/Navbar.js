import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-primary tracking-tight">
          LearnLite
        </span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-foreground font-medium">
            Log In
          </Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  );
}
