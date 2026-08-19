# Finalization governance

Partial review was tested on the second scenario after one finding had already been finalized. The UI/backend returned HTTP 200 for the inspection read but rejected transition with `Every current finding requires a completed human review before finalization.` The inspection remained `in_review`, version 2. After the remaining findings were individually reviewed, canonical completion succeeded and the inspection became `completed`, version 3.
