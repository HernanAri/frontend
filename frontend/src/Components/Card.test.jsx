import { render, screen, fireEvent } from '@testing-library/react';
import Cards from './Cards';

test('muestra alerta con usuario y contraseña al enviar el formulario', () => {
  // Espía el alert
  window.alert = vi.fn();

  render(<Cards />);

  // Escribe en los inputs
  fireEvent.change(screen.getByPlaceholderText(/usuario/i), {
    target: { value: 'usuarioPrueba' },
  });

  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
    target: { value: 'claveSecreta' },
  });

  // Envía el formulario
  fireEvent.submit(screen.getByRole('form', { hidden: true }));

  // Asegura que se haya llamado el alert con los datos correctos
  expect(window.alert).toHaveBeenCalledWith(
    expect.stringContaining('usuarioPrueba')
  );
  expect(window.alert).toHaveBeenCalledWith(
    expect.stringContaining('claveSecreta')
  );
});
