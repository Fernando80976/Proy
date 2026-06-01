import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { authService } from '../../../services/AuthService';
import { classService } from '../../../services/ClassService';

vi.mock('../../../services/AuthService');
vi.mock('../../../services/ClassService');
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.verifyToken).mockResolvedValue(false);
  });

  afterEach(() => {
    cleanup();
  });

  it('debería renderizar los campos de entrada correctamente', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(await screen.findByPlaceholderText(/Enter your credentials/i)).toBeDefined();
    expect(await screen.findByLabelText(/Access Key/i)).toBeDefined();
  });

  it('debería mostrar errores si se envía el formulario vacío', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = await screen.findByRole('button', { name: /ARISE/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/El campo no puede estar vacío./i)).toBeDefined();
    });
  });

  it('debería llamar a authService.login al introducir credenciales válidas', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(authService.login).mockResolvedValue({} as any);
    vi.mocked(classService.verifyClass).mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const identifierInput = await screen.findByPlaceholderText(/Enter your credentials/i);
    const passwordInput = screen.getByLabelText(/Access Key/i);
    const submitButton = screen.getByRole('button', { name: /ARISE/i });

    fireEvent.change(identifierInput, { target: { value: 'test@hunter.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        identifier: 'test@hunter.com',
        password: 'Password123'
      });
    });
  });
});