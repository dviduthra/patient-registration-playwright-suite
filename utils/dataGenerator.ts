import { faker } from '@faker-js/faker'
import { PatientDetails, PasswordDetails } from '../pages/registrationPage'


export const ORGANIZATIONS = [
  'Ilan Lieberman',
  'Maissara Al-Rikabi',
  'Michael Coupe',
  'Wayne Kampers',
  'Circle Reading Hospital',
]

export const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const SEX_AT_BIRTH = ['Male', 'Female', 'Other', 'Prefer not to say']

export function generatePatientDetails(overrides: Partial<PatientDetails> = {}): PatientDetails {
  return {
    organization: ORGANIZATIONS[0],
    title: faker.helpers.arrayElement(TITLES),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email({ provider: 'mailinator.com' }),
    phone: '07' + faker.string.numeric(9),
    ...overrides,
  }
}

export function generatePasswordDetails(overrides: Partial<PasswordDetails> = {}): PasswordDetails {
  const dob = faker.date.birthdate({ min: 20, max: 60, mode: 'age' })
  return {
    sexAtBirth: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say'] as const),
    day: String(dob.getDate()),
    month: MONTHS[dob.getMonth()],
    year: String(dob.getFullYear()),
    password: 'Test@1234!',
    confirmPassword: 'Test@1234!',
    agreeToTerms: true,
    ...overrides,
  }
}

export function getDobForAge(years: number): { day: string; month: string; year: string } {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return {
    day: String(d.getDate()),
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  }
}