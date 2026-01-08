import Link from "next/link";

type Props = {
  right?: React.ReactNode;
};

// PUBLIC_INTERFACE
export default function AppHeader({ right }: Props) {
  /** Application top navigation bar (brand + optional right-side actions). */
  return (
    <header className="topbar">
      <div className="brand" aria-label="Ocean Tracker">
        <div className="brandMark" aria-hidden="true" />
        <div>
          <div>Ocean Tracker</div>
          <div className="small muted">Live location dashboard</div>
        </div>
      </div>

      <nav className="navActions" aria-label="Top navigation">
        <Link className="btn" href="/">
          Dashboard
        </Link>
        {right}
      </nav>
    </header>
  );
}
