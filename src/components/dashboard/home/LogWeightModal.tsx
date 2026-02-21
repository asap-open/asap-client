import { useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import { invalidateProfileCache } from "../../../utils/profile";
import Modal from "../../ui/Modal";

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LogWeightModal({
  isOpen,
  onClose,
  onSuccess,
}: LogWeightModalProps) {
  const { token } = useAuth();
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setLoading(true);
    setError(null);
    try {
      await api.post("/weights", { weightKg: parseFloat(weight) }, token);
      // Invalidate profile cache since weight data changed
      invalidateProfileCache();
      setWeight("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to log weight.");
      console.error("Error logging weight:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Today's Weight">
      <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="weight-input"
            className="text-sm font-semibold text-text-muted uppercase tracking-wider"
          >
            Weight (kg)
          </label>
          <div className="relative">
            <input
              id="weight-input"
              type="number"
              step="0.1"
              min="0"
              autoFocus
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-4 pl-12 text-2xl font-bold text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">
              kg
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:bg-surface-hover transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading || !weight}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving
              </>
            ) : (
              "Save Weight"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
