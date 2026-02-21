import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { House, Dumbbell, BarChart2, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import QuickActions from "../components/dashboard/home/QuickActions";
import { navigateAfterLogout } from "../utils/navigation";

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigateAfterLogout(navigate);
  };

  const desktopNavItems = [
    { to: "/", icon: House, label: "Home" },
    { to: "/exercises", icon: Dumbbell, label: "Exercises" },
    { to: "/analytics", icon: BarChart2, label: "Progress" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-background text-text-main font-display overflow-hidden">
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-full p-6 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2 justify-center">
            <img
              src="/logo-2.webp"
              alt="ASAP Logo"
              className="w-12 h-12 md:w-18 md:h-18"
            />
          </div>

          <nav className="space-y-2">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive
                      ? "bg-primary text-background shadow-lg shadow-primary/20"
                      : "text-text-muted hover:bg-surface-hover hover:text-text-main"
                  }`
                }
              >
                <item.icon size={20} strokeWidth={2.5} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-500 transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative h-full pb-24 md:pb-0 scrollbar-hide">
        <Outlet />

        {/* Overlay when Quick Actions are open */}
        {isActionsOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsActionsOpen(false)}
          />
        )}

        {/* Desktop Add Session Button */}
        <button
          type="button"
          aria-pressed={isActionsOpen}
          onClick={() => setIsActionsOpen((prev) => !prev)}
          className={`hidden md:flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-xl transition-colors fixed bottom-10 right-10 z-50 ${
            isActionsOpen
              ? "bg-text-main text-surface"
              : "bg-primary text-background hover:bg-primary/90"
          }`}
        >
          <Plus
            size={22}
            strokeWidth={2.5}
            className={`transition-transform ${isActionsOpen ? "rotate-45" : ""}`}
          />
          <span>Add Session</span>
        </button>

        {/* Quick Actions Menu (Mobile Only) */}
        <QuickActions
          isOpen={isActionsOpen}
          onClose={() => setIsActionsOpen(false)}
        />
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border px-6 pb-8 pt-2">
        <div className="flex items-center justify-between relative">
          {/* Left Items */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-text-muted"}`
            }
          >
            <House size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>

          <NavLink
            to="/exercises"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-text-muted"}`
            }
          >
            <Dumbbell size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Exercises</span>
          </NavLink>

          {/* Center FAB */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className={`flex items-center justify-center h-16 w-16 rounded-full shadow-xl ring-4 ring-background transition-transform active:scale-95 ${isActionsOpen ? "bg-text-main rotate-45" : "bg-primary"}`}
            >
              <Plus
                size={32}
                strokeWidth={3}
                className={isActionsOpen ? "text-surface" : "text-background"}
              />
            </button>
          </div>

          {/* Spacer for FAB */}
          <div className="w-12"></div>

          {/* Right Items */}
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-text-muted"}`
            }
          >
            <BarChart2 size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Progress</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-text-muted"}`
            }
          >
            <User size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Profile</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
