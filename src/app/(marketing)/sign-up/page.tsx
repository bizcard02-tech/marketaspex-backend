"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import zxcvbn from "zxcvbn"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Icons } from "@/components/icons"

// ============================================================================
// TYPES
// ============================================================================

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// ============================================================================
// SIGN-UP PAGE
// ============================================================================

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, isLoading } = useAuthContext()

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
  } = useForm<SignUpFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
      const { confirmPassword, ...signUpData } = data
      await signUp(signUpData.name, signUpData.email, signUpData.password)
      toast.success("Account created successfully!", {
        description: "Redirecting to your dashboard...",
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create account"
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
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started with {siteConfig.name} for free
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Full Name <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              className={cn(
                "h-11 px-4",
                errors.name &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name must be less than 50 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

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

          {/* Password Field with zxcvbn */}
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
              autoComplete="new-password"
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
                validate: (value) => {
                  const result = zxcvbn(value)
                  if (result.score < 3) {
                    return (
                      result.feedback.warning ||
                      result.feedback.suggestions[0] ||
                      "Password is too weak"
                    )
                  }
                  return true
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              className={cn(
                "h-11 px-4",
                errors.confirmPassword &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms & Privacy */}
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-primary hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </p>

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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
