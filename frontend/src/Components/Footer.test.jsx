import { render, screen } from '@testing-library/react';
import Footer from './Footer';

test('renderiza correctamente el componente Footer', () => {
  render(<Footer />);

  // Verifica que el título principal esté presente
  expect(screen.getByText('Mi App')).toBeInTheDocument();

  // Verifica que el texto descriptivo esté presente
  expect(screen.getByText(/esta es una aplicación de ejemplo/i)).toBeInTheDocument();

  // Verifica que los enlaces existan
  expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /registro/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /tiempo/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /logout/i })).toBeInTheDocument();

  // Verifica que el contacto esté presente
  expect(screen.getByText(/ejemplo@correo.com/)).toBeInTheDocument();
  expect(screen.getByText(/\+57 123 456 7890/)).toBeInTheDocument();

  // Verifica que el año actual esté presente
  const year = new Date().getFullYear();
  expect(screen.getByText(new RegExp(`${year} Mi App`, 'i'))).toBeInTheDocument();
});
