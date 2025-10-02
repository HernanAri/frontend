// Navbar.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';  // Ajusta la ruta si es necesario
import '@testing-library/jest-dom';

describe('Navbar component', () => {
  test('renders without crashing and shows logo', () => {
    render(<Navbar />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo2.png');
  });

  test('renders all navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByText('Tiempo')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<Navbar />);
    const searchInput = screen.getByPlaceholderText('Buscar...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('search-input');
  });

  test('menu toggles open and close on clicking menu-toggle', () => {
    render(<Navbar />);
    const menuToggle = screen.getByText('☰');
    const navLinks = screen.getByRole('list'); // ul element

    // Initially menu should not have 'open' class
    expect(navLinks).not.toHaveClass('open');

    // Click to open menu
    fireEvent.click(menuToggle);
    expect(navLinks).toHaveClass('open');

    // Click again to close menu
    fireEvent.click(menuToggle);
    expect(navLinks).not.toHaveClass('open');
  });
});
