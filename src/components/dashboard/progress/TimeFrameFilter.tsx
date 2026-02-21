const timeframes = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

interface TimeFrameFilterProps {
  selected: string;
  onSelect: (range: string) => void;
}

export default function TimeFrameFilter({
  selected,
  onSelect,
}: TimeFrameFilterProps) {
  return (
    <section className="py-2">
      <div className="flex items-center justify-between bg-surface p-1.5 rounded-full shadow-sm border border-border overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onSelect(tf)}
            className={`
                    flex-1 py-2 px-3 text-[10px] font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap
                    ${
                      selected === tf
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-muted hover:bg-surface-hover"
                    }
                `}
          >
            {tf}
          </button>
        ))}
      </div>
    </section>
  );
}
