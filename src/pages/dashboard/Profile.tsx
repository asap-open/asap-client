import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import EditProfileModal from "../../components/profile/modals/EditProfileModal";
import ProfileHeader from "../../components/profile/info/ProfileHeader";
import PhysicalAttributes from "../../components/profile/info/PhysicalAttributes";
import WeightCard from "../../components/profile/stats/WeightCard";
import BMICard from "../../components/profile/stats/BMICard";
import ActionButtons from "../../components/profile/actions/ActionButtons";
import { fetchProfileWithSWR } from "../../utils/profile";
import type { UserData, UserProfile } from "../../utils/profile";
import LoadingScreen from "../../components/ui/Loading";
import { navigateAfterLogout } from "../../utils/navigation";

export default function Profile() {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProfileWithSWR(token, (freshData) => {
        // Update UI when fresh data arrives from background revalidation
        setUser(freshData.user);
        setProfile(freshData.profile);
        setPreviousWeight(freshData.previousWeight);
      });
      // Set initial data (may be cached)
      setUser(data.user);
      setProfile(data.profile);
      setPreviousWeight(data.previousWeight);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = () => {
    logout();
    navigateAfterLogout(navigate);
  };

  const calculateBMI = () => {
    if (!profile?.latestWeightKg || !profile?.heightCm) return null;
    const heightM = profile.heightCm / 100;
    return (profile.latestWeightKg / (heightM * heightM)).toFixed(1);
  };

  const calculateWeightChange = () => {
    if (!profile?.latestWeightKg || !previousWeight) return null;
    const change = profile.latestWeightKg - previousWeight;
    const percentChange = (change / previousWeight) * 100;
    return {
      value: Math.abs(percentChange).toFixed(1),
      isDecrease: change < 0,
    };
  };

  const bmi = calculateBMI();
  const weightChange = calculateWeightChange();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-start">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-surface-hover rounded-lg transition-colors p-1"
          >
            <ArrowLeft size={20} className="text-text-muted" />
          </button>
        </div>

        <h1 className="text-lg font-bold">Profile</h1>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            onClick={() => alert("Notifications coming soon!")} // Placeholder
            className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-muted"
          >
            <Bell size={20} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-muted"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-32 space-y-6">
        <ProfileHeader
          fullName={profile?.fullName || null}
          username={user.username}
          createdAt={user.createdAt}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <PhysicalAttributes
          heightCm={profile?.heightCm || null}
          gender={profile?.gender || null}
          dateOfBirth={profile?.dateOfBirth || null}
        />

        {/* Weight & BMI Cards */}
        <section className="px-6 grid grid-cols-2 gap-4">
          <WeightCard
            latestWeightKg={profile?.latestWeightKg || null}
            weightChange={weightChange}
          />
          <BMICard bmi={bmi} />
        </section>

        <ActionButtons onLogout={handleLogout} />
      </main>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadData}
        token={token}
        currentProfile={profile}
      />
    </div>
  );
}
