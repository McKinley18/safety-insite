# Login defect reproduction

In a clean Chromium context, the login page rendered and accepted field input, but normal submit did not produce a successful authenticated navigation to the disposable command center. Token injection was used only diagnostically and is not accepted as login evidence. The frontend bundle resolved `https://safescope-backend.onrender.com` from the existing `.env.local` configuration while the disposable backend ran at `127.0.0.1:4210`.
