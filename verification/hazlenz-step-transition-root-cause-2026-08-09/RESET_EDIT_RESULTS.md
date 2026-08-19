# Reset/edit behavior

Static ownership tracing confirmed that edit-report loading, `resetCurrentFinding`, and `editFinding` remain the only intentional Step 1 reset paths. The fix does not remove or bypass them. The canonical transition itself does not invoke a reset; the post-fix diagnostic reaches Step 2 and remains there after the render/effect cycle. A fresh inspection is created per scenario in the 20-run harness, so selected-inspection initialization is exercised repeatedly.

Additional full reset/edit browser permutations remain a follow-up test opportunity; no reset/edit production code was changed.
