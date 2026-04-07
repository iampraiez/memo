import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  disabled,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4 text-center">
        {variant === "destructive" && (
          <div className="bg-destructive-100 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive-600 h-6 w-6" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <p className="text-neutral-600">{message}</p>
        </div>

        <div className="flex justify-center space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={disabled || false}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
