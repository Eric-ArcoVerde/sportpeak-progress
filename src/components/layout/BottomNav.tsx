import { NavLink } from "react-router-dom";
import { Home, Plus, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const baseNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/new", icon: Plus, label: "Novo", highlight: true },
  { to: "/profile", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const { isAdmin } = useIsAdmin();

  const navItems = isAdmin
    ? [...baseNavItems, { to: "/admin", icon: Shield, label: "Admin" }]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-xl transition-all",
                item.highlight && !isActive && "relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.highlight ? (
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-2xl -mt-5 transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-foreground"
                  )}>
                    <item.icon className="h-6 w-6" />
                  </div>
                ) : (
                  <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

