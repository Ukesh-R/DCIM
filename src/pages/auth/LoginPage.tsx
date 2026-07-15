import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, ShieldCheck, UserRound } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth.schema"
import { demoCredentials } from "@/services/auth.service"

export function LoginPage() {
  const { login, isSubmitting } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login(values)
      toast({ title: `Welcome back, ${user.firstName}`, description: "You're signed in." })
      const from = (location.state as { from?: string })?.from
      navigate(from && from !== "/login" ? from : "/dashboard", { replace: true })
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Please check your credentials.",
        variant: "destructive",
      })
    }
  }

  const autofill = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", password, { shouldValidate: true })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-2xl font-bold tracking-tight">Sign in to your workspace</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your credentials to access the data center console.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@dcims.io" autoComplete="username" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full gap-2" loading={isSubmitting}>
          <LogIn className="size-4" />
          Sign in
        </Button>
      </form>

      <Card className="mt-6 border-dashed">
        <CardContent className="space-y-2 p-4">
          <p className="text-xs font-medium text-muted-foreground">Demo credentials</p>
          {demoCredentials.map((cred) => (
            <button
              key={cred.email}
              type="button"
              onClick={() => autofill(cred.email, cred.password)}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                {cred.role === "Admin" ? (
                  <ShieldCheck className="size-3.5 text-primary" />
                ) : (
                  <UserRound className="size-3.5 text-secondary" />
                )}
                <span className="font-medium">{cred.role}</span>
              </span>
              <span className="text-muted-foreground">{cred.email}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
