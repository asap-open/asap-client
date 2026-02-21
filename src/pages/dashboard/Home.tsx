import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RecentHistory from "../../components/dashboard/home/RecentHistory";
import LogWeightModal from "../../components/dashboard/home/LogWeightModal";
import { useAuth } from "../../context/AuthContext";
import { fetchProfileWithSWR } from "../../utils/profile";

export default function Home() {
  const { token } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [isLogWeightModalOpen, setIsLogWeightModalOpen] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      if (token) {
        try {
          const data = await fetchProfileWithSWR(token, (freshData) => {
            // Update when fresh data arrives
            setFullName(freshData.profile?.fullName || "");
          });
          // Set initial data (may be cached)
          setFullName(data.profile?.fullName || "");
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    initUser();
  }, [token]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-md mx-auto w-full md:max-w-4xl md:px-6">
      {/* Header Section */}
      <header className="pt-8 px-6 pb-6 bg-background md:pt-12 md:pb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-main">
            {getGreeting()},{" "}
            <span className="text-primary capitalize">
              {fullName || "User"}
            </span>
          </h1>
        </div>

        <button
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
          onClick={() => setIsLogWeightModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Log Weight</span>
        </button>
      </header>

      {/* Recent Activity Section */}
      <div className="px-6 pb-32 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-main">Recent Activity</h2>
        </div>

        <RecentHistory />
      </div>

      <LogWeightModal
        isOpen={isLogWeightModalOpen}
        onClose={() => setIsLogWeightModalOpen(false)}
      />
    </div>
  );
}
