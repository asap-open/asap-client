import {
  Info,
  Sparkles,
  House,
  Dumbbell,
  Layers,
  BarChart2,
  Sliders,
  User,
  Target,
  Activity,
  HelpCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface DocTopic {
  id: string; // matches markdown filename without .md (e.g. 'index', 'training-modes')
  title: string;
  shortDesc: string;
  icon: LucideIcon;
  category: "Overview" | "Core Features" | "Sports Science" | "Reference";
}

export interface DocCategory {
  name: string;
  topics: DocTopic[];
}

export const DOC_TOPICS: DocTopic[] = [
  {
    id: "index",
    title: "Introduction",
    shortDesc: "What is ASAP and core features overview",
    icon: Info,
    category: "Overview",
  },
  {
    id: "getting-started",
    title: "Getting Started",
    shortDesc: "Quick navigation & your first workout",
    icon: Sparkles,
    category: "Overview",
  },
  {
    id: "home",
    title: "Home Dashboard",
    shortDesc: "Activity feed, weight logging & status",
    icon: House,
    category: "Core Features",
  },
  {
    id: "sessions",
    title: "Workout Sessions",
    shortDesc: "Live tracking, sets, reps & timers",
    icon: Dumbbell,
    category: "Core Features",
  },
  {
    id: "exercises",
    title: "Exercise Library",
    shortDesc: "Filtering, history & custom lifts",
    icon: Layers,
    category: "Core Features",
  },
  {
    id: "progress-analytics",
    title: "Progress & Analytics",
    shortDesc: "Heatmap, 1RM trends & muscle balance",
    icon: BarChart2,
    category: "Core Features",
  },
  {
    id: "routines-settings",
    title: "Routines & Settings",
    shortDesc: "Templates, tracked lifts & themes",
    icon: Sliders,
    category: "Core Features",
  },
  {
    id: "profile",
    title: "Profile & Health",
    shortDesc: "Body metrics, BMI & account settings",
    icon: User,
    category: "Core Features",
  },
  {
    id: "training-modes",
    title: "Training Modes",
    shortDesc: "Body, Strength & Balanced split goals",
    icon: Target,
    category: "Sports Science",
  },
  {
    id: "workload",
    title: "Workload & ACWR",
    shortDesc: "Injury prevention & Ramp Rate",
    icon: Activity,
    category: "Sports Science",
  },
  {
    id: "faq",
    title: "FAQ & Tips",
    shortDesc: "Quick answers to common questions",
    icon: HelpCircle,
    category: "Reference",
  },
];

export function getDocCategories(): DocCategory[] {
  const categories: Record<string, DocTopic[]> = {};
  for (const topic of DOC_TOPICS) {
    if (!categories[topic.category]) {
      categories[topic.category] = [];
    }
    categories[topic.category].push(topic);
  }

  return Object.entries(categories).map(([name, topics]) => ({
    name,
    topics,
  }));
}

export function getCurrentTopic(topicId?: string): DocTopic {
  const normalizedId = !topicId || topicId === "" ? "index" : topicId;
  const found = DOC_TOPICS.find((t) => t.id === normalizedId);
  return (
    found || {
      id: normalizedId,
      title: normalizedId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      shortDesc: "Documentation topic",
      icon: FileText,
      category: "Overview",
    }
  );
}

export function getAdjacentTopics(topicId?: string): {
  prev: DocTopic | null;
  next: DocTopic | null;
} {
  const normalizedId = !topicId || topicId === "" ? "index" : topicId;
  const currentIndex = DOC_TOPICS.findIndex((t) => t.id === normalizedId);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? DOC_TOPICS[currentIndex - 1] : null,
    next: currentIndex < DOC_TOPICS.length - 1 ? DOC_TOPICS[currentIndex + 1] : null,
  };
}
