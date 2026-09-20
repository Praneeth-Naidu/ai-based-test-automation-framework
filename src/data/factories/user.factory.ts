import { faker } from '@faker-js/faker';
import { ConduitUser } from '../../api/types';

/**
 * Builds a unique, valid user for each test run.
 * Never hardcode a username/email in a spec — collisions across
 * parallel workers or CI runs are a classic source of flaky tests.
 */
export function buildUser(overrides: Partial<ConduitUser> = {}): ConduitUser {
  const unique = faker.string.alphanumeric(8).toLowerCase();
  return {
    username: `qa_${unique}`,
    email: `qa_${unique}@example-test.com`,
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
}
