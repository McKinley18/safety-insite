# Offline architecture

Offline inspection state is implemented with localStorage-backed inspection, finding, photo, report-draft, and synchronization-queue records. No service worker or IndexedDB implementation was found. A full reconnect worker/conflict processor was not demonstrated.
