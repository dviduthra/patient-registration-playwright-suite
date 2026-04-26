import { test, expect } from '@playwright/test'
import { RegistrationPage } from '../pages/registrationPage'
import { ORGANIZATIONS, getDobForAge } from '../utils/dataGenerator'
import { faker } from '@faker-js/faker';

// Data-driven tests use static scenario tables to cover multiple
// input combinations in a structured, repeatable way

const validPatients = [
  {
    scenario: 'valid patient with Mr title',
    details: {
      organization: ORGANIZATIONS[0],
      title: 'Mr.',
      firstName: 'James',
      lastName: 'Anderson',
      email: `sherlock.holmes.${faker.string.numeric(4)}@mailinator.com`,
      phone: '07911000001',
    },
    password: {
      sexAtBirth: 'Male' as const,
      day: '15',
      month: 'Jan',
      year: '1990',
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    },
  },
  {
    scenario: 'valid patient with Dr title and Female sex at birth',
    details: {
      organization: ORGANIZATIONS[2],
      title: 'Dr.',
      firstName: 'Sarah',
      lastName: 'Clarke',
      email: `sarah.clarke.${faker.string.numeric(4)}@mailinator.com`,
      phone: '07911000002',
    },
    password: {
      sexAtBirth: 'Female' as const,
      day: '20',
      month: 'Mar',
      year: '1985',
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    },
  },
  {
    scenario: 'valid patient without title (optional)',
    details: {
      organization: ORGANIZATIONS[3],
      firstName: 'Emily',
      lastName: 'Brown',
      email: `emily.brown.${faker.string.numeric(4)}@mailinator.com`,
      phone: '07911000003',
    },
    password: {
      sexAtBirth: 'Other' as const,
      day: '05',
      month: 'Jun',
      year: '1995',
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    },
  },
  {
    scenario: 'valid patient with Prefer not to say sex at birth',
    details: {
      organization: ORGANIZATIONS[1],
      title: 'Mrs.',
      firstName: 'Anna',
      lastName: 'Smith',
      email: `anna.smith.${faker.string.numeric(4)}@mailinator.com`,
      phone: '07911000004',
    },
    password: {
      sexAtBirth: 'Prefer not to say' as const,
      day: '10',
      month: 'Aug',
      year: '1988',
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    },
  },
  {
    scenario: 'valid patient with different organization',
    details: {
      organization: ORGANIZATIONS[4],
      title: 'Ms.',
      firstName: 'Lucy',
      lastName: 'Johnson',
      email: `lucy.johnson.${faker.string.numeric(4)}@mailinator.com`,
      phone: '07911000005',
    },
    password: {
      sexAtBirth: 'Female' as const,
      day: '01',
      month: 'Dec',
      year: '1992',
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    },
  },
];

const specialNamePatients: { 
  scenario: string
  firstName: string
  lastName: string
  emailName?: string 
}[] = [
  { scenario: 'hyphenated last name',    firstName: 'Mary',        lastName: 'Smith-Jones' },
  { scenario: 'apostrophe in last name', firstName: 'John',        lastName: "O'Brien" },
  { scenario: 'accented first name',     firstName: 'José',        lastName: 'Garcia', emailName: 'jose' },
  { scenario: 'long first name',         firstName: 'Bartholomew', lastName: 'Williams' },
]

test.describe('Patient Registration - Data Driven', () => {

  let regPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    regPage = new RegistrationPage(page)
    await regPage.navigate();
    await regPage.signUpButton.click()
  });

  //// VALID PATIENT SCENARIOS ───────────────────────────────────────────────

  for (const { scenario, details, password } of validPatients) {
    test(`Full registration — ${scenario}`, async ({ page }) => {
      await regPage.fillYourDetails(details);
      await regPage.clickNext()

      await expect(page).toHaveURL(/\/password/)

      await regPage.fillSetYourPassword(password)
      await regPage.clickCreateAccount()

      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    })
  }

  //// SPECIAL CHARACTER NAMES ───────────────────────────────────────────────

  for (const { scenario, firstName, lastName, emailName } of specialNamePatients) {
    test(`Your details accepts ${scenario}`, async ({ page }) => {
      await regPage.fillYourDetails({
        organization: ORGANIZATIONS[0],
        firstName,
        lastName,
        email: `${(emailName || firstName).toLowerCase()}.test${faker.string.numeric(4)}@mailinator.com`,
        phone: '07911000099',
      });
      await regPage.clickNext();

      await expect(page).toHaveURL(/\/password/)
    });
  }

  //// BOUNDARY AGE SCENARIOS ────────────────────────────────────────────────

  test('Registration with patient exactly 18 years old', async ({ page }) => {
    await regPage.fillYourDetails({
      organization: ORGANIZATIONS[0],
      firstName: 'Young',
      lastName: 'Patient',
      email: faker.internet.email({ provider: 'mailinator.com' }),
      phone: '07911000010',
    });
    await regPage.clickNext();

    const dob = getDobForAge(18);
    await regPage.fillSetYourPassword({
      sexAtBirth: 'Male',
      ...dob,
      password: 'Test@1234!',
      confirmPassword: 'Test@1234!',
      agreeToTerms: true,
    });
    await regPage.clickCreateAccount()

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })

})