import * as React from "react"

type Density = "comfortable" | "compact"

interface DensityContextValue {
  density: Density
  setDensity: (density: Density) => void
}

const DENSITY_KEY = "dcims_density"
const DensityContext = React.createContext<DensityContextValue | undefined>(undefined)

function getInitialDensity(): Density {
  const stored = localStorage.getItem(DENSITY_KEY)
  return stored === "compact" ? "compact" : "comfortable"
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = React.useState<Density>(getInitialDensity)

  React.useEffect(() => {
    document.documentElement.classList.toggle("density-compact", density === "compact")
    localStorage.setItem(DENSITY_KEY, density)
  }, [density])

  const setDensity = React.useCallback((next: Density) => setDensityState(next), [])

  return <DensityContext.Provider value={{ density, setDensity }}>{children}</DensityContext.Provider>
}

export function useDensityContext() {
  const ctx = React.useContext(DensityContext)
  if (!ctx) throw new Error("useDensityContext must be used within DensityProvider")
  return ctx
}
