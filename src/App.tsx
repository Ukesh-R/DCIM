import { BrowserRouter } from "react-router-dom"

import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { DensityProvider } from "@/contexts/DensityContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ConfirmDialogProvider } from "@/hooks/useConfirm"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppRouter } from "@/routes/AppRouter"

function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider delayDuration={200}>
                <ConfirmDialogProvider>
                  <AppRouter />
                </ConfirmDialogProvider>
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </DensityProvider>
    </ThemeProvider>
  )
}

export default App
