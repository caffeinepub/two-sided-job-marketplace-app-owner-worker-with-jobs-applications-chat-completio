# Specification

## Summary
**Goal:** Add a clear, user-facing way to install the PWA for https://cantering-7xu.caffeine.xyz, with a reliable fallback instructions flow across supported platforms.

**Planned changes:**
- Add a visible “Install app” button on the unauthenticated Splash (landing) page alongside “Get Started”.
- Implement PWA install handling using the `beforeinstallprompt` flow to trigger the native install prompt when available (e.g., Chrome/Edge).
- Add an install instructions UI (modal/drawer/page) that appears when the native prompt isn’t available (e.g., iOS Safari), with step-by-step sections for Android (Chrome), iOS (Safari), and Desktop (Chrome/Edge).
- Include a displayed, copyable URL (`https://cantering-7xu.caffeine.xyz`) with a one-click copy action and confirmation.
- Ensure the install entry point is also reachable for authenticated users from an in-app navigation location (e.g., mobile menu or Profile page), without breaking existing navigation/auth flows, and working on mobile and desktop.

**User-visible outcome:** Users can tap “Install app” to install the PWA when supported, or view clear platform-specific instructions (with a copyable link) when the native install prompt isn’t available—both when logged out and logged in.
