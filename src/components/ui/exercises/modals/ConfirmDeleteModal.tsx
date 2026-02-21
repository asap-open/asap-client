import Modal from "../../Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-text-muted text-base">{description}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] ${
              isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                : "bg-primary hover:bg-primary-hover text-slate-900 shadow-primary/20"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-text-muted font-medium py-2 rounded-xl hover:text-text-main transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
