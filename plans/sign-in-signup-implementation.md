# Sign-In & Sign-Up Pages Implementation Plan

## Overview

Production-ready authentication pages using react-hook-form, following AGENTS.md architecture principles.

## Architecture Principles Applied

### From AGENTS.md:

1. **Performance-First**: 60FPS rendering, minimal client JS
2. **Non-Blocking Error Handling**: Optimistic updates with rollback
3. **Permission-Ready**: Design with auth guards in mind
4. **Server-First**: Minimal client components, server-rendered where possible
5. **Clean UI**: Intentional, fluid, precise interactions

## Implementation Strategy

### Phase 1: Dependencies & Infrastructure

#### 1.1 Install Required Packages

```bash
npm install react-hook-form @hookform/resolvers
```

**Rationale**:

- `react-hook-form`: Industry standard for form management, minimal re-renders
- `@hookform/resolvers`: Zod integration for type-safe validation

#### 1.2 Authentication API Client

**File**: `src/lib/api-client.ts` (extend existing)

Add authentication endpoints:

- `POST /api/auth/sign-in` - Returns JWT token
- `POST /api/auth/sign-up` - Creates user, returns JWT token
- `POST /api/auth/sign-out` - Clears token
- `GET /api/auth/me` - Get current user profile

**Type Definitions**:

```typescript
interface SignInInput {
  email: string
  password: string
}

interface SignUpInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
  }
  token: string
}

interface AuthError {
  message: string
  code?: string
}
```

**React Query Hooks**:

```typescript
export function useSignIn() {
  return useMutation({
    mutationFn: (data: SignInInput) => authApi.signIn(data),
    onSuccess: (data) => {
      // Store JWT in httpOnly cookie or localStorage
      // Invalidate auth queries
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpInput) => authApi.signUp(data),
    onSuccess: (data) => {
      // Store JWT
      // Redirect to dashboard
    },
  })
}
```

### Phase 2: Validation Schemas (Zod)

#### 2.1 Sign-In Schema

**File**: `src/lib/validations/auth.ts`

```typescript
import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export type SignInInput = z.infer<typeof signInSchema>
```

#### 2.2 Sign-Up Schema

```typescript
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignUpInput = z.infer<typeof signUpSchema>
```

### Phase 3: Form Components

#### 3.1 Optimized FormInput Component

**File**: `src/components/forms/auth-form-input.tsx`

**Design Principles**:

- Minimal re-renders (memoize where needed)
- Accessible (ARIA labels, keyboard navigation)
- Performance-optimized (no heavy computations during render)
- Clean visual hierarchy

```typescript
"use client"

import { forwardRef, useId } from "react"
import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormErrors } from "./form-errors"

interface AuthFormInputProps {
  name: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  className?: string
}

export const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({ name, label, type = "text", placeholder, required, autoComplete, className }, ref) => {
    const id = useId()
    const {
      register,
      formState: { errors, isSubmitting },
    } = useFormContext()

    const error = errors[name]

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={id}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={isSubmitting}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 px-4",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...register(name)}
          ref={ref}
        />
        {error && (
          <FormErrors
            id={id}
            errors={{ [name]: [error.message as string] }}
          />
        )}
      </div>
    )
  }
)

AuthFormInput.displayName = "AuthFormInput"
```

#### 3.2 FormButton Component with Loading State

**File**: `src/components/forms/auth-form-button.tsx`

```typescript
"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AuthFormButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
}

export function AuthFormButton({
  children,
  className,
  variant = "default",
}: AuthFormButtonProps) {
  const { formState: { isSubmitting } } = useFormContext()

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      variant={variant}
      className={cn("h-11 w-full", className)}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
```

### Phase 4: Sign-In Page Implementation

#### 4.1 Sign-In Form Component

**File**: `src/components/auth/sign-in-form.tsx`

**Architecture Decisions**:

- Client component for form handling
- Optimistic UI updates
- Non-blocking error handling
- Minimal re-renders

```typescript
"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"
import { useSignIn } from "@/lib/api-client"
import { AuthFormInput } from "@/components/forms/auth-form-input"
import { AuthFormButton } from "@/components/forms/auth-form-button"

export function SignInForm() {
  const router = useRouter()
  const signInMutation = useSignIn()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  })

  const onSubmit = async (data: SignInInput) => {
    try {
      await signInMutation.mutateAsync(data)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      // Non-blocking error handling
      const message = error instanceof Error ? error.message : "Failed to sign in"
      toast.error(message)
      // Don't reset form - let user try again
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AuthFormInput
        name="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        required
        autoComplete="email"
      />

      <AuthFormInput
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300"
          />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <a
          href="/forgot-password"
          className="text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <AuthFormButton>
        Sign In
      </AuthFormButton>
    </form>
  )
}
```

#### 4.2 Sign-In Page

**File**: `src/app/(marketing)/sign-in/page.tsx`

**Design Principles**:

- Server component wrapper
- Clean, intentional layout
- Minimal visual hierarchy
- Performance-optimized

```typescript
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { SignInForm } from "@/components/auth/sign-in-form"

export default function SignInPage() {
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
        <div className="w-full">
          <SignInForm />
        </div>

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
```

### Phase 5: Sign-Up Page Implementation

#### 5.1 Sign-Up Form Component

**File**: `src/components/auth/sign-up-form.tsx`

```typescript
"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth"
import { useSignUp } from "@/lib/api-client"
import { AuthFormInput } from "@/components/forms/auth-form-input"
import { AuthFormButton } from "@/components/forms/auth-form-button"

export function SignUpForm() {
  const router = useRouter()
  const signUpMutation = useSignUp()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async (data: SignUpInput) => {
    try {
      await signUpMutation.mutateAsync(data)
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account"
      toast.error(message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <AuthFormInput
        name="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        required
        autoComplete="name"
      />

      <AuthFormInput
        name="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        required
        autoComplete="email"
      />

      <AuthFormInput
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <AuthFormInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <p className="text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>

      <AuthFormButton>
        Create Account
      </AuthFormButton>
    </form>
  )
}
```

#### 5.2 Sign-Up Page

**File**: `src/app/(marketing)/sign-up/page.tsx`

```typescript
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
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
        <div className="w-full">
          <SignUpForm />
        </div>

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
```

### Phase 6: Error Handling & UX Enhancements

#### 6.1 Password Strength Indicator (Optional Enhancement)

**File**: `src/components/forms/password-strength.tsx`

```typescript
"use client"

import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"

export function PasswordStrength() {
  const { watch } = useFormContext()
  const password = watch("password", "")

  const strength = calculatePasswordStrength(password)

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength
                ? strengthColors[strength]
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {strengthMessages[strength]}
      </p>
    </div>
  )
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  return strength
}

const strengthColors = {
  0: "",
  1: "bg-destructive",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-500",
}

const strengthMessages = {
  0: "",
  1: "Weak password",
  2: "Fair password",
  3: "Good password",
  4: "Strong password",
}
```

#### 6.2 Form Field Error Display Enhancement

Update `src/components/forms/form-errors.tsx` to support react-hook-form errors:

```typescript
"use client"

import { FieldErrors } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Icons } from "../icons"

interface FormErrorsProps {
  errors: FieldErrors
  name: string
  className?: string
}

export function FormErrors({ errors, name, className }: FormErrorsProps) {
  const error = errors[name]

  if (!error || !error.message) return null

  return (
    <div
      className={cn("text-xs text-destructive mt-1", className)}
      role="alert"
    >
      <div className="flex items-center gap-1">
        <Icons.xCircle className="h-3 w-3" />
        <span>{error.message as string}</span>
      </div>
    </div>
  )
}
```

### Phase 7: Performance Optimizations

#### 7.1 Code Splitting

- Lazy load form components
- Use dynamic imports for heavy dependencies

#### 7.2 Bundle Size Optimization

- Tree-shake unused react-hook-form features
- Minimize re-renders with React.memo where appropriate

#### 7.3 Accessibility

- ARIA labels for all form fields
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Phase 8: Testing Strategy

#### 8.1 Unit Tests

- Form validation logic
- Error handling
- API integration

#### 8.2 Integration Tests

- Form submission flow
- Error recovery
- Redirect behavior

#### 8.3 E2E Tests

- Complete sign-in flow
- Complete sign-up flow
- Error scenarios

## Implementation Checklist

- [ ] Install react-hook-form and @hookform/resolvers
- [ ] Create authentication API client hooks
- [ ] Create Zod validation schemas
- [ ] Create AuthFormInput component
- [ ] Create AuthFormButton component
- [ ] Implement SignInForm component
- [ ] Implement SignUpForm component
- [ ] Update sign-in page
- [ ] Update sign-up page
- [ ] Add loading states
- [ ] Add error handling (non-blocking)
- [ ] Add form validation feedback
- [ ] Test accessibility
- [ ] Verify 60FPS performance
- [ ] Test error scenarios

## Architecture Compliance

### AGENTS.md Principles:

✅ **Performance**: Minimal re-renders, optimized form handling
✅ **Non-Blocking Errors**: Toast notifications, form doesn't freeze
✅ **Permission-Ready**: Auth guards ready for implementation
✅ **Server-First**: Pages are server components, forms are minimal client components
✅ **Clean UI**: Intentional design, minimal visual hierarchy
✅ **Accessibility**: ARIA labels, keyboard navigation
✅ **60FPS**: Optimized rendering, no layout thrashing

## Success Criteria

1. Forms validate correctly with real-time feedback
2. Loading states are smooth and non-blocking
3. Error messages are clear and user-friendly
4. Forms are fully accessible (WCAG 2.1 AA)
5. Performance maintains 60FPS during interactions
6. Code is production-ready and maintainable
7. Forms integrate seamlessly with JWT authentication backend
