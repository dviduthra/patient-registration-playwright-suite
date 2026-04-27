import { test, expect } from '@playwright/test'
import { RegistrationPage } from '../pages/registrationPage'
import { generatePatientDetails, generatePasswordDetails } from '../utils/dataGenerator'

test.describe('Patient Registration - API + UI Validation', () => {

  let regPage: RegistrationPage

  test.beforeEach(async ({ page }) => {
    regPage = new RegistrationPage(page)
    await regPage.navigate()
    await regPage.signUpButton.click()
  });

  test('Registration POST returns 201 and UI confirms account creation', async ({ page }) => {
    const patientDetails = generatePatientDetails()
    const passwordDetails = generatePasswordDetails()

    await expect(page).toHaveURL(/\/register/)
    await regPage.fillYourDetails(patientDetails)
    await regPage.clickNext()

    await expect(page).toHaveURL(/\/password/)
    await regPage.fillSetYourPassword(passwordDetails)

    const response = await regPage.waitForRegistrationResponse(() =>
      regPage.clickCreateAccount()
    );

    // API assertions
    expect(response.status()).toBe(201)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.patientId).toBeDefined()
    expect(body.actions.user.status).toBe('CREATED')
    expect(body.actions.patient.status).toBe('CREATED')
    expect(body.actions.clinicMembership.status).toBe('CREATED')

    // UI assertions
    await expect(regPage.successBanner).toBeVisible()
    await expect(regPage.successBanner).toContainText('Your account has been created successfully')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  });

  test('Registration POST payload contains submitted patient details', async () => {
    const patientDetails = generatePatientDetails()
    const passwordDetails = generatePasswordDetails()

    await regPage.fillYourDetails(patientDetails)
    await regPage.clickNext()
    await regPage.fillSetYourPassword(passwordDetails)

    const response = await regPage.waitForRegistrationResponse(() =>
      regPage.clickCreateAccount()
    );

    const requestBody = response.request().postDataJSON()

    expect(requestBody.email).toBe(patientDetails.email)
    expect(requestBody.firstName).toBe(patientDetails.firstName)
    expect(requestBody.lastName).toBe(patientDetails.lastName)
    expect(requestBody.phoneNumber).toBe(patientDetails.phone)
  });

  test('Duplicate email registration behaviour in UAT', async ({ page }) => {
    const patientDetails = generatePatientDetails()
    const passwordDetails = generatePasswordDetails()

    // First registration
    await regPage.fillYourDetails(patientDetails)
    await regPage.clickNext()
    await regPage.fillSetYourPassword(passwordDetails)

    const firstResponse = await regPage.waitForRegistrationResponse(() =>
      regPage.clickCreateAccount()
    );
    expect(firstResponse.status()).toBe(201)

    // Second registration with same email
    await regPage.navigate()
    await regPage.signUpButton.click()
    await regPage.fillYourDetails(generatePatientDetails({ email: patientDetails.email }))
    await regPage.clickNext()
    await regPage.fillSetYourPassword(generatePasswordDetails())

    const duplicateResponse = await regPage.waitForRegistrationResponse(() =>
      regPage.clickCreateAccount()
    )

    // Note: UAT environment allows duplicate email registrations, returns 201.
    expect(duplicateResponse.status()).toBe(201)
  })

})