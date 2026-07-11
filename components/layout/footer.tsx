import { Scan } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
            <Scan className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Scout AI</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built with Next.js & TypeScript
        </p>
      </div>
    </footer>
  )
}
