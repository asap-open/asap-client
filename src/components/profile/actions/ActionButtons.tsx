import { LogOut } from "lucide-react";

interface ActionButtonsProps {
  onLogout: () => void;
}

export default function ActionButtons({ onLogout }: ActionButtonsProps) {
  return (
    <section className="px-6 mt-8">
      <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-3 text-red-500">
            <LogOut size={20} />
            <span className="text-sm font-medium">Log Out</span>
          </div>
        </button>
      </div>
    </section>
  );
}
