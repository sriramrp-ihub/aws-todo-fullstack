import { X } from "lucide-react";

interface AlertProps {
  type: "error" | "success" | "info";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${styles[type]} flex items-center justify-between animate-slide-down`}
    >
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100 transition"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
