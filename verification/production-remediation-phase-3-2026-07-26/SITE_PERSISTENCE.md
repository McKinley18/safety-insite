# Site persistence

Status: **not implemented; pilot blocker**.

`Site` exists and is organization-related, but `SitesModule` registers no controller or service. There is no active authenticated CRUD contract, archive policy, duplicate rule, pagination contract, or individual-user rule.

Implementing this safely requires the canonical membership/ownership decision. Creating a guessed organization-wide CRUD API would define A2 edit rights and individual-user behavior without evidence. No fake route or local fallback was added.
