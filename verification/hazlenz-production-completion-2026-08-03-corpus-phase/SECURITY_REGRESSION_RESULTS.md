# Security regression

Authenticated entitlement regression passed with `DEV_AUTH_BYPASS=false`: free and expired users denied, active grant accepted, eight concurrent requests accepted, three sequential requests accepted, and cross-user isolation passed.

