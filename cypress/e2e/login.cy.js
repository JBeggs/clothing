/// <reference types="cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders login form', () => {
    cy.get('[data-cy="login-username"]').should('be.visible');
    cy.get('[data-cy="login-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });

  it('submits credentials and redirects on success', () => {
    const username = Cypress.env('testUser') || 'testuser';
    const password = Cypress.env('testPassword') || 'testpass';

    cy.get('[data-cy="login-username"]').type(username);
    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-submit"]').click();

    cy.url({ timeout: 15000 }).should('eq', Cypress.config('baseUrl') + '/');
  });

  it('shows inline error banner and toast when login fails', () => {
    cy.intercept('POST', '**/auth/login/', {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Invalid username or password' },
    }).as('loginFail');

    cy.visit('/login');
    cy.get('[data-cy="login-username"]').type('nobody@test.com');
    cy.get('[data-cy="login-password"]').type('wrong-password');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@loginFail');
    cy.get('[data-cy="login-submit-error"]')
      .should('be.visible')
      .and('contain', 'Invalid');
    cy.get('[data-cy="toast-error"]').should('be.visible');
  });
});
