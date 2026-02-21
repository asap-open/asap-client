import { formatMemberSince } from "../../../utils/profile";

interface ProfileHeaderProps {
  fullName: string | null;
  username: string;
  createdAt: string;
  onEditClick: () => void;
}

export default function ProfileHeader({
  fullName,
  username,
  createdAt,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <section className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
      <h2 className="text-3xl font-bold tracking-tight text-text-main">
        {fullName || username}
      </h2>
      <p className="text-text-muted text-sm mt-2 font-medium">
        Member since {formatMemberSince(createdAt)}
      </p>
      <button
        onClick={onEditClick}
        className="mt-4 text-primary font-semibold text-xs uppercase tracking-wider py-2 px-6 border border-primary/20 rounded-full bg-primary/5 active:scale-95 transition-transform"
      >
        Edit Profile
      </button>
    </section>
  );
}
