import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Campus<span className="text-primary">Events</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your one-stop platform for discovering and managing campus events. Never miss out on what matters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: "/events", label: "All Events" },
                { href: "/calendar", label: "Calendar" },
                { href: "/events?category=academic", label: "Academic" },
                { href: "/events?category=sports", label: "Sports" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Get Involved</h4>
            <ul className="space-y-2">
              {[
                { href: "/submit", label: "Submit an Event" },
                { href: "/register", label: "Create Account" },
                { href: "/events?category=clubs", label: "Clubs & Orgs" },
                { href: "/events?category=career", label: "Career Events" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Resources</h4>
            <ul className="space-y-2">
              {[
                { href: "/events?category=health", label: "Health & Wellness" },
                { href: "/events?category=tech", label: "Technology" },
                { href: "/events?category=social", label: "Social Events" },
                { href: "/events?category=arts", label: "Arts & Culture" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusEvents. Built for the campus community.
          </p>
        </div>
      </div>
    </footer>
  );
}
