import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import HeroBackground from "../components/ui/HeroBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await api.post("/auth/signin", { identifier, password });
      login(data.token);
      navigate("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden font-display">
      {/* Full Screen Background Wrapper */}
      <div className="absolute inset-0 w-full h-full">
        <HeroBackground />
      </div>

      {/* Main Container - Split View on Desktop */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row h-screen md:h-auto md:min-h-[600px] md:max-h-[800px] md:rounded-3xl md:overflow-hidden md:shadow-2xl">
        {/* Left Side (Desktop): Branding / Image Area */}
        {/* On Mobile: Top part of screen */}
        <div className="flex-none basis-[35%] lg:basis-[40%] flex flex-col items-center pt-12 md:justify-center md:pt-0 md:bg-gradient-to-br md:from-white/60 md:to-white/30 md:backdrop-blur-xl md:border-r md:border-white/40">
          {/* Logo Circle */}

          <img
            src="/logo-2.webp"
            alt="ASAP Logo"
            className="w-28 h-28 md:w-34 md:h-34"
          />

          {/* Desktop Slogan (Hidden on Mobile) */}
          <p className="text-white/80 md:text-slate-700 text-lg mt-4 text-center hidden md:block max-w-xs font-medium">
            Welcome back! Ready to push your limits again?
          </p>

          {/* Mobile: Welcome Text (In Upper Section) */}
          <div className="md:hidden mt-6 px-6 text-center">
            <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">
              Welcome Back
            </h1>
            <p className="text-white/80 text-base font-normal leading-normal pt-2">
              Enter your details to continue your fitness journey
            </p>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        {/* On Mobile: Bottom Sheet Card. On Desktop: Right Panel */}
        <div className="flex-1 flex flex-col bg-background md:bg-surface w-full h-full md:h-auto rounded-t-[40px] md:rounded-none px-6 pt-10 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none mt-8 md:mt-0 overflow-y-auto md:justify-center">
          {/* Desktop Header */}
          <div className="hidden md:block mb-8 w-full max-w-md mx-auto">
            <h1 className="text-text-main text-3xl font-bold">Log In</h1>
            <p className="text-text-muted mt-2">
              Enter your details to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-md mx-auto w-full"
          >
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {/* identifier Field */}
            <div className="flex flex-col gap-2">
              <label className="flex flex-col w-full">
                <span className="text-text-main text-sm font-medium leading-normal pb-1 pl-1">
                  Username or Email
                </span>
                <input
                  className="w-full rounded-xl text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-surface h-14 placeholder:text-text-muted/60 p-[15px] text-base font-normal transition-all"
                  placeholder="Enter your username or email"
                  type="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="flex flex-col w-full relative">
                <span className="text-text-main text-sm font-medium leading-normal pb-1 pl-1">
                  Password
                </span>
                <div className="relative">
                  <input
                    className="w-full rounded-xl text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-surface h-14 placeholder:text-text-muted/60 p-[15px] pr-12 text-base font-normal transition-all"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>
              <div className="flex justify-end px-1">
                <a className="text-text-main text-sm font-medium hover:underline hover:text-primary transition-colors cursor-pointer">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg h-14 rounded-xl shadow-md shadow-primary/30 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="py-4 text-center">
              <p className="text-text-muted text-base">
                Don't have an account?
                <Link
                  to="/signup"
                  className="text-text-main font-bold hover:underline hover:text-primary ml-1 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
