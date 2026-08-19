# Login root-cause status

The confirmed local blocker was twofold: the client API base is compiled from the existing `.env.local` remote host, and the disposable browser origin was `http://127.0.0.1:3001` while non-production CORS allowed only `http://localhost:3001`. The narrow fix adds explicit loopback origins to the non-production allowlist; production exact-origin validation is unchanged. A clean production frontend build then received HTTP 201 from `/auth/login` and navigated to `/command-center`.
