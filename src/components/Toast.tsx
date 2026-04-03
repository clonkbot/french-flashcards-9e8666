interface ToastProps {
  message: string;
  type: "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div
        className={`px-6 py-3 rounded-full shadow-xl font-serif text-sm ${
          type === "success"
            ? "bg-[#9CAF88] text-white shadow-[#9CAF88]/30"
            : "bg-[#E8B4B8] text-white shadow-[#E8B4B8]/30"
        }`}
      >
        <span className="mr-2">{type === "success" ? "✓" : "!"}</span>
        {message}
      </div>
    </div>
  );
}
