import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HelpHeader from "../../../components/dashboard/help/HelpHeader";
import HelpSidebar from "../../../components/dashboard/help/HelpSidebar";
import HelpMobileDrawer from "../../../components/dashboard/help/HelpMobileDrawer";
import HelpContentRenderer from "../../../components/dashboard/help/HelpContentRenderer";
import HelpPagination from "../../../components/dashboard/help/HelpPagination";
import { getCurrentTopic } from "./docsNav";

// Automatically import all markdown files in the content directory as raw strings
const markdownModules = import.meta.glob("./content/*.md", {
  query: "?raw",
  import: "default",
});

export default function Help() {
  const { topicId } = useParams<{ topicId?: string }>();
  const activeTopicId = topicId || "index";
  const currentTopic = getCurrentTopic(activeTopicId);

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const key = `./content/${activeTopicId}.md`;
        if (markdownModules[key]) {
          const rawContent = (await markdownModules[key]()) as string;
          setContent(rawContent);
        } else {
          setContent(
            `# 404 Not Found\n\nThe requested documentation page \`${activeTopicId}\` does not exist.\n\n[Return to Help Home](/dashboard/help)`
          );
        }
      } catch (error) {
        setContent("# Error\n\nFailed to load documentation.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    // Scroll to top when changing topics
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTopicId]);

  return (
    <div className="min-h-screen bg-background text-text-main font-display flex flex-col">
      {/* Top Header */}
      <HelpHeader
        currentTopic={currentTopic}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Desktop Sidebar Navigation */}
        <HelpSidebar activeTopicId={activeTopicId} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 pb-32 max-w-4xl">
          <HelpContentRenderer
            content={content}
            loading={loading}
            currentTopic={currentTopic}
          />

          {/* Next / Previous Pagination */}
          {!loading && <HelpPagination activeTopicId={activeTopicId} />}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <HelpMobileDrawer
        isOpen={isMobileDrawerOpen}
        activeTopicId={activeTopicId}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
}
