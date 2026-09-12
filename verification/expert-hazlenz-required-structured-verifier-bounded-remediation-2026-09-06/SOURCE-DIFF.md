# §191 — SOURCE DIFF, v3 → v3.1

Generated from the live modules, not transcribed. Every line below is the actual text.

```
v3   prompt lines 145   sha256 678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88
v3.1 prompt lines 176   sha256 7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c
v3   schema           sha256 1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a
v3.1 schema           sha256 d39c86bc2755451fd27bdba34cba82c2bfee5b090134a40d1622e25d199bde65
lines added 31   lines removed 0   lines modified 0
```

## Prompt — insertion 1 of 2

Inserted into **step 2**, immediately after the "a control that cannot be seen" heuristic, at v3.1 line 39 (0-indexed). 15 lines.

```diff
+
+   AND THE BOUNDARY ON THAT ONE. A component you can SEE is not thereby a property you have
+   CHECKED. Seeing a guard in position tells you it is in position; it does not tell you its
+   fastenings are tight. Evidence about a component being PRESENT, about an INSPECTION HAVING
+   HAPPENED, about a check made AT SOME EARLIER TIME, about SURROUNDING CONDITIONS, or about
+   GENERAL adequacy or function, does not settle a DIFFERENT owed property unless the evidence
+   you were actually given establishes that property. Name the property the owed fact is about,
+   name what each piece of evidence establishes, and if those are not the same thing then the
+   fact is still open however reassuring the evidence is.
+
+   An inspection settles only what that inspection is stated to cover, and no more. A check made
+   at some earlier time tells you about then, not about now, whenever the fact is about the
+   current state. A control on ONE energy source, guard or system tells you nothing about a
+   SEPARATE one. And nothing being wrong that anyone wrote down is not the same as the property
+   having been established.
```

## Prompt — insertion 2 of 2

Inserted at the **end of step 3**, after its existing sufficiency test, at v3.1 line 59 (0-indexed). 16 lines.

```diff
+
+   AND CHECK IT PIECE BY PIECE. An owed fact often requires MORE THAN ONE THING to be true at
+   once: a thing done AND proved, a thing done AFTER one event and BEFORE another, a state
+   reached AND confirmed. Read the fact you were given, and list every separate thing it
+   requires. Then take the question AS WRITTEN and ask, for EACH of those things on its own,
+   whether an answer would establish it. The question is sufficient only if an answer would
+   establish EVERY one of them. If it would establish some and leave the others open, it is NOT
+   sufficient, however exactly it names the topic.
+
+   Watch the word "or". A question offering alternatives is answered by whichever is easiest to
+   say yes to, so read it as satisfied by its WEAKEST branch, and ask whether that branch alone
+   would establish the owed property.
+
+   Judge this from the fact you were handed and the two answers it states -- not from what a term
+   usually implies in the trade. If the fact requires two things, and someone who did only one of
+   them could answer the question truthfully, the question does not reach the fact.
```

## Schema — three description repairs

### `bindingFactKey`

Path: `properties.bindingFactKey`  ·  Evidence: §188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 (mechanical)

**Defect.** AGENT_NEUTRAL_AND_VERDICT_INDEPENDENT — "this question" named neither the agent nor the verdict, so under VERIFIED_AS_IS it reads as the first pass's question, which does answer the supplied fact. The description licensed the refused output.

```diff
- The factKey of the supplied unresolved fact this question answers, copied EXACTLY. Must be one
- of the supplied keys. Null when the question answers no supplied fact.
+ The factKey of the supplied unresolved fact answered by THE CLARIFICATION YOU ARE PROPOSING IN
+ THIS RESPONSE, copied EXACTLY. Must be one of the supplied keys. Null unless verdict is
+ ADD_OR_REPLACE_CLARIFICATION — a question the FIRST PASS already asked is not a binding, and no
+ other verdict may name a key here.
```

### `clarificationSourceMode`

Path: `properties.clarificationSourceMode`  ·  Evidence: §188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 (mechanical)

**Defect.** SELF_CONTRADICTORY — "null otherwise" and "must agree with the payload" give opposite answers the moment bindingFactKey is non-null under a non-ADD verdict. Both refused §187B outputs resolved the contradiction toward the second sentence and emitted SUPPLIED_FACT. This is a defect in the artifact, independent of any model behaviour.

```diff
- Required on ADD_OR_REPLACE_CLARIFICATION, null otherwise. Must agree with which of
- bindingFactKey and nominatedFact are present.
+ Null unless verdict is ADD_OR_REPLACE_CLARIFICATION. When the verdict IS
+ ADD_OR_REPLACE_CLARIFICATION this field is required, and it must then agree with which of
+ bindingFactKey and nominatedFact are present. These are not two competing rules: the verdict
+ decides whether the field is populated at all, and only then does the payload decide which
+ member.
```

### `owedFactDeclarations[].declaration`

Path: `properties.owedFactDeclarations.items.properties.declaration`  ·  Evidence: §188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 and §3 (mechanical)

**Defect.** NO_DESCRIPTION_AT_ALL — the enum token BOUND_BY_CLARIFICATION reached the model bare, stripped of the system prompt's "the question YOU are supplying" scoping, while the sibling challengeReason field carried a description. This is also where §188's missing vocabulary member is addressed WITHOUT adding one: the description names the existing token that records "the first pass already asked it".

```diff
- (no description field existed)
+ BOUND_BY_CLARIFICATION means the clarification YOU are proposing in THIS response answers this
+ fact. It is legal only when verdict is ADD_OR_REPLACE_CLARIFICATION, and its key must be the one
+ in bindingFactKey. IF THE FIRST PASS ALREADY ASKED A QUESTION THAT REACHES THIS FACT, THAT IS
+ NOT A BINDING — record STILL_UNRESOLVED, because the fact stays owed until someone actually
+ answers it. STILL_UNRESOLVED is the right answer whenever you are not supplying the question
+ yourself. CHALLENGE_FACT_VALIDITY is a request for human review and settles nothing.
```

## Nothing else moved

- **0 lines removed, 0 lines modified** in the prompt — insertion only.
- With `description` keys stripped, the v3.1 schema serialises **identically** to v3.
- No field, enum member, source mode, declaration token, `required` entry or
  `additionalProperties` setting was added, removed or changed.
- The admission validator (`expert-verifier-contract-v3.ts`) is byte-unchanged and v3.1
  reuses it as-is.
- The user-prompt builder, the declaration vocabulary and the source modes are re-exported
  from v3 unchanged, so a v3.1 caller never reaches back into v3 by accident.

