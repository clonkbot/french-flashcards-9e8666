import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AddCardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCardModal({ onClose, onSuccess }: AddCardModalProps) {
  const [english, setEnglish] = useState("");
  const [french, setFrench] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCard = useMutation(api.flashcards.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !french.trim()) {
      setError("Both fields are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCard({
        english: english.trim(),
        french: french.trim(),
        isAiGenerated: false,
      });
      onSuccess();
    } catch {
      setError("Failed to add card. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1E3A5F]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#FFFBF5] rounded-2xl shadow-2xl shadow-[#1E3A5F]/20 p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#1E3A5F]/50 hover:text-[#1E3A5F] transition-colors"
        >
          ✕
        </button>

        <h2 className="font-playfair text-2xl text-[#1E3A5F] mb-6">Add New Card</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-serif text-sm text-[#1E3A5F]/70 mb-2 uppercase tracking-widest">
              English Phrase
            </label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#1E3A5F]/20 rounded-lg font-serif text-[#1E3A5F] placeholder-[#1E3A5F]/30 focus:outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20 transition-all"
              placeholder="Hello, how are you?"
            />
          </div>

          <div>
            <label className="block font-serif text-sm text-[#1E3A5F]/70 mb-2 uppercase tracking-widest">
              French Translation
            </label>
            <input
              type="text"
              value={french}
              onChange={(e) => setFrench(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#1E3A5F]/20 rounded-lg font-playfair italic text-[#1E3A5F] placeholder-[#1E3A5F]/30 focus:outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20 transition-all"
              placeholder="Bonjour, comment allez-vous?"
            />
          </div>

          {error && (
            <div className="bg-[#E8B4B8]/20 border border-[#E8B4B8] rounded-lg p-3">
              <p className="font-serif text-sm text-[#1E3A5F]">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#1E3A5F]/20 text-[#1E3A5F] font-serif rounded-lg hover:bg-[#1E3A5F]/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#D4A574] text-white font-playfair rounded-lg hover:bg-[#c4956a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4A574]/20"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Adding...
                </span>
              ) : (
                "Add Card"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
