import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DishCard } from '../src/components/DishCard';
import { SessionProvider } from '../src/state/SessionContext';
import { ProgressProvider } from '../src/state/ProgressContext';
import { getDish } from '../src/data/dishes';

function renderCard() {
  const dish = getDish('it-pizza')!;
  return render(
    <MemoryRouter>
      <SessionProvider>
        <ProgressProvider>
          <DishCard dish={dish} />
        </ProgressProvider>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('DishCard', () => {
  beforeEach(() => localStorage.clear());

  it('prompts sign-in, then tracks tried state and shows the note editor', async () => {
    const user = userEvent.setup();
    renderCard();

    // Signed out: the button offers to mark tried and shows the sign-in hint.
    const button = screen.getByRole('button', { name: /mark as tried/i });
    expect(screen.getByText(/sign in to track/i)).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // First click signs in (mock) — dish not yet tried, hint disappears.
    await user.click(button);
    expect(screen.queryByText(/sign in to track/i)).not.toBeInTheDocument();

    // Second click marks it tried. The editor is collapsed by default — only a
    // compact "Write a review" affordance shows, keeping the card small.
    await user.click(screen.getByRole('button', { name: /mark as tried/i }));
    expect(screen.getByRole('button', { name: /tried this/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByLabelText(/note or review/i)).not.toBeInTheDocument();

    // Clicking "Write a review" expands the note editor + rating.
    await user.click(screen.getByRole('button', { name: /write a review/i }));
    expect(screen.getByLabelText(/note or review/i)).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /your rating/i })).toBeInTheDocument();
  });
});
