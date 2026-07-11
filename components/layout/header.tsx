import Link from "next/link"
import { Scan } from "lucide-react"
import ThemeToggle from "@/components/layout/theme-toggle"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
            <Scan className="h-4 w-4 text-blue-500" />
          </div>
          Scout AI
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
