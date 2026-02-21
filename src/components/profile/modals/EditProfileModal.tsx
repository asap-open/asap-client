import { useState, useEffect } from "react";
import { X, User, Calendar, Ruler, Target } from "lucide-react";
import { api } from "../../../utils/api";
import { invalidateProfileCache } from "../../../utils/profile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
  currentProfile: {
    fullName: string | null;
    heightCm: number | null;
    targetWeightKg: number | null;
    dateOfBirth: string | null;
    gender: string | null;
  } | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  currentProfile,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    heightCm: "",
    targetWeightKg: "",
    dateOfBirth: "",
    gender: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentProfile && isOpen) {
      setFormData({
        fullName: currentProfile.fullName || "",
        heightCm: currentProfile.heightCm?.toString() || "",
        targetWeightKg: currentProfile.targetWeightKg?.toString() || "",
        dateOfBirth: currentProfile.dateOfBirth
          ? currentProfile.dateOfBirth.split("T")[0]
          : "",
        gender: currentProfile.gender || "",
      });
      setError(""); // Clear any previous errors
    }
  }, [currentProfile, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim() || null,
        heightCm: formData.heightCm ? Number(formData.heightCm) : null,
        targetWeightKg: formData.targetWeightKg
          ? Number(formData.targetWeightKg)
          : null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
      };

      const response = await api.put("/profile", payload, token);

      // Invalidate cache so next fetch gets fresh data
      invalidateProfileCache();

      // Call onSuccess to refresh the profile data
      await onSuccess();

      // Close modal after success
      onClose();
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="flex flex-col">
              <span className="text-sm font-semibold text-text-main mb-2 ml-1">
                Full Name
              </span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-border bg-surface h-12 pl-10 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex flex-col">
                <span className="text-sm font-semibold text-text-main mb-2 ml-1">
                  Height (cm)
                </span>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleChange}
                    placeholder="180"
                    step="0.1"
                    min="0"
                    className="w-full rounded-xl border border-border bg-surface h-12 pl-10 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="flex flex-col">
                <span className="text-sm font-semibold text-text-main mb-2 ml-1">
                  Target Weight (kg)
                </span>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="number"
                    name="targetWeightKg"
                    value={formData.targetWeightKg}
                    onChange={handleChange}
                    placeholder="75"
                    step="0.1"
                    min="0"
                    className="w-full rounded-xl border border-border bg-surface h-12 pl-10 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="flex flex-col">
              <span className="text-sm font-semibold text-text-main mb-2 ml-1">
                Date of Birth
              </span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-surface h-12 pl-10 pr-4 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </label>
          </div>

          <div>
            <label className="flex flex-col">
              <span className="text-sm font-semibold text-text-main mb-2 ml-1">
                Gender
              </span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-surface h-12 px-4 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
