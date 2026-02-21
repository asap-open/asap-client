import { formatDateOfBirth, formatGender } from "../../../utils/profile";

interface PhysicalAttributesProps {
  heightCm: number | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export default function PhysicalAttributes({
  heightCm,
  gender,
  dateOfBirth,
}: PhysicalAttributesProps) {
  return (
    <section className="px-6 mb-4">
      <div className="bg-surface rounded-xl p-5 shadow-sm border border-border">
        <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-4">
          Physical Attributes
        </p>
        <div className="grid grid-cols-3 divide-x divide-slate-200">
          <div className="flex flex-col items-center px-2">
            <span className="text-lg font-bold">
              {heightCm || "—"}{" "}
              {heightCm && (
                <span className="text-xs text-text-muted font-normal">cm</span>
              )}
            </span>
            <span className="text-[11px] text-text-muted mt-1">Height</span>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="text-lg font-bold">{formatGender(gender)}</span>
            <span className="text-[11px] text-text-muted mt-1">Gender</span>
          </div>
          <div className="flex flex-col items-center px-2 text-center">
            <span className="text-sm font-bold leading-tight">
              {formatDateOfBirth(dateOfBirth)}
            </span>
            <span className="text-[11px] text-text-muted mt-1">Birthdate</span>
          </div>
        </div>
      </div>
    </section>
  );
}
