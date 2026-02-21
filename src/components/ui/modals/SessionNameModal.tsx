import { useState } from "react";
import { X } from "lucide-react";

interface SessionNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionName: string) => void;
}

export default function SessionNameModal({
  isOpen,
  onClose,
  onConfirm,
}: SessionNameModalProps) {
  const [sessionName, setSessionName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionName.trim()) {
      onConfirm(sessionName.trim());
      setSessionName("");
    }
  };

  const handleClose = () => {
    setSessionName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-text-main mb-2">
          Start New Session
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Give your workout session a name
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g., Push Day, Leg Day, Full Body"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full px-4 py-3 border border-border bg-surface-hover text-text-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            autoFocus
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-surface-hover text-text-main font-semibold rounded-xl hover:bg-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sessionName.trim()}
              className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
