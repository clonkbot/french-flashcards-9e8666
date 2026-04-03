import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface FlashcardProps {
  card: {
    _id: Id<"flashcards">;
    english: string;
    french: string;
  };
}

export function Flashcard({ card }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const tts = useAction(api.ai.textToSpeech);
  const markPracticed = useMutation(api.flashcards.markPracticed);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setAudioError(null);
  };

  const handlePronounce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    setAudioError(null);

    try {
      const base64Pcm = await tts({ text: card.french, voice: "Kore" });

      if (!base64Pcm) {
        throw new Error("No audio returned");
      }

      // Convert PCM to WAV
      const pcm = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
      const sampleRate = 24000;
      const header = new ArrayBuffer(44);
      const view = new DataView(header);
      const w = (o: number, s: string) => s.split('').forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true);
      w(8, 'WAVE'); w(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true);
      view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
      view.setUint16(34, 16, true); w(36, 'data');
      view.setUint32(40, pcm.length, true);
      const wav = new Uint8Array(44 + pcm.length);
      wav.set(new Uint8Array(header), 0);
      wav.set(pcm, 44);
      const audioUrl = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));

      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setAudioError("Playback failed");
        URL.revokeObjectURL(audioUrl);
      };
      await audio.play();
    } catch (error) {
      console.error("TTS failed:", error);
      setIsPlaying(false);
      setAudioError("Could not pronounce. Try again.");
    }
  };

  const handleMark = async (correct: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markPracticed({ id: card._id, correct });
    } catch (error) {
      console.error("Failed to mark card:", error);
    }
  };

  return (
    <div className="perspective-1000 w-full">
      <div
        onClick={handleFlip}
        className={`relative w-full aspect-[4/3] md:aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front - English */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl border-2 border-[#1E3A5F]/10 shadow-xl shadow-[#1E3A5F]/10 flex flex-col items-center justify-center p-6 md:p-10">
            <span className="text-xs md:text-sm font-serif text-[#1E3A5F]/40 uppercase tracking-widest mb-4">English</span>
            <p className="font-playfair text-xl md:text-3xl text-[#1E3A5F] text-center leading-relaxed">{card.english}</p>
            <span className="mt-6 text-xs md:text-sm font-serif text-[#D4A574]">Tap to reveal French</span>
          </div>
        </div>

        {/* Back - French */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#2a4d75] rounded-2xl md:rounded-3xl shadow-xl shadow-[#1E3A5F]/30 flex flex-col items-center justify-center p-6 md:p-10">
            <span className="text-xs md:text-sm font-serif text-[#FFFBF5]/50 uppercase tracking-widest mb-4">French</span>
            <p className="font-playfair text-xl md:text-3xl text-[#FFFBF5] text-center italic leading-relaxed mb-4">{card.french}</p>

            <button
              onClick={handlePronounce}
              disabled={isPlaying}
              className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-[#D4A574] text-white font-serif rounded-full hover:bg-[#c4956a] transition-all disabled:opacity-50 shadow-lg"
            >
              {isPlaying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Playing...
                </>
              ) : (
                <>
                  <span className="text-lg">🔊</span>
                  Pronounce
                </>
              )}
            </button>

            {audioError && (
              <p className="mt-2 text-xs text-[#E8B4B8]">{audioError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={(e) => handleMark(true, e)}
                className="px-4 py-2 bg-[#9CAF88]/20 text-[#9CAF88] font-serif text-sm rounded-lg hover:bg-[#9CAF88]/30 transition-all"
              >
                ✓ Got it
              </button>
              <button
                onClick={(e) => handleMark(false, e)}
                className="px-4 py-2 bg-[#E8B4B8]/20 text-[#E8B4B8] font-serif text-sm rounded-lg hover:bg-[#E8B4B8]/30 transition-all"
              >
                ✗ Still learning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
