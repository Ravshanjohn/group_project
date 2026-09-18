# Programming Learning Platform

## B215 Software Testing Project

This repository contains the Programming Learning Platform developed and tested as part of the B215 Software Testing project.

The platform is designed to help users learn programming through exercises, progress tracking, educational games, scores, and leaderboards. It also includes account management features such as registration, login, logout, email verification, and password recovery.

## Students

- Aihem Geswila — GH1043158
- Ravshanjon Rakhmonberdiev — GH1047114

## Main Features

The application includes:

- User registration
- User login and logout
- Email verification
- Forgot and reset password
- Authentication and protected routes
- Programming exercises
- Saving user progress
- Exercise completion tracking
- Educational games
- Game score submission
- Leaderboards

## Software Testing

The project includes automated testing at different testing levels.

### Unit Testing

Frontend unit tests were used to test selected frontend functions separately.

Latest result:

- 30 tests executed
- 30 passed
- 0 failed

The frontend tests include functions such as:

- `handleSignUp.test.ts`
- `getErrorMessage.test.ts`

### Integration Testing

Backend integration tests were used to check controllers, middleware, authentication, registration, game scores, and password-related functionality.

Latest result:

- 34 tests executed
- 34 passed
- 0 failed

The backend testing includes:

- Login testing
- Signup testing
- Authentication middleware testing
- Game score testing
- Password reset/system information testing

### System Testing

Playwright was used for browser-level system testing.

Latest result:

- 3 tests executed
- 2 passed
- 1 failed

The remaining failed test is related to the successful login workflow. The application redirects to `/dashboard`, while the expected login message is not visible. This result is documented for further investigation.

## Testing Techniques

The project uses three black-box testing techniques.

### Equivalence Partitioning

Equivalence Partitioning was used to divide inputs into valid and invalid groups so representative values could be tested.

### Boundary Value Analysis

Boundary Value Analysis was used to test important input limits.

For example, the registration password has a minimum length of six characters, so values around the boundary were tested:

- 5 characters
- 6 characters
- 7 characters

### Decision Table Testing

Decision Table Testing was used for functions where the result depends on different combinations of conditions.

## Test Cases

The software testing documentation contains 20 formal test cases.

Each test case includes information such as:

- Test Case ID
- Objective
- Preconditions
- Test procedure
- Test data
- Expected result
- Actual result
- Pass/Fail status
- Severity
- Testing technique

## Defects Found

Three main defects were identified and fixed during testing.

### BUG-001 — JWT Error Handling

Malformed or invalid JWT tokens could reach generic server error handling instead of returning the correct authentication response.

The issue was fixed and regression testing confirmed the expected `401` response.

### BUG-002 — Account Activation Status

The login query did not select the `active_status` field even though the login logic later used this value.

The issue was fixed by including the required field. Regression testing confirmed the correct deactivated account response.

### BUG-003 — Password Reset Field Naming

The password reset functionality contained inconsistent field naming between `newPassword` and `new_password`.

The backend was updated to handle the expected field naming and the fix was regression-tested.

## Code Coverage

Latest reported backend coverage:

- Statements: 21.44%
- Branches: 21.81%
- Functions: 14.70%
- Lines: 23.09%

Latest reported frontend overall coverage:

- Statements: 2.27%
- Branches: 3.21%
- Functions: 1.00%
- Lines: 2.22%

The selected frontend files that received focused testing achieved approximately:

- Statements: 89%
- Branches: 79%
- Functions: 100%
- Lines: 89%

The high percentages above apply only to the specifically tested frontend files and not to the complete frontend application.

## Static Analysis

ESLint was used for frontend static code analysis.

Latest result:

- 15 errors
- 18 warnings

The remaining findings include empty catch blocks, an unsafe-finally issue, a constant binary expression, and unused variables.

Backend TypeScript checking reported:

- 0 TypeScript errors

## Running the Tests

### Backend Tests

Navigate to the backend directory:

    cd backend

Run the backend tests:

    node run-tests.mjs

### Frontend Tests

Navigate to the frontend directory:

    cd frontend

Run the frontend unit tests:

    npm test

### Playwright System Tests

From the frontend directory:

    npx playwright test --reporter=list

### Frontend Static Analysis

From the frontend directory:

    npx eslint src/ __tests__/

### Backend TypeScript Check

From the backend directory:

    npx tsc --noEmit --allowImportingTsExtensions

## Test Documentation

The repository contains software testing documentation covering:

- User stories
- Acceptance criteria
- Test plan
- Equivalence Partitioning
- Boundary Value Analysis
- Decision Table Testing
- Formal test cases
- Test execution logs
- Defect reports
- Traceability
- Coverage results
- Static analysis
- Analysis and recommendations

## Technologies

The project uses technologies including:

- TypeScript
- JavaScript
- React
- Next.js
- Express
- Supabase
- Vitest
- Playwright
- ESLint

## Repository Structure

    group_project/
    ├── software design and modelling/
    └── software_testing/

The `software_testing` section contains the application testing work and related documentation for the B215 Software Testing project.

## Project Status

Current testing results show that the selected unit and integration tests are passing. Additional work is still recommended for overall code coverage, browser-level system testing, and remaining frontend static-analysis findings.

## Authors

**Aihem Geswila**  
Student ID: GH1043158

**Ravshanjon Rakhmonberdiev**  
Student ID: GH1047114
