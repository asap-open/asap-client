import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import type { DocTopic } from "../../../pages/dashboard/help/docsNav";

interface HelpContentRendererProps {
  content: string;
  loading: boolean;
  currentTopic: DocTopic;
}

export default function HelpContentRenderer({
  content,
  loading,
  currentTopic,
}: HelpContentRendererProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-surface-hover rounded-full" />
          <div className="h-5 w-32 bg-surface-hover rounded-full" />
        </div>
        <div className="h-9 bg-surface-hover rounded-xl w-3/5" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-surface-hover rounded-md w-full" />
          <div className="h-4 bg-surface-hover rounded-md w-11/12" />
          <div className="h-4 bg-surface-hover rounded-md w-4/5" />
        </div>
        <div className="h-32 bg-surface-hover rounded-2xl w-full mt-6" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-4">
        <Link
          to="/dashboard/help"
          replace
          className="hover:text-primary transition-colors"
        >
          Docs
        </Link>
        <span>/</span>
        <span className="text-text-muted/80">{currentTopic.category}</span>
        <span>/</span>
        <span className="text-primary font-bold">{currentTopic.title}</span>
      </div>

      {/* Markdown Content */}
      <article className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none prose-p:text-text-muted prose-li:text-text-muted prose-strong:text-text-main">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...props }) => {
              if (href?.startsWith("/")) {
                return (
                  <Link
                    to={href}
                    replace={href.startsWith("/dashboard/help")}
                    className="font-medium text-primary hover:text-primary-hover underline underline-offset-2"
                    {...props}
                  >
                    {children}
                  </Link>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:text-primary-hover underline underline-offset-2"
                  {...props}
                >
                  {children}
                </a>
              );
            },
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-xl border border-border">
                <table className="w-full text-left text-sm" {...props}>
                  {children}
                </table>
              </div>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="border-l-4 border-primary/40 bg-surface pl-4 py-2 my-4 rounded-r-xl italic text-text-muted"
                {...props}
              >
                {children}
              </blockquote>
            ),
            code: ({ children, className, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="px-1.5 py-0.5 rounded-md bg-surface text-primary font-mono text-xs border border-border"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
