import { test, expect } from '@playwright/test'
import { RegistrationPage } from '../pages/registrationPage'
import { generatePatientDetails, generatePasswordDetails, ORGANIZATIONS, SEX_AT_BIRTH } from '../utils/dataGenerator'
import { faker } from '@faker-js/faker'

// Note 1: Some validation errors (organization, terms checkbox) use browser native
// tooltips and cannot be asserted by text. Asserted via required attribute + URL check

// Note 2: Validation error elements don't have stable attributes (data-testid/id etc)
// So errors are asserted by text content via getByText() in page objects

test.describe('Patient Registration - Negative & Edge Cases', () => {

  let regPage: RegistrationPage

  test.beforeEach(async ({ page }) => {
    regPage = new RegistrationPage(page)
    await regPage.navigate()
    await regPage.signUpButton.click()
  })

  // ── YOUR DETAILS ─────────────────────────────────────────────────────────

  test('Submit without organization shows required error', async ({ page }) => {
    await regPage.firstName.fill(faker.person.firstName())
    await regPage.lastName.fill(faker.person.lastName())
    await regPage.email.fill(faker.internet.email({ provider: 'mailinator.com' }))
    await regPage.phone.fill('07' + faker.string.numeric(9))
    await regPage.clickNext()

    await expect(regPage.organization).toHaveAttribute('required', '')
    await expect(page).toHaveURL(/\/register/)
  })

  test('Submit without first name shows required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ firstName: '' }))
    await regPage.clickNext()

    await expect(regPage.firstNameError).toBeVisible()
    await expect(regPage.firstNameError).toHaveText('First Name is required')
    await expect(page).toHaveURL(/\/register/)
  })

  test('Submit without last name shows required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ lastName: '' }))
    await regPage.clickNext()

    await expect(regPage.lastNameError).toBeVisible()
    await expect(regPage.lastNameError).toHaveText('Last Name is required')
    await expect(page).toHaveURL(/\/register/)
  })

  test('Submit without email shows required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ email: '' }))
    await regPage.clickNext()

    await expect(regPage.emailError).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
  })

  test('Submit without phone shows required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ phone: '' }))
    await regPage.clickNext()

    await expect(regPage.phoneError).toBeVisible()
    await expect(regPage.phoneError).toHaveText('Phone Number is required')
    await expect(page).toHaveURL(/\/register/)
  })

  test('Submit with all empty fields stays on register page', async ({ page }) => {
    await regPage.clickNext()

    await expect(regPage.organization).toHaveAttribute('required', '')
    await expect(page).toHaveURL(/\/register/)
  })

  //// EMAIL VALIDATION ─────────────────────────────────────────────────────

  test.describe('Invalid email formats', () => {

    const invalidEmails = [
      { scenario: 'missing @ symbol',   email: 'invalidemail.com' },
      { scenario: 'missing domain',     email: 'user@' },
      { scenario: 'missing local part', email: '@test.com' },
      { scenario: 'spaces in email',    email: 'user @test.com' },
      { scenario: 'double @',           email: 'user@@test.com' },
    ]

    for (const { scenario, email } of invalidEmails) {
      test(`Invalid email — ${scenario}`, async ({ page }) => {
        await regPage.fillYourDetails(generatePatientDetails({ email }))
        await regPage.clickNext()

        // Browser native validation: check if email field is invalid
        await expect(regPage.emailInvalid).toHaveJSProperty('validity.valid', false)
        await expect(page).toHaveURL(/\/register/)
      })
    }
  })

  //// EDGE CASES — YOUR DETAILS ────────────────────────────────────────────

  test('First name with special characters is accepted', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ firstName: "O'Brien" }))
    await regPage.clickNext()

    await expect(page).toHaveURL(/\/password/)
  })

  test('First name with hyphen is accepted', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails({ firstName: 'Mary-Jane' }))
    await regPage.clickNext()

    await expect(page).toHaveURL(/\/password/)
  })

  test('Organization search with no matching results shows empty list', async () => {
    await regPage.organization.click()
    await regPage.dropdownList.waitFor({ state: 'visible' })
    await regPage.organization.fill('zzzznotanorg999')

    await expect(regPage.dropdownOptions).toHaveCount(0)
  })

  test('Organization cleared after selection prevents form submission', async ({ page }) => {
    await regPage.selectOrganization(faker.helpers.arrayElement(ORGANIZATIONS))
    await regPage.clearOrganization.click()
    await regPage.firstName.fill(faker.person.firstName())
    await regPage.lastName.fill(faker.person.lastName())
    await regPage.email.fill(faker.internet.email({ provider: 'mailinator.com' }))
    await regPage.phone.fill('07' + faker.string.numeric(9))
    await regPage.clickNext()

    await expect(regPage.organization).toHaveAttribute('required', '')
    await expect(page).toHaveURL(/\/register/)
  })

  //// SET YOUR PASSWORD ────────────────────────────────────────────────────

  // Important: Terms must be checked first before other errors appear on this page.
  // Without checking terms, only the browser native tooltip fires.

  test('Submit without sex at birth shows gender required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    const { day, month, year } = generatePasswordDetails()
    await regPage.fillDateOfBirth(`${day} ${month} ${year}`)
    await regPage.password.fill('Test@1234!')
    await regPage.confirmPassword.fill('Test@1234!')
    await regPage.termsCheckbox.check()
    await regPage.clickCreateAccount()

    await expect(regPage.genderError).toBeVisible()
    await expect(regPage.genderError).toHaveText('Gender is required')
    await expect(page).toHaveURL(/\/password/)
  })

  test('Submit without date of birth shows dob required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await regPage.selectSexAtBirth(faker.helpers.arrayElement(SEX_AT_BIRTH))
    await regPage.password.fill('Test@1234!')
    await regPage.confirmPassword.fill('Test@1234!')
    await regPage.termsCheckbox.check()
    await regPage.clickCreateAccount()

    await expect(regPage.dobError).toBeVisible()
    await expect(regPage.dobError).toHaveText('Date of Birth is required')
    await expect(page).toHaveURL(/\/password/)
  })

  test('Submit without terms checked shows browser native required error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await regPage.fillSetYourPassword(generatePasswordDetails({ agreeToTerms: false }))
    await regPage.clickCreateAccount()

    await expect(regPage.termsCheckbox).toHaveAttribute('required', '')
    await expect(page).toHaveURL(/\/password/)
  })

  //// PASSWORD VALIDATION ──────────────────────────────────────────────────

  const weakPasswords = [
    { scenario: 'too short',                password: 'Ab1!' },
    { scenario: 'missing uppercase',         password: 'test@1234' },
    { scenario: 'missing number',            password: 'Test@abcd' },
    { scenario: 'missing special character', password: 'Test12345' },
    { scenario: 'only spaces',              password: '        ' },
  ]

  for (const { scenario, password } of weakPasswords) {
    test(`Password rejected — ${scenario}`, async ({ page }) => {
      await regPage.fillYourDetails(generatePatientDetails())
      await regPage.clickNext()

      const { day, month, year } = generatePasswordDetails()
      await regPage.selectSexAtBirth(faker.helpers.arrayElement(SEX_AT_BIRTH))
      await regPage.fillDateOfBirth(`${day} ${month} ${year}`)
      await regPage.password.fill(password)
      await regPage.confirmPassword.fill(password)
      await regPage.termsCheckbox.check()
      await regPage.clickCreateAccount()

      await expect(regPage.passwordError).toBeVisible()
      await expect(page).toHaveURL(/\/password/)
    })
  }

  test('Mismatched passwords shows error', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    const { day, month, year } = generatePasswordDetails()
    await regPage.selectSexAtBirth(faker.helpers.arrayElement(SEX_AT_BIRTH))
    await regPage.fillDateOfBirth(`${day} ${month} ${year}`)
    await regPage.password.fill('Test@1234!')
    await regPage.confirmPassword.fill('Different@9999!')
    await regPage.termsCheckbox.check()
    await regPage.clickCreateAccount()

    await expect(regPage.confirmPasswordError).toBeVisible()
    await expect(page).toHaveURL(/\/password/)
  })

  //// EDGE CASES — SET YOUR PASSWORD ───────────────────────────────────────

  test('Submit completely empty Set Your Password form stays on page', async ({ page }) => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await regPage.termsCheckbox.check()
    await regPage.clickCreateAccount()

    await expect(regPage.genderError).toBeVisible()
    await expect(regPage.dobError).toBeVisible()
    await expect(regPage.passwordError).toBeVisible()
    await expect(page).toHaveURL(/\/password/)
  })

})