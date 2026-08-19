# Corpus results

The unchanged 40-case corpus hash is `7c3de54ed71ba56bc104cc30580638c8405ff898d8263948c64c9bf9f69f79c2`.

The prior quality runner demonstrated the production endpoint's 30/minute throttle. A new bounded runner with retries was used, but the disposable backend process exited during the long run before producing a complete 40-case artifact. Therefore transport completion is **NOT PROVEN**, and no cross-family corpus rate is claimed as passing.
