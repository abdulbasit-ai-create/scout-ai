import { Search, Cpu, FileText } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Website Analysis",
    description:
      "Deep-dive analysis of any website's structure, content, and metadata to uncover what makes it tick.",
  },
  {
    icon: Cpu,
    title: "Technology Detection",
    description:
      "Identify frameworks, libraries, hosting providers, and analytics tools powering any website.",
  },
  {
    icon: FileText,
    title: "AI Intelligence Report",
    description:
      "Get a comprehensive, AI-generated report with actionable insights and strategic recommendations.",
  },
]

export default function Features() {
  return (
    <section className="border-t border-zinc-800/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-zinc-900/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]"
              >
                {/* Icon container */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors duration-300 group-hover:bg-blue-500/20">
                  <Icon className="h-6 w-6 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
