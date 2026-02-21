import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="py-2">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          className="block w-full pl-11 pr-4 py-3 bg-surface border-none rounded-xl text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm text-text-main"
          placeholder="Search exercises..."
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
