import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import AuthContext from '../../context/AuthContext';

const mockRegister = jest.fn();

const renderRegister = () => {
  return render(
    <AuthContext.Provider value={{ register: mockRegister }}>
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Register Component Password Validation', () => {
  it('disables the submit button if password is weak', () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button if password meets all requirements', () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword!123' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('shows error if submitted without valid forms', async () => {
    // Though button is disabled, if we force submit, it flags error msg
    renderRegister();
    
    // Simulate invalid state submission handled in code theoretically
    const form = screen.getByRole('form') || document.querySelector('form');
    fireEvent.submit(form);
    
    expect(await screen.findByText(/ensure your password meets/i)).toBeInTheDocument();
  });
});
