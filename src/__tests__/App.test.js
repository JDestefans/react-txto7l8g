import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  test('renders landing page when not authenticated', () => {
    renderApp('/');
    expect(screen.getByText(/Your EM program/i)).toBeInTheDocument();
  });

  test('renders sign in button on landing page', () => {
    renderApp('/');
    const signInButtons = screen.getAllByText(/Sign In/i);
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  test('renders Start Free Trial button on landing page', () => {
    renderApp('/');
    expect(screen.getAllByText(/Start Free Trial/i).length).toBeGreaterThan(0);
  });

  test('renders pricing section with plan tiers', () => {
    renderApp('/');
    expect(screen.getAllByText(/Solo Operator/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Small Team/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Full Program/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enterprise/i).length).toBeGreaterThan(0);
  });

  test('renders pricing with seat and AI limits', () => {
    renderApp('/');
    expect(screen.getByText(/1 user seat/i)).toBeInTheDocument();
    expect(screen.getByText(/200 AI calls \/ month/i)).toBeInTheDocument();
    expect(screen.getByText(/1,000 AI calls \/ month/i)).toBeInTheDocument();
  });

  test('renders Security & Compliance section', () => {
    renderApp('/');
    expect(screen.getByText(/Security & Compliance/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTPS Everywhere/i)).toBeInTheDocument();
    expect(screen.getByText(/Encryption at Rest/i)).toBeInTheDocument();
  });

  test('renders SOC 2 roadmap', () => {
    renderApp('/');
    expect(screen.getByText(/Secure Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/SOC 2-certified cloud/i)).toBeInTheDocument();
  });

  test('renders footer with legal links', () => {
    renderApp('/');
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/helloplanrr.app@gmail.com/i)).toBeInTheDocument();
  });

  test('renders features section', () => {
    renderApp('/');
    expect(screen.getAllByText(/EMAP Standards/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mission Continuity/i)).toBeInTheDocument();
  });
});
