import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import HeroBackground from "../components/ui/HeroBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { navigateBack } from "../utils/navigation";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post("/auth/signup", {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      login(data.token);
      navigate("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden font-display">
      <div className="absolute inset-0 w-full h-full">
        <HeroBackground />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row h-screen md:h-auto md:min-h-[700px] md:max-h-[850px] md:rounded-3xl md:overflow-hidden md:shadow-2xl">
        {/* Left Side ... (Keep as is) */}
        <div className="hidden md:flex flex-none basis-[35%] lg:basis-[40%] flex-col items-center justify-center bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl border-r border-white/40 p-8 text-center">
          <div className="flex flex-col items-center max-w-xs">
            <img
              src="/logo-2.webp"
              alt="ASAP Logo"
              className="w-28 h-28 md:w-34 md:h-34 mb-6"
            />

            <p className="text-text-muted text-lg font-medium">
              Start your transformation today. Track every rep, every set, and
              break your limits.
            </p>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col w-full h-full md:bg-surface/90 md:backdrop-blur-xl bg-surface/85 backdrop-blur-md overflow-y-auto">
          <div className="flex items-center p-6 pb-2 justify-start">
            <button
              onClick={() => navigateBack(navigate)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface text-text-main shadow-sm hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="px-6 pt-2 pb-6 md:px-12 md:pt-4">
            <h1 className="text-text-main text-[34px] font-bold leading-tight tracking-tight">
              Create Account
            </h1>
            <p className="text-text-muted text-base font-normal mt-2">
              Join the community and start your journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-6 md:px-12 mt-2"
          >
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="flex flex-col w-full">
                <p className="text-text-main text-sm font-semibold mb-2 ml-1">
                  Full Name
                </p>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-text-muted w-5 h-5 pointer-events-none" />
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border-none bg-surface h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-normal shadow-sm"
                    placeholder="John Doe"
                    type="text"
                    required
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="flex flex-col w-full">
                <p className="text-text-main text-sm font-semibold mb-2 ml-1">
                  Username
                </p>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-text-muted w-5 h-5 pointer-events-none" />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border-none bg-surface h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-normal shadow-sm"
                    placeholder="johndoe"
                    type="text"
                    required
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="flex flex-col w-full">
                <p className="text-text-main text-sm font-semibold mb-2 ml-1">
                  Email Address
                </p>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-text-muted w-5 h-5 pointer-events-none" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-none bg-surface h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-normal shadow-sm"
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="flex flex-col w-full">
                <p className="text-text-main text-sm font-semibold mb-2 ml-1">
                  Password
                </p>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-text-muted w-5 h-5 pointer-events-none" />
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border-none bg-surface h-14 pl-12 pr-12 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-normal shadow-sm"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-text-muted hover:text-text-main transition-colors cursor-pointer type-button"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>
            </div>

            <div>
              <label className="flex flex-col w-full">
                <p className="text-text-main text-sm font-semibold mb-2 ml-1">
                  Confirm Password
                </p>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-4 text-text-muted w-5 h-5 pointer-events-none" />
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border-none bg-surface h-14 pl-12 pr-12 text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-normal shadow-sm"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="pt-4 pb-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-slate-900 text-lg font-bold rounded-xl shadow-lg shadow-primary/40 flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-auto py-8 text-center pb-12">
            <p className="text-text-muted font-normal">
              Already have an account?
              <Link
                to="/login"
                className="text-text-main font-bold ml-1 hover:underline decoration-primary decoration-2 underline-offset-2"
              >
                Log In
              </Link>
            </p>
          </div>

          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none md:hidden"></div>
        </div>
      </div>
    </div>
  );
}
