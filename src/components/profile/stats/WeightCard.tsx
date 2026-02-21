interface WeightCardProps {
  latestWeightKg: number | null;
  weightChange: {
    value: string;
    isDecrease: boolean;
  } | null;
}

export default function WeightCard({
  latestWeightKg,
  weightChange,
}: WeightCardProps) {
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
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
          <p className="text-sm font-medium text-text-muted">Weight</p>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold">
          {latestWeightKg?.toFixed(1) || "—"}{" "}
          {latestWeightKg && (
            <span className="text-sm font-normal text-text-muted">kg</span>
          )}
        </p>
        {weightChange && (
          <div className="flex items-center gap-1 mt-1">
            <svg
              className={`w-3 h-3 ${weightChange.isDecrease ? "text-emerald-500" : "text-red-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d={
                  weightChange.isDecrease
                    ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                }
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`text-[10px] font-bold ${weightChange.isDecrease ? "text-emerald-500" : "text-red-500"}`}
            >
              {weightChange.value}% this week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
