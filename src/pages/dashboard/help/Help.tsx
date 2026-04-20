import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Automatically import all markdown files in the content directory as raw strings
const markdownModules = import.meta.glob("./content/*.md", {
  query: "?raw",
  import: "default",
});

export default function Help() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId?: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const key = `./content/${topicId || "index"}.md`;
        if (markdownModules[key]) {
          const rawContent = (await markdownModules[key]()) as string;
          setContent(rawContent);
        } else {
          setContent("# 404 Not Found\n\nThe requested documentation page does not exist.\n\n[Return to Help Home](/dashboard/help)");
        }
      } catch (error) {
        setContent("# Error\n\nFailed to load documentation.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [topicId]);

  return (
    <div className="min-h-screen bg-background text-text-main font-display">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl px-4 py-4 flex items-center gap-4 border-b border-border/50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Help & Documentation</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-32">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-hover rounded w-1/3"></div>
            <div className="h-4 bg-surface-hover rounded w-full"></div>
            <div className="h-4 bg-surface-hover rounded w-5/6"></div>
            <div className="h-4 bg-surface-hover rounded w-4/6"></div>
          </div>
        ) : (
          <article className="prose prose-slate dark:prose-invert prose-emerald max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  if (href?.startsWith("/")) {
                    return (
                      <Link to={href} {...props}>
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        )}
      </main>
    </div>
  );
}
