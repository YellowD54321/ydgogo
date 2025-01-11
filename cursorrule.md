# Cursor Rules

## Code Style

- All comments should be in English
- Import path should be absolute path
- Don't add comments when you generate code

## Test Driven Development (TDD) Rules

### Basic Requirements

- This project uses TDD (Test Driven Development)
- You must ask if we need to write test cases for:
  - Adding new features
  - Fixing bugs
  - Refactoring code
  - Uncovered code sections

### Core TDD Principles

1. **Red-Green-Refactor Cycle**

   - Write a failing test first (Red)
   - Write minimal code to make the test pass (Green)
   - Refactor the code while keeping tests passing

2. **FIRST Principles**

   - Fast: Tests should run quickly
   - Independent: Tests should not depend on each other
   - Repeatable: Tests should yield the same results each time
   - Self-validating: Tests should automatically determine pass/fail
   - Timely: Tests should be written before the code

3. **Test Granularity**

   - Each test should verify one concept
   - Focus on specific behavior in each test function
   - Avoid testing multiple behaviors in a single test

4. **Naming Conventions**

   - Test names should clearly describe the behavior being tested
   - Use consistent naming patterns (e.g., should_behavior_when_condition)

5. **AAA Pattern**

   - Arrange: Set up test environment and data
   - Act: Execute the behavior being tested
   - Assert: Verify the results

6. **Coverage Guidelines**

   - Focus on meaningful test coverage over coverage percentage
   - Prioritize core business logic and complex scenarios
   - Ensure boundary conditions are covered

7. **Test Isolation**

   - Use mocks or stubs for external dependencies
   - Ensure test environment independence
   - Clean up test data after each test

8. **Continuous Integration**
   - Run tests frequently
   - Ensure all tests pass before code commits
   - Maintain test code quality as production code
