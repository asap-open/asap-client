import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, BookOpen } from "lucide-react";
import {
  getDocCategories,
  type DocTopic,
} from "../../../pages/dashboard/help/docsNav";

interface HelpMobileDrawerProps {
  isOpen: boolean;
  activeTopicId: string;
  onClose: () => void;
}

export default function HelpMobileDrawer({
  isOpen,
  activeTopicId,
  onClose,
}: HelpMobileDrawerProps) {
  const categories = getDocCategories();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Prevent body scroll when drawer is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative bg-surface border-t border-border rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full z-10 animate-in slide-in-from-bottom duration-250">
        {/* Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-border rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="text-base font-bold text-text-main">
              Documentation Topics
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Topic List */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {categories.map((category) => (
            <div key={category.name} className="space-y-1.5">
              <h3 className="px-3 text-[11px] font-bold tracking-wider uppercase text-text-muted/70">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.topics.map((topic: DocTopic) => {
                  const Icon = topic.icon;
                  const isActive =
                    activeTopicId === topic.id ||
                    (topic.id === "index" && activeTopicId === "");
                  const href =
                    topic.id === "index"
                      ? "/dashboard/help"
                      : `/dashboard/help/${topic.id}`;

                  return (
                    <Link
                      key={topic.id}
                      to={href}
                      onClick={onClose}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? "bg-primary/15 text-primary font-semibold border border-primary/25"
                          : "text-text-muted hover:bg-surface-hover hover:text-text-main font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-surface-hover text-text-muted"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-text-main">
                            {topic.title}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {topic.shortDesc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
