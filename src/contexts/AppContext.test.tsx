import { render, screen } from '@testing-library/react';
import { AppProvider, AppContext } from './AppContext';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';

function TestComponent() {
  const { user, login, logout } = useContext(AppContext);
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'null'}</span>
      <span data-testid="role">{user ? user.role : 'null'}</span>
      <button onClick={() => login('mock-seed')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AppContext', () => {
  it('user è null di default', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
  });

  it('login imposta user demo admin', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('user').textContent).toBe('demo');
    expect(screen.getByTestId('role').textContent).toBe('admin');
  });

  it('logout resetta user', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('user').textContent).toBe('demo');
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
  });
});
