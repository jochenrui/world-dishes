import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PopularPage } from '../src/pages/PopularPage';
import { SessionProvider } from '../src/state/SessionContext';
import { ProgressProvider } from '../src/state/ProgressContext';
import { isWelcomed } from '../src/state/storage';

// jsdom lacks these observers; StickyBar (rendered by PopularPage) needs both.
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= ObserverStub as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= ObserverStub as unknown as typeof IntersectionObserver;

function renderPage() {
  return render(
    <MemoryRouter>
      <SessionProvider>
        <ProgressProvider>
          <PopularPage />
        </ProgressProvider>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('PopularPage welcome strip', () => {
  beforeEach(() => localStorage.clear());

  it('shows the first-run welcome strip and persists dismissal', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText(/Welcome to World Dishes!/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText(/Welcome to World Dishes!/i)).not.toBeInTheDocument();
    expect(isWelcomed()).toBe(true);
  });

  it('does not show the strip once the welcomed flag is set', () => {
    localStorage.setItem('world-dishes:welcomed', '1');
    renderPage();
    expect(screen.queryByText(/Welcome to World Dishes!/i)).not.toBeInTheDocument();
  });
});
