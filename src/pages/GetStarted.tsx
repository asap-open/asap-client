import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroBackground from "../components/ui/HeroBackground";

// Component: Brand Title and Slogan
const BrandPresence = () => (
  <div className="flex flex-col items-center text-center px-8">
    <p className="text-slate-600 text-lg font-medium tracking-tight max-w-[240px]">
      Track your limits.
      <br />
      Break them.
    </p>
  </div>
);

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-full bg-background overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left Side: Hero Image */}
        {/* On Mobile: Absolute background. On Desktop: Relative left panel */}
        <div className="absolute inset-0 z-0 md:relative md:w-[60%] lg:w-[65%] md:z-0">
          <HeroBackground />
        </div>

        {/* Right Side: Content Area */}
        {/* On Mobile: Transparent overlay. On Desktop: White panel */}
        <div className="relative z-10 flex-1 flex flex-col justify-between h-full md:w-[40%] lg:w-[35%] md:bg-white md:shadow-2xl">
          {/* Main Content Wrapper - Centers content on desktop */}
          <div className="flex-1 flex flex-col justify-between md:justify-center md:gap-12 md:px-12 md:max-w-lg md:mx-auto w-full">
            {/* Top Content: Logo */}
            <div className="flex justify-center pt-12 mt-10 md:mt-0 md:pt-0">
              {/* import image as a logo */}
              <img
                src="/logo-2.webp"
                alt="ASAP Logo"
                className="w-28 h-28 md:w-34 md:h-34"
              />
            </div>

            {/* Middle Content: Brand */}
            <div>
              <BrandPresence />
            </div>

            {/* Bottom Content: Action Area */}
            <div className="flex flex-col gap-4 p-8 mb-4 md:p-0 md:mb-0">
              <button
                onClick={() => navigate("/signup")}
                className="w-full h-16 bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center rounded-xl shadow-xl shadow-primary/20 text-slate-900 text-lg font-extrabold tracking-wide cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2" strokeWidth={3} size={20} />
              </button>

              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center h-10 px-6 rounded-full text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <span>Already have an account? Log In</span>
                </button>
              </div>

              {/* iOS Home Indicator Spacing - Mobile Only */}
              <div className="h-2 md:hidden"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element - Mobile Only */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none md:hidden"></div>
    </div>
  );
}
