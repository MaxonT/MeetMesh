Before writing any code:
1. Restate the problem in one sentence.
2. List explicit inputs and outputs.
3. Define success criteria (how do we know it works).
4. List non-goals (what we intentionally ignore).
5. Ask me questions ONLY if something blocks correctness.


Review this code/system and identify:
1. Hidden coupling
2. State mutation risks
3. Edge cases likely to break first
4. Parts that will be painful to debug later
5. One change that would most likely cause cascading failure
Do NOT suggest improvements yet.

Audit the above solution:
1. Which assumptions are unstated?
2. Which parts rely on conventions rather than guarantees?
3. Where could this silently fail?
4. What tests would most quickly falsify it?
Do not rewrite the solution.

Evaluate this abstraction:
1. What complexity does it remove?
2. What complexity does it add?
3. Does it reduce cognitive load or just rename things?
4. Would debugging become easier or harder?
Answer brutally.

Help me construct the smallest possible reproduction:
1. Minimal input
2. Minimal code path
3. Expected vs actual behavior
4. Hypothesis of failure point
Do not fix yet.

Before refactoring, answer:
1. What pain does current code cause now?
2. What pain is hypothetical?
3. Cost of not refactoring for 1 month
4. Risk of refactoring going wrong
5. Clear win condition
Advise whether to proceed.

Define system boundaries:
1. What this module is responsible for
2. What it must never know
3. Inputs it accepts
4. Outputs it guarantees
5. What can change without breaking it

