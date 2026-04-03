import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { FlashcardApp } from "./components/FlashcardApp";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF5] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-[200px] md:text-[300px] font-playfair text-[#1E3A5F]/[0.03] select-none">Fr</div>
        <div className="absolute bottom-10 right-10 text-[150px] md:text-[250px] font-playfair text-[#D4A574]/[0.08] select-none">ais</div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#E8B4B8]/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 md:w-72 md:h-72 rounded-full bg-gradient-to-tr from-[#D4A574]/15 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-playfair text-4xl md:text-6xl text-[#1E3A5F] mb-2 italic">Parlez</h1>
          <p className="font-serif text-[#1E3A5F]/60 text-base md:text-lg tracking-wide">Begin your French journey</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-[#1E3A5F]/10 rounded-2xl p-6 md:p-10 shadow-xl shadow-[#1E3A5F]/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-serif text-sm text-[#1E3A5F]/70 mb-2 uppercase tracking-widest">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 md:py-4 bg-[#FFFBF5] border border-[#1E3A5F]/20 rounded-lg font-serif text-[#1E3A5F] placeholder-[#1E3A5F]/30 focus:outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20 transition-all"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block font-serif text-sm text-[#1E3A5F]/70 mb-2 uppercase tracking-widest">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 md:py-4 bg-[#FFFBF5] border border-[#1E3A5F]/20 rounded-lg font-serif text-[#1E3A5F] placeholder-[#1E3A5F]/30 focus:outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20 transition-all"
                placeholder="********"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-[#E8B4B8]/20 border border-[#E8B4B8] rounded-lg p-3 text-center">
                <p className="font-serif text-sm text-[#1E3A5F]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-[#1E3A5F] text-[#FFFBF5] font-playfair text-lg rounded-lg hover:bg-[#2a4d75] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1E3A5F]/20"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#FFFBF5]/30 border-t-[#FFFBF5] rounded-full animate-spin"></span>
                  Loading...
                </span>
              ) : (
                flow === "signIn" ? "Entrer" : "Commencer"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="font-serif text-[#D4A574] hover:text-[#c4956a] transition-colors underline underline-offset-4"
            >
              {flow === "signIn" ? "Create an account" : "Already have an account?"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[#1E3A5F]/10">
            <button
              type="button"
              onClick={() => signIn("anonymous")}
              className="w-full py-3 border border-[#1E3A5F]/20 text-[#1E3A5F]/70 font-serif rounded-lg hover:bg-[#1E3A5F]/5 transition-all"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center">
        <p className="font-serif text-xs text-[#1E3A5F]/40">
          Requested by <span className="text-[#D4A574]">@PauliusX</span> · Built by <span className="text-[#D4A574]">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FFFBF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#D4A574]/30 border-t-[#D4A574] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-playfair text-[#1E3A5F]/60 italic text-lg">Un moment...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <FlashcardApp />;
}
