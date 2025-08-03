import { render, screen } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import userEvent from '@testing-library/user-event';

function TestComponent() {
  const { session, login, logout } = useUser();
  return (
    <div>
      <span data-testid="role">{session.role}</span>
      <span data-testid="data">{session.data ? session.data.name || 'yes' : 'null'}</span>
      <button onClick={() => login('creator', { name: 'Mario' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('UserContext', () => {
  it('fornisce valori di default', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    expect(screen.getByTestId('role').textContent).toBe('');
    expect(screen.getByTestId('data').textContent).toBe('null');
  });

  it('aggiorna sessione con login', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('role').textContent).toBe('creator');
    expect(screen.getByTestId('data').textContent).toBe('Mario');
  });

  it('resetta la sessione con logout', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('role').textContent).toBe('creator');
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('role').textContent).toBe('');
    expect(screen.getByTestId('data').textContent).toBe('null');
  });
});
