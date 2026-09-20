import { test, expect } from '../../src/fixtures/api.fixture';
import { buildBooking } from '../../src/data/factories/article.factory';

test.describe('restful-booker — booking CRUD', () => {
  test('a created booking can be fetched back with the same data', async ({ bookerApi }) => {
    const booking = buildBooking();
    const created = await bookerApi.createBooking(booking);

    const fetched = await bookerApi.getBooking(created.bookingid);
    expect(fetched.firstname).toBe(booking.firstname);
    expect(fetched.totalprice).toBe(booking.totalprice);
  });

  test('a deleted booking returns 404 on subsequent GET', async ({ bookerApi }) => {
    const created = await bookerApi.createBooking(buildBooking());
    const deleteRes = await bookerApi.deleteBooking(created.bookingid);
    expect(deleteRes.status()).toBe(201); // restful-booker returns 201 on delete, not 204

    const getRes = await bookerApi.getBooking(created.bookingid).catch(() => null);
    expect(getRes).toBeNull(); // getBooking() throws via expect(res.ok()) on 404
  });

  test('BR-001: partial PATCH update silently accepts an unchanged field @known-bug', async ({
    bookerApi,
  }) => {
    // See bug-reports/BR-001-booker-partial-update.md for full repro and evidence.
    // Documenting a known defect as a test (rather than deleting/skipping it)
    // keeps the suite honest about what's actually verified vs. flaky-by-design.
    const created = await bookerApi.createBooking(buildBooking({ totalprice: 100 }));

    const patchRes = await bookerApi.updateBooking(created.bookingid, { totalprice: -50 });

    // Expected: API should reject a negative price with 4xx.
    // Actual (documented bug): API accepts it with 200.
    expect(patchRes.status()).toBe(200); // asserts the current (buggy) behavior
    const body = await patchRes.json();
    expect(body.totalprice).toBe(-50);
  });
});
