"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { TooltipIconButton } from "@/components/tooltip-icon-button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <TooltipIconButton
      tooltip={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
      side="bottom"
      variant="outline"
      size="icon"
      className="aui-theme-toggle size-8 rounded-lg"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="aui-theme-toggle-light dark:hidden" />
      <MoonIcon className="aui-theme-toggle-dark hidden dark:block" />
    </TooltipIconButton>
  );
}
