import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import HowItWorks from "@/components/landing/how-it-works"
import ReportHistory from "@/components/report/report-history"
import Footer from "@/components/layout/footer"

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <ReportHistory />
      <Footer />
    </>
  )
}
