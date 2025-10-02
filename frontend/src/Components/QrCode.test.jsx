import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import QrCode from './QrCode';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('html5-qrcode', () => {
  let successCallback;
  let errorCallback;

  class MockHtml5QrcodeScanner {
    constructor(id, config, verbose) {
      this.id = id;
      this.config = config;
      this.verbose = verbose;
    }

    render(onSuccess, onError) {
      successCallback = onSuccess;
      errorCallback = onError;
    }

    clear() {
      return Promise.resolve();
    }
  }

  return {
    Html5QrcodeScanner: MockHtml5QrcodeScanner,
    __testHooks: {
      getSuccessCallback: () => successCallback,
      getErrorCallback: () => errorCallback,
    },
  };
});

describe('QrCode component', () => {
  test('renders initial UI', () => {
    render(<QrCode />);
    expect(screen.getByText(/Lector QR/i)).toBeInTheDocument();
    expect(screen.getByText(/Presiona "Iniciar" para escanear/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar/i })).toBeInTheDocument();
  });

  test('starts and stops scanner', async () => {
    render(<QrCode />);
    const startBtn = screen.getByRole('button', { name: /Iniciar/i });

    fireEvent.click(startBtn);

    const stopBtn = await screen.findByRole('button', { name: /Detener/i });
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(stopBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar/i })).toBeInTheDocument();
    });
  });

  test('shows scan result and reset', async () => {
    const { __testHooks } = await import('html5-qrcode');

    render(<QrCode />);
    const startBtn = screen.getByRole('button', { name: /Iniciar/i });

    fireEvent.click(startBtn);

    // Usamos act() porque disparar el callback actualiza estado de React
    await act(async () => {
      const successCallback = __testHooks.getSuccessCallback();
      expect(successCallback).toBeDefined();

      const fakeQRCode = 'https://example.com';
      successCallback(fakeQRCode);
    });

    // El QR detectado debe estar en pantalla
    expect(await screen.findByText('https://example.com')).toBeInTheDocument();

    // Ahora buscamos el botón "Limpiar" (reset)
    const resetBtn = screen.getByRole('button', { name: /Limpiar/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);

    // Al limpiar, debe volver el botón "Iniciar"
    expect(screen.getByRole('button', { name: /Iniciar/i })).toBeInTheDocument();
  });
});
