"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { useSignIn } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

// ============================================================================
// TYPES
// ============================================================================

interface SignInFormData {
  email: string
  password: string
}

// ============================================================================
// SIGN-IN PAGE
// ============================================================================

export default function SignInPage() {
  const router = useRouter()
  const signInMutation = useSignIn()

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      await signInMutation.mutateAsync(data)
      toast.success("Welcome back!")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in"
      toast.error(message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container flex max-w-md flex-col items-center gap-8 p-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <Icons.logo className="h-12 w-12" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your {siteConfig.name} account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              className={cn(
                "h-11 px-4",
                errors.email &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              className={cn(
                "h-11 px-4",
                errors.password &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                aria-label="Remember me"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
