# Offline mode audit

The repository preserves draft/offline client behavior, but this pass did not complete an authentic disconnect/reconnect browser run. HazLenz analysis is backend-dependent; offline UI must mark analysis pending rather than claiming success. Synchronization, conflict, quota, expired-auth, and interrupted-upload behavior remain release gates.

