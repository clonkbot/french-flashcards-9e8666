import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Flashcard } from "./Flashcard";
import { AddCardModal } from "./AddCardModal";
import { Toast } from "./Toast";
import type { Id } from "../../convex/_generated/dataModel";

type Tab = "practice" | "cards" | "add";

export function FlashcardApp() {
  const { signOut } = useAuthActions();
  const flashcards = useQuery(api.flashcards.list);
  const createMany = useMutation(api.flashcards.createMany);
  const removeCard = useMutation(api.flashcards.remove);
  const chat = useAction(api.ai.chat);

  const [activeTab, setActiveTab] = useState<Tab>("practice");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateFlashcards = async () => {
    setIsGenerating(true);
    try {
      const response = await chat({
        messages: [{ role: "user", content: "Generate 5 beginner French flashcards with modern, everyday sentences. Return ONLY a JSON array with objects containing 'english' and 'french' keys. Example format: [{\"english\": \"Hello, how are you?\", \"french\": \"Bonjour, comment allez-vous?\"}]. Focus on practical phrases for greetings, ordering food, asking directions, shopping, and basic conversation." }],
        systemPrompt: "You are a French language teacher creating beginner flashcards. Return ONLY valid JSON, no markdown, no explanation. Each phrase should be practical and commonly used in modern French conversation.",
      });

      // Parse the JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const cards = JSON.parse(jsonMatch[0]) as Array<{ english: string; french: string }>;
        await createMany({ cards });
        showToast(`Added ${cards.length} new flashcards!`, "success");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      showToast("Failed to generate flashcards. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: Id<"flashcards">) => {
    try {
      await removeCard({ id });
      showToast("Card deleted", "success");
    } catch {
      showToast("Failed to delete card", "error");
    }
  };

  const nextCard = () => {
    if (flashcards && flashcards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }
  };

  const prevCard = () => {
    if (flashcards && flashcards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }
  };

  const currentCard = flashcards?.[currentIndex];

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF5] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-[#E8B4B8]/20 to-transparent blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-tr from-[#D4A574]/10 to-transparent blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 md:w-64 md:h-64 rounded-full bg-gradient-to-bl from-[#9CAF88]/10 to-transparent blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 md:px-8 md:py-6 flex items-center justify-between border-b border-[#1E3A5F]/10">
        <h1 className="font-playfair text-2xl md:text-3xl text-[#1E3A5F] italic">Parlez</h1>
        <button
          onClick={() => signOut()}
          className="font-serif text-sm text-[#1E3A5F]/60 hover:text-[#D4A574] transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className="relative z-10 px-4 md:px-8 py-3 md:py-4 border-b border-[#1E3A5F]/10 bg-white/50 backdrop-blur-sm">
        <div className="flex gap-2 md:gap-4 max-w-2xl mx-auto">
          {[
            { id: "practice" as Tab, label: "Practice", icon: "🎯" },
            { id: "cards" as Tab, label: "My Cards", icon: "📚" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-serif text-sm md:text-base transition-all ${
                activeTab === tab.id
                  ? "bg-[#1E3A5F] text-[#FFFBF5] shadow-lg shadow-[#1E3A5F]/20"
                  : "bg-white/70 text-[#1E3A5F]/70 hover:bg-white"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col p-4 md:p-8">
        {activeTab === "practice" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            {flashcards === undefined ? (
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-[#D4A574]/30 border-t-[#D4A574] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-serif text-[#1E3A5F]/60">Loading your cards...</p>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="text-center space-y-6 px-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#E8B4B8]/30 to-[#D4A574]/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🇫🇷</span>
                </div>
                <div>
                  <h2 className="font-playfair text-2xl md:text-3xl text-[#1E3A5F] mb-2">Bienvenue!</h2>
                  <p className="font-serif text-[#1E3A5F]/60">Generate your first flashcards to begin learning French</p>
                </div>
                <button
                  onClick={generateFlashcards}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-[#D4A574] text-white font-playfair text-lg rounded-xl hover:bg-[#c4956a] transition-all shadow-lg shadow-[#D4A574]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generate Flashcards
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div className="text-center mb-4">
                  <p className="font-serif text-sm text-[#1E3A5F]/50 uppercase tracking-widest">
                    Card {currentIndex + 1} of {flashcards.length}
                  </p>
                </div>

                {currentCard && <Flashcard card={currentCard} />}

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={prevCard}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#1E3A5F]/20 text-[#1E3A5F] font-serif text-xl hover:bg-[#1E3A5F] hover:text-white transition-all shadow-md"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextCard}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#1E3A5F]/20 text-[#1E3A5F] font-serif text-xl hover:bg-[#1E3A5F] hover:text-white transition-all shadow-md"
                  >
                    →
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={generateFlashcards}
                    disabled={isGenerating}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4A574] text-white font-serif rounded-xl hover:bg-[#c4956a] transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate More
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#1E3A5F]/20 text-[#1E3A5F] font-serif rounded-xl hover:bg-[#1E3A5F]/5 transition-all"
                  >
                    <span>+</span>
                    Add Card
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "cards" && (
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="font-playfair text-2xl text-[#1E3A5F]">Your Collection</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={generateFlashcards}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4A574] text-white font-serif text-sm rounded-lg hover:bg-[#c4956a] transition-all disabled:opacity-50"
                >
                  {isGenerating ? "..." : "✨ Generate"}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#1E3A5F]/20 text-[#1E3A5F] font-serif text-sm rounded-lg hover:bg-[#1E3A5F]/5 transition-all"
                >
                  + Add
                </button>
              </div>
            </div>

            {flashcards === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/50 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-[#1E3A5F]/10 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-[#D4A574]/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : flashcards.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#E8B4B8]/30 to-[#D4A574]/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <p className="font-serif text-[#1E3A5F]/60">No cards yet. Generate or add some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashcards.map((card: typeof flashcards[number], index: number) => (
                  <div
                    key={card._id}
                    className="group bg-white/70 backdrop-blur-sm border border-[#1E3A5F]/10 rounded-xl p-5 hover:shadow-lg transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[#1E3A5F] mb-1 truncate">{card.english}</p>
                        <p className="font-playfair text-[#D4A574] italic truncate">{card.french}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {card.isAiGenerated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#9CAF88]/20 text-[#9CAF88] text-xs rounded-full font-serif">
                              ✨ AI
                            </span>
                          )}
                          {(card.timesCorrect > 0 || card.timesIncorrect > 0) && (
                            <span className="text-xs text-[#1E3A5F]/40 font-serif">
                              {card.timesCorrect}✓ / {card.timesIncorrect}✗
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(card._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#E8B4B8] hover:text-red-500 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 border-t border-[#1E3A5F]/10">
        <p className="font-serif text-xs text-[#1E3A5F]/40">
          Requested by <span className="text-[#D4A574]">@PauliusX</span> · Built by <span className="text-[#D4A574]">@clonkbot</span>
        </p>
      </footer>

      {/* Modals */}
      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            showToast("Card added successfully!", "success");
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
