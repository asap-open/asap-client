import { Link } from "react-router-dom";
import {
  getDocCategories,
  type DocTopic,
} from "../../../pages/dashboard/help/docsNav";

interface HelpSidebarProps {
  activeTopicId: string;
}

export default function HelpSidebar({ activeTopicId }: HelpSidebarProps) {
  const categories = getDocCategories();

  return (
    <aside className="hidden md:block w-72 shrink-0 border-r border-border min-h-[calc(100vh-61px)] py-6 px-4 sticky top-[61px] max-h-[calc(100vh-61px)] overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.name} className="space-y-1.5">
            <h3 className="px-3 text-[11px] font-bold tracking-wider uppercase text-text-muted/70">
              {category.name}
            </h3>
            <nav className="space-y-1">
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
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-xs font-semibold"
                        : "text-text-muted hover:bg-surface-hover hover:text-text-main font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isActive
                            ? "text-primary"
                            : "text-text-muted group-hover:text-text-main"
                        }`}
                      />
                      <span className="truncate">{topic.title}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
