# Hydration test results

| Mode | Context | Viewport | Theme preference | Reload | Hydration/page errors | Result |
|---|---|---:|---|---|---|---|
| Development | fresh Chromium | 390x844 | dark storage | no | none; HMR handshake only | PASS |
| Production | fresh Chromium | 390x844 | light browser / dark stored preference | no | none | PASS |
| Production | reloaded Chromium | 390x844 | dark browser / dark stored preference | yes | none | PASS |

Commands:

- `npx tsc --noEmit` (frontend): PASS.
- `npx eslint app/layout.tsx components/system/ThemeController.tsx` (frontend): PASS.
- `npm run build` (frontend, supported unsandboxed worker environment): PASS.

The deterministic root element is now hydrated without `suppressHydrationWarning`; theme changes occur after hydration through the existing controller.
