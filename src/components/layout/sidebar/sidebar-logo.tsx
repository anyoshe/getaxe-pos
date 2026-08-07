import { Logo } from "../logo";

export function SidebarLogo() {
  return (
    <div className="sticky top-0 border-b bg-white/90 backdrop-blur">
      <div className="p-5">
        <Logo />
      </div>
    </div>
  );
}