import React from "react";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen min-w-full bg-background max-h-screen">
      <nav className="flex justify-between items-center border-b border-border h-[60px] px-4 py-2">
        <Logo />
        <ThemeSwitcher />
      </nav>
    </div>
  );
}
