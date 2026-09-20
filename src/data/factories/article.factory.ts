import { faker } from '@faker-js/faker';
import { ConduitArticleInput, Booking } from '../../api/types';

export function buildArticle(overrides: Partial<ConduitArticleInput> = {}): ConduitArticleInput {
  return {
    title: `${faker.hacker.verb()} ${faker.hacker.noun()} ${faker.string.alphanumeric(4)}`,
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    tagList: [faker.hacker.adjective(), faker.hacker.noun()],
    ...overrides,
  };
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 10 });
  const checkout = faker.date.soon({ days: 10, refDate: checkin });
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0],
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'None']),
    ...overrides,
  };
}
