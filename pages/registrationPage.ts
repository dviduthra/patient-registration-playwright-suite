import { Page } from '@playwright/test'

export interface PatientDetails {
  organization: string,
  title?: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
}

export interface PasswordDetails {
  sexAtBirth: 'Male' | 'Female' | 'Other' | 'Prefer not to say',
  day: string,
  month: string,
  year: string,
  password: string,
  confirmPassword: string,
  emailToggle?: boolean,
  appAlertsToggle?: boolean,
  marketingToggle?: boolean,
  agreeToTerms: boolean,
}

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  //// NAVIGATION ──────────────────────────────────────────────────

  get signUpButton() {
    return this.page.getByRole('link', { name: 'Sign Up' })
  }

  get backToLoginLink() {
    return this.page.getByText('Back to Login')
  }

  //// PATIENT DETAILS ──────────────────────────────────────────────────────

  get organization() {
    return this.page.getByPlaceholder('Select an organization')
  }

  get organizationOptions() {
    return this.page.locator('[role="option"]')
  }

  get clearOrganization() {
    return this.page.locator('.mantine-InputClearButton-root')
  }

  get dropdownList() {
  return this.page.locator('[role="listbox"]:visible')
  }

  get dropdownOptions() {
    return this.dropdownList.locator('[role="option"]')
  }
  
  get title() {
    return this.page.locator('input[data-path="title"]')
  }

  get firstName() {
    return this.page.locator('input[data-path="firstName"]')
  }

  get lastName() {
    return this.page.locator('input[data-path="lastName"]')
  }

  get email() {
    return this.page.locator('input[data-path="email"]')
  }

  get phone() {
    return this.page.locator('input[data-path="phoneNumber"]')
  }

  get nextButton() {
    return this.page.getByRole('button', { name: 'Next' })
  }

  get successBanner() {
    return this.page.locator('button[aria-label="Close notification"]')
      .locator('..')
  }

  //// PASSWORD DETAILS ──────────────────────────────────────────────────────

  get sexAtBirth() {
    return this.page.locator('input[data-path="gender"]')
  }

  get day() {
    return this.page.locator('input[placeholder="Day"]')
  }

  get month() {
    return this.page.locator('input[placeholder="Month"]')
  }

  get year() {
    return this.page.locator('input[placeholder="Year"]')
  }

  get password() {
    return this.page.locator('input[data-path="password"]')
  }

  get passwordVisibilityToggle() {
    return this.page.locator('button.mantine-PasswordInput-visibilityToggle').first()
  }

  get confirmPassword() {
    return this.page.locator('input[data-path="confirmPassword"]')
  }

  get confirmPasswordVisibilityToggle() {
    return this.page.locator('button.mantine-PasswordInput-visibilityToggle').last()
  }

  get createAccountButton() {
    return this.page.getByRole('button', { name: 'Create Account' })
  }

  //// COMMUNICATION PREFERENCES ────────────────────────────────────
  get emailToggle() {
    return this.page.locator('input[data-path="commsEmailEnabled"]')
  }

  get appAlertsToggle() {
    return this.page.locator('input[data-path="commsPushEnabled"]')
  }

  get marketingToggle() {
    return this.page.locator('input[data-path="commsMarketingOptIn"]')
  }

  //// TERMS AND CONSENTS ───────────────────────────────────────────

  get termsCheckbox() {
    return this.page.locator('input[data-path="consent"]')
  }

  get termsAccordionControl() {
    return this.page.locator('[data-accordion-control="true"]')
  }

//// ERROR MESSAGES ───────────────────────────────────────────
  get firstNameError() {
  return this.page.getByText('First Name is required')
  }

  get lastNameError() {
    return this.page.getByText('Last Name is required')
  }

  get emailError() {
    return this.page.getByText('Please enter a valid email address')
  }

  get emailInvalid() {
    return this.page.locator('input[type="email"]')
  }

  get phoneError() {
    return this.page.getByText('Phone Number is required')
  }

  get genderError() {
  return this.page.getByText('Gender is required')
}

  get dobError() {
    return this.page.getByText('Date of Birth is required')
  }

  get passwordError() {
    return this.page.getByText('Passwords must be a minimum of 8 characters long and include at least one uppercase letter, one number and a special character')
  }

  get confirmPasswordError() {
    return this.page.getByText('Passwords do not match')
  }

  //// ACTIONS ──────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto('/')
    await this.page.waitForURL(/\/login/)
  }

  async fillYourDetails(data: PatientDetails) {
    await this.selectOrganization(data.organization)
    if (data.title) await this.selectTitle(data.title)
    await this.firstName.fill(data.firstName)
    await this.lastName.fill(data.lastName)
    await this.email.fill(data.email)
    await this.phone.fill(data.phone)
  }

  async selectOrganization(organization: string) {
    await this.organization.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.organizationOptions.filter({ hasText: organization }).click()
  }

  async selectTitle(title: string) {
    await this.title.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.page.locator('[role="option"]').filter({ hasText: title }).click()
  }

  async clickNext() {
    await this.nextButton.click()
  }

  async selectSexAtBirth(sex: string) {
    await this.sexAtBirth.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.page.getByRole('option', { name: sex, exact: true }).click()
  }

  // DOB format: "15 January 1990"
  async fillDateOfBirth(dateOfBirth: string) {
    const [day, month, year] = dateOfBirth.split(' ')
    const paddedDay = day.padStart(2, '0')

    await this.day.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.dropdownList.getByRole('option', { name: paddedDay, exact: true }).click()

    await this.month.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.dropdownList.getByRole('option', { name: month, exact: true }).click()

    await this.year.click()
    await this.dropdownList.waitFor({ state: 'visible' })
    await this.dropdownList.getByRole('option', { name: year, exact: true }).click()
  }

  async fillSetYourPassword(data: PasswordDetails) {
    await this.selectSexAtBirth(data.sexAtBirth)
    await this.fillDateOfBirth(`${data.day} ${data.month} ${data.year}`)
    await this.password.fill(data.password)
    await this.confirmPassword.fill(data.confirmPassword)
    if (data.agreeToTerms) await this.termsCheckbox.check()
  }

  async clickCreateAccount() {
    await this.createAccountButton.click()
  }
}