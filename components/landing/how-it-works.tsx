import { Link, Scan, FileText } from "lucide-react"

const steps = [
  {
    icon: Link,
    title: "Paste URL",
    description:
      "Drop any website URL into Scout AI and let the analysis begin.",
    step: "01",
  },
  {
    icon: Scan,
    title: "Scout analyzes",
    description:
      "Our AI scans the site's structure, tech stack, and content in real time.",
    step: "02",
  },
  {
    icon: FileText,
    title: "AI generates report",
    description:
      "Receive a detailed intelligence report with insights and recommendations.",
    step: "03",
  },
]

export default function HowItWorks() {
  return (
    <section className="border-t border-zinc-800/50 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-foreground">
          How It Works
        </h2>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector line between steps */}
                {i < steps.length - 1 && (
                  <div className="absolute right-[-1.25rem] top-8 hidden h-px w-[2.5rem] bg-gradient-to-r from-zinc-700 to-zinc-700 md:block" />
                )}

                {/* Step circle */}
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/50 backdrop-blur-sm transition-colors duration-300 hover:border-blue-500/50">
                  <Icon className="h-6 w-6 text-blue-500" />
                </div>

                <span className="mb-2 text-sm font-medium text-blue-500">
                  {step.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
