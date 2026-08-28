import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getAdjacentTopics,
  type DocTopic,
} from "../../../pages/dashboard/help/docsNav";

interface HelpPaginationProps {
  activeTopicId: string;
}

export default function HelpPagination({ activeTopicId }: HelpPaginationProps) {
  const { prev, next } = getAdjacentTopics(activeTopicId);

  if (!prev && !next) return null;

  return (
    <div className="mt-12 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          to={prev.id === "index" ? "/dashboard/help" : `/dashboard/help/${prev.id}`}
          className="group flex flex-col items-start p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xs transition-all text-left"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted group-hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Previous Topic
          </span>
          <span className="mt-1.5 font-bold text-sm text-text-main flex items-center gap-2">
            <prev.icon size={15} className="text-primary shrink-0" />
            <span className="group-hover:text-primary transition-colors">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          to={`/dashboard/help/${next.id}`}
          className="group flex flex-col items-end p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xs transition-all text-right sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted group-hover:text-primary transition-colors">
            Next Topic <ArrowRight size={14} />
          </span>
          <span className="mt-1.5 font-bold text-sm text-text-main flex items-center gap-2">
            <span className="group-hover:text-primary transition-colors">
              {next.title}
            </span>
            <next.icon size={15} className="text-primary shrink-0" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}
