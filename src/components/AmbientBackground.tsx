import type { Theme } from "../types";

interface Props {
  theme: Theme;
}

export function AmbientBackground({ theme }: Props) {
  const orb = theme === "light" ? "ambient-orb-light" : theme === "dark" ? "ambient-orb-dark" : "ambient-orb-violet";

  return (
    <div
      className={`ambient-canvas theme-${theme} pointer-events-none fixed inset-0 z-0 overflow-hidden`}
      aria-hidden="true"
    >
      <div className={`ambient-orb ambient-orb-1 ${orb}`} />
      <div className={`ambient-orb ambient-orb-2 ${orb}`} />
      <div className={`ambient-orb ambient-orb-3 ${orb}`} />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
    </div>
  );
}
