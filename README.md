# Patient Registration - Playwright Test Suite

Automated end-to-end test suite for the patient registration workflow at [ScriptAssist UAT](https://scriptassist-uat-patient.scriptassist.co.uk), built with Playwright and TypeScript.

---

## Tech Stack

- [Playwright](https://playwright.dev/) + TypeScript
- [Faker.js](https://fakerjs.dev/)  - random test data generation
- [Axe-core](https://github.com/dequelabs/axe-core)  - accessibility checks

---

## Project Structure
```
├── pages/
│   └── registrationPage.ts                   # Page Object Model
├── tests/
│   ├── registration.test.ts                  # Happy path & positive interactions
│   ├── registration.negative.test.ts         # Negative & edge cases
│   ├── registration.datadriven.test.ts       # Data-driven scenarios
│   └── registration.accessibility.test.ts    # WCAG 2.0 checks
├── utils/
│   └── dataGenerator.ts                      # Faker-based test data factory
├── .env.example                              # Environment variable template
└── playwright.config.ts                      # Playwright configuration

```

---

## Setup

### Prerequisites
- Node.js v18+
- npm v9+

### Steps

```bash
# Clone the repository
git clone https://github.com/dviduthra/patient-registration-playwright-suite.git
cd patient-registration-playwright-suite

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment

```bash
cp .env.example .env
```

Open `.env` and set:

```
BASE_URL=https://scriptassist-uat-patient.scriptassist.co.uk
```

---

## Running Tests

| Command | Description |
|---|---|
| `npx playwright test` | Run all tests |
| `npx playwright test --project=chromium` | Chromium only |
| `npx playwright test --project=firefox` | Firefox only |
| `npx playwright test --project=webkit` | WebKit only |
| `npx playwright test --project=mobile-chrome` | Mobile Chrome |
| `npx playwright test --headed` | Run with visible browser |
| `npx playwright test tests/registration.test.ts` | Run specific file |
| `npx playwright show-report` | Open HTML report |

> For local development/environment, it is recommended to run with `--workers=1` at the end of the command to avoid overloading your machine.

---

## Test Coverage

### registration.test.ts - Happy Path
Covers the full registration flow and positive field interactions, organization and title dropdowns, field inputs, navigation, password visibility toggle, communication preferences, and terms and conditions.

### registration.negative.test.ts - Negative & Edge Cases
Covers validation and error handling across both pages required field errors, invalid email formats, weak password variations, mismatched passwords, special character inputs, and missing consent.

### registration.datadriven.test.ts - Data Driven
Multiple patient profiles tested against the full registration flow covering different organizations, titles, sex at birth options, special character names, and boundary age scenarios.

### registration.accessibility.test.ts - Accessibility
WCAG 2.0 AA compliance checks on the login page, Your details page, and Set your password page using axe-core.

---

## Test Execution Proof

All 51 tests passing across 4 suites, attached video and screenshots of the results.

| Suite | Tests | Status |
|---|---|---|
| Happy Path | 13 | ✅ Passed |
| Negative & Edge Cases | 25 | ✅ Passed |
| Data Driven | 10 | ✅ Passed |
| Accessibility | 3 | ✅ Passed |
| **Total** | **51** | **✅ All Passed** |

E2E happy-path video: https://github.com/user-attachments/assets/330601de-b4ef-44b9-ab80-179c8edc10d7

![Happy Path Results](https://github.com/user-attachments/assets/e5244fea-19ea-40e8-b822-b69f218fc42c)

![Negative Results](https://github.com/user-attachments/assets/8d5dc551-3622-4f93-a3af-e29d0054f419)

![Data Driven Results](https://github.com/user-attachments/assets/f4d532ff-1fd2-4d7e-9977-95445be80a33)

![Accessibility Results](https://github.com/user-attachments/assets/31cb6e9e-5568-4f83-8863-fc5b6bf8b378)

---

## Reports

After any test run, the HTML report is generated automatically:

```bash
npx playwright show-report
```

Screenshots and videos for failed tests are saved to `test-results/`.

---

## Assumptions

- Organization is a required field with a pre-populated list, free text entry is not supported
- Title is optional
- Password requirements as stated on the page: minimum 8 characters, one uppercase letter, one number, one special character
- Date of birth uses three separate dropdowns for Day, Month and Year not a single date input
- On the Set your password page, validation errors only appear after the terms checkbox is checked and Create Account is clicked
- UAT environment may be reset periodically, tests use unique generated emails per run to avoid conflicts

---

## Findings

- Some validation errors use browser native tooltips which cannot be asserted by text in Playwright. These are handled by asserting the `required` attribute and confirming the URL did not change.
- Validation error elements do not have stable test attributes such as `data-testid`. Errors are asserted by text content via `getByText()`. If error copy changes, locators in the page object will need updating.
- Communication preference toggles and terms checkbox on the Set your password page are missing accessible labels, flagged as a WCAG 2.0 A violation in the accessibility tests. This is an app-level issue in the Mantine UI component implementation.
