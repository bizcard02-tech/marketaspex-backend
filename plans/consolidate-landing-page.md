# Landing Page Consolidation Plan

## Current Structure Analysis

The landing page is currently spread across 4 files:

1. **`src/app/(marketing)/page.tsx`** (56 lines)
   - Main landing page content with hero section and feature cards

2. **`src/app/(marketing)/layout.tsx`** (16 lines)
   - Wrapper that includes navbar, main content, and footer

3. **`src/app/(marketing)/_components/navbar.tsx`** (26 lines)
   - Fixed navbar with logo, mode toggle, login/signup buttons

4. **`src/app/(marketing)/_components/footer.tsx`** (32 lines)
   - Fixed footer with logo, privacy/terms links, copyright

**Total: ~130 lines across 4 files**

## Proposed Consolidation Strategy

### Option 1: Single File Consolidation (Recommended)

**Target:** Consolidate everything into `src/app/(marketing)/page.tsx`

**Benefits:**

- Single source of truth for the landing page
- Easier to understand and maintain
- No need to navigate multiple files for simple changes
- Follows the principle of keeping things simple

**Actions:**

1. Merge navbar component directly into page.tsx
2. Merge footer component directly into page.tsx
3. Remove layout.tsx (page will handle its own structure)
4. Delete `_components/` folder (navbar.tsx, footer.tsx)

**Result:** One self-contained landing page file (~100-120 lines)

---

### Option 2: Two File Consolidation

**Target:** Keep layout.tsx, consolidate components into page.tsx

**Structure:**

- `src/app/(marketing)/layout.tsx` - Simple wrapper (minimal)
- `src/app/(marketing)/page.tsx` - Contains navbar, content, and footer

**Benefits:**

- Maintains Next.js layout pattern
- Still reduces from 4 to 2 files
- Layout can be reused if needed

**Actions:**

1. Merge navbar and footer into page.tsx
2. Keep layout.tsx as a minimal wrapper
3. Delete `_components/` folder

**Result:** Two files, reduced complexity

---

## Detailed Plan (Option 1 - Single File)

### Step 1: Create consolidated page.tsx

The new [`page.tsx`](<src/app/(marketing)/page.tsx>) will include:

```tsx
// Imports
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/ui/logo"
import { ModeToggle } from "@/components/mode-toggle"

// Navbar inline component
const Navbar = () => { ... }

// Footer inline component
const Footer = () => { ... }

// Main page component
export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero section */}
        {/* Feature cards */}
      </main>
      <Footer />
    </div>
  )
}
```

### Step 2: Delete unnecessary files

- Delete [`src/app/(marketing)/layout.tsx`](<src/app/(marketing)/layout.tsx>)
- Delete [`src/app/(marketing)/_components/navbar.tsx`](<src/app/(marketing)/_components/navbar.tsx>)
- Delete [`src/app/(marketing)/_components/footer.tsx`](<src/app/(marketing)/_components/footer.tsx>)
- Delete [`src/app/(marketing)/_components/`](<src/app/(marketing)/_components/>) folder (if empty)

### Step 3: Verify sign-in and sign-up pages

These pages should continue to work as they are:

- [`src/app/(marketing)/sign-in/page.tsx`](<src/app/(marketing)/sign-in/page.tsx>)
- [`src/app/(marketing)/sign-up/page.tsx`](<src/app/(marketing)/sign-up/page.tsx>)

They will inherit from the root layout instead of the marketing layout.

---

## Architecture Decision

### Why consolidate?

1. **Simplicity**: The landing page is a single, self-contained view
2. **No reuse**: Navbar and footer are only used on the landing page
3. **No complexity**: The components are simple and don't warrant separation
4. **Easier maintenance**: All landing page code in one place
5. **Faster development**: No file switching needed for changes

### What stays separate?

- Shared components (Button, Icons, etc.) in [`src/components/ui/`](src/components/ui/)
- Sign-in and sign-up pages (they may need different layouts)
- Auth forms (shared components)

---

## File Changes Summary

| Action | File                                                                                         | Reason                       |
| ------ | -------------------------------------------------------------------------------------------- | ---------------------------- |
| Modify | [`src/app/(marketing)/page.tsx`](<src/app/(marketing)/page.tsx>)                             | Add navbar and footer inline |
| Delete | [`src/app/(marketing)/layout.tsx`](<src/app/(marketing)/layout.tsx>)                         | No longer needed             |
| Delete | [`src/app/(marketing)/_components/navbar.tsx`](<src/app/(marketing)/_components/navbar.tsx>) | Consolidated into page       |
| Delete | [`src/app/(marketing)/_components/footer.tsx`](<src/app/(marketing)/_components/footer.tsx>) | Consolidated into page       |

---

## Testing Checklist

After consolidation, verify:

- [ ] Landing page renders correctly
- [ ] Navbar displays with logo, mode toggle, login/signup buttons
- [ ] Footer displays with links and copyright
- [ ] Sign-in page still works (uses root layout)
- [ ] Sign-up page still works (uses root layout)
- [ ] Mode toggle works
- [ ] Links navigate correctly
- [ ] Responsive design maintained

---

## Alternative Considerations

If the project grows and the navbar/footer need to be reused:

- Extract them back to separate components
- Create a shared layout for marketing pages
- This is easy to reverse if needed

Current state: **Consolidation provides immediate value with low risk.**
