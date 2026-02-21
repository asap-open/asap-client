import { getBMIStatus, getBMIPosition } from "../../../utils/profile";

interface BMICardProps {
  bmi: string | null;
}

export default function BMICard({ bmi }: BMICardProps) {
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <div className="bg-surface rounded-xl p-5 shadow-sm border border-border flex flex-col justify-between h-36">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm font-medium text-text-muted">BMI</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-end mb-2">
          <p className="text-2xl font-bold">{bmi || "—"}</p>
          {bmiStatus && (
            <span
              className={`text-[10px] font-bold ${bmiStatus.color} uppercase`}
            >
              {bmiStatus.text}
            </span>
          )}
        </div>
        {bmi && (
          <div className="w-full h-1.5 rounded-full bg-border relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(90deg, #fbbf24 0%, #13ecd6 50%, #ef4444 100%)",
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary rounded-full ring-2 ring-surface"
              style={{ left: `${getBMIPosition(parseFloat(bmi))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
