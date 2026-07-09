import { ArrowRight, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-36 pb-28 text-center">
      {/* Radial glow at top */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent" />

      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8">
        {/* Logo pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-sm backdrop-blur-md">
          <Scan className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-zinc-200">Scout AI</span>
        </div>

        {/* Gradient heading */}
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          <span className="text-white">Website</span>
          <br />
          <span className="text-white">Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
          Analyze any website and receive an AI-generated intelligence report in
          seconds.
        </p>

        {/* Input + CTA row */}
        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <Input
            type="url"
            placeholder="Enter website URL..."
            className="h-12 flex-1 border-zinc-800 bg-zinc-900/80 px-4 text-base backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
          />
          <Button className="h-12 gap-2 bg-blue-600 px-8 text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.97]">
            Analyze Website
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
