import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registrationPage';
import { generatePatientDetails, generatePasswordDetails, ORGANIZATIONS, TITLES } from '../utils/dataGenerator';
import { faker } from '@faker-js/faker';

test.describe('Patient Registration - Happy Path', () => {

  let regPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    regPage = new RegistrationPage(page);
    await regPage.navigate();
    await regPage.signUpButton.click();
  });

  test('Successful registration end-to-end', async ({ page }) => {
    const patientDetails = generatePatientDetails()
    const passwordDetails = generatePasswordDetails()

    await expect(page).toHaveURL(/\/register/)
    await regPage.fillYourDetails(patientDetails)
    await regPage.clickNext()

    await expect(page).toHaveURL(/\/password/)
    await regPage.fillSetYourPassword(passwordDetails)
    await regPage.clickCreateAccount()

    await expect(regPage.successBanner).toBeVisible()
    await expect(regPage.successBanner).toContainText('Your account has been created successfully')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })

  test('Organization dropdown opens with options and can be searched by partial name', async () => {
    await regPage.organization.click()
    await regPage.dropdownList.waitFor({ state: 'visible' })

    const allOptions = await regPage.dropdownOptions.allTextContents()
    expect(allOptions.length).toBeGreaterThan(0)

    await regPage.organization.fill('Circle')
    const filteredOptions = await regPage.dropdownOptions.allTextContents()
    expect(filteredOptions.some(o => o.includes('Circle'))).toBeTruthy()
  })

  test('Organization can be selected from dropdown', async () => {
    const org = faker.helpers.arrayElement(ORGANIZATIONS)
    await regPage.selectOrganization(org)
    await expect(regPage.organization).toHaveValue(org.trim())
  })

  test('Organization can be cleared using X button', async () => {
    const org = faker.helpers.arrayElement(ORGANIZATIONS)
    await regPage.selectOrganization(org)
    await regPage.clearOrganization.click()
    await expect(regPage.organization).toHaveValue('')
  })

  test('Title dropdown lists expected options and can be selected', async () => {
    await regPage.title.click()
    await regPage.dropdownList.waitFor({ state: 'visible' })

    const options = await regPage.dropdownOptions.allTextContents()
    expect(options).toContain('Mr.')
    expect(options).toContain('Mrs.')
    expect(options).toContain('Ms.')
    expect(options).toContain('Dr.')

    const title = faker.helpers.arrayElement(TITLES)
    await regPage.selectTitle(title)
    await expect(regPage.title).toHaveValue(title)
  })

  test('Without title (optional field) proceeds to next step', async ({ page }) => {
    const patientDetails = generatePatientDetails({ title: undefined })
    await regPage.fillYourDetails(patientDetails)
    await regPage.clickNext()

    await expect(page).toHaveURL(/\/password/)
  })

  test('Back to Login link navigates to login page', async ({ page }) => {
    await regPage.backToLoginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  //// SET YOUR PASSWORD ──────────────────────────────────────────────────────

  test('Sex at Birth dropdown shows all options', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await regPage.sexAtBirth.click()
    await regPage.dropdownList.waitFor({ state: 'visible' })

    const options = await regPage.dropdownOptions.allTextContents()
    expect(options).toContain('Male')
    expect(options).toContain('Female')
    expect(options).toContain('Other')
    expect(options).toContain('Prefer not to say')
  })

  test('Password field is masked by default', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await expect(regPage.password).toHaveAttribute('type', 'password')
    await expect(regPage.confirmPassword).toHaveAttribute('type', 'password')
  })

  test('Password visibility toggle works', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await regPage.password.fill('Test@1234!')
    await expect(regPage.password).toHaveAttribute('type', 'password')
    await regPage.passwordVisibilityToggle.click()
    await expect(regPage.password).toHaveAttribute('type', 'text')
    await regPage.passwordVisibilityToggle.click()
    await expect(regPage.password).toHaveAttribute('type', 'password')
  })

  test('Communication preferences are ON by default', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await expect(regPage.emailToggle).toBeChecked()
    await expect(regPage.appAlertsToggle).toBeChecked()
    await expect(regPage.marketingToggle).toBeChecked()
  })

  test('Terms accordion expands on click', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await expect(regPage.termsAccordionControl).toHaveAttribute('aria-expanded', 'false')
    await regPage.termsAccordionControl.click()
    await expect(regPage.termsAccordionControl).toHaveAttribute('aria-expanded', 'true')
  })

  test('Terms checkbox can be checked', async () => {
    await regPage.fillYourDetails(generatePatientDetails())
    await regPage.clickNext()

    await expect(regPage.termsCheckbox).not.toBeChecked()
    await regPage.termsCheckbox.check()
    await expect(regPage.termsCheckbox).toBeChecked()
  })

})