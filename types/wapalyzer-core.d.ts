declare module "wapalyzer-core" {
  interface Technology {
    name: string
    description?: string
    icon?: string
    website?: string
    cpe?: string
    saas?: boolean
    oss?: boolean
    pricing?: string[]
    implies?: string[]
    categories?: { id: number; name: string; slug: string }[]
  }

  interface Detection {
    technology?: Technology
    version?: string
    pattern?: any
  }

  interface AnalyzeInput {
    url: string
    html: string
    headers: Record<string, string[]>
    meta: Record<string, string[]>
    scripts: string[]
    scriptSrc: string[]
    cookies: Record<string, string[]>
    css: string[]
    dns: Record<string, string[]>
    probe: Record<string, string[]>
    certIssuer: string
    robots: string
    text: string
    url: string
    xhr: string
  }

  export const Wappalyzer: {
    setTechnologies(data: any): void
    setCategories(data: any): void
    analyze(input: AnalyzeInput): Detection[]
  }
  export const technologies: any
  export const categories: any
}
