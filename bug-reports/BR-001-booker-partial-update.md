# BR-001 — PATCH /booking/{id} accepts a negative `totalprice`

**Status:** Open (documented, not filed upstream — public demo API)
**Severity:** Medium
**Found via:** `tests/api/booker-booking.spec.ts` → `BR-001: partial PATCH update...`

## Summary
`PATCH /booking/{id}` accepts a `totalprice` of `-50` and returns `200 OK`
with the negative value persisted, instead of rejecting it with a `4xx`.

## Steps to reproduce
1. `POST /booking` with a valid booking (`totalprice: 100`).
2. Authenticate via `POST /auth` to get a token.
3. `PATCH /booking/{id}` with `{ "totalprice": -50 }` and the auth cookie.
4. `GET /booking/{id}`.

## Expected
Step 3 returns `400 Bad Request` (or similar), and the booking's price is
unchanged.

## Actual
Step 3 returns `200 OK`. Step 4 confirms `totalprice` is now `-50`.

## Evidence
Automated in `tests/api/booker-booking.spec.ts`, tagged `@known-bug`. The
test currently asserts the *buggy* behavior on purpose — this is a documented
defect, not a flaky/incorrect test. If restful-booker ever fixes this, the
test will start failing, which is the signal to update it.

## Impact
Low in isolation (demo API), but representative of a class of bug worth
catching in real systems: numeric fields accepted by `PATCH` without the
same validation applied on `POST`/`PUT`.

## Suggested fix
Apply the same validation rules to `PATCH` as to `POST`: reject
`totalprice < 0`.
