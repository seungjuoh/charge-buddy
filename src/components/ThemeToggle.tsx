import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full
            hover:bg-blue-500 hover:text-white
            dark:hover:bg-green-500 dark:hover:text-white"
          aria-label="테마 설정"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-popover">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`
            hover:bg-blue-500 hover:text-white
            dark:hover:bg-green-500 dark:hover:text-white
            ${theme === "light" ? "bg-blue-500 text-white dark:bg-blue-500" : ""}
          `}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`
            hover:bg-blue-500 hover:text-white
            dark:hover:bg-green-500 dark:hover:text-white
            ${theme === "dark" ? "bg-green-500 text-white dark:bg-green-500" : ""}
          `}
        >
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};