// Inicio.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home'; 
import '@testing-library/jest-dom';

describe('Inicio component', () => {
  test('renders without crashing', () => {
    render(<Home />);
    const backgroundDiv = screen.getByRole('img', { name: /logo/i });
    expect(backgroundDiv).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    const { container } = render(<Home />);
    expect(container.firstChild).toHaveClass('bg_animated');
    expect(container.querySelector('.explosion_container')).toBeInTheDocument();
    expect(container.querySelector('.explosion_image')).toBeInTheDocument();
    expect(container.querySelector('.explosion_circle')).toBeInTheDocument();
  });

  test('renders the logo image with correct src and alt', () => {
    render(<Home />);
    const image = screen.getByAltText('logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/logo2.png');
  });
});
