// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HighlightInput from './HighlightInput.svelte';

describe('HighlightInput', () => {
  it('renders an input element', () => {
    render(HighlightInput, { value: '', wrongSpans: [] });
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('displays placeholder text', () => {
    render(HighlightInput, { value: '', wrongSpans: [], placeholder: 'Type here...' });
    expect(screen.getByPlaceholderText('Type here...')).toBeTruthy();
  });

  it('renders overlay with wrong spans highlighted', () => {
    const { container } = render(HighlightInput, {
      value: 'hello',
      wrongSpans: [[0, 5]] as [number, number][],
    });
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeTruthy();
    const redSpans = overlay!.querySelectorAll('.text-red-400');
    expect(redSpans.length).toBe(5);
  });

  it('renders non-wrong characters in normal color within overlay', () => {
    const { container } = render(HighlightInput, {
      value: 'hello',
      wrongSpans: [[1, 3]] as [number, number][],
    });
    const overlay = container.querySelector('[aria-hidden="true"]');
    const redSpans = overlay!.querySelectorAll('.text-red-400');
    const normalSpans = overlay!.querySelectorAll('.text-stone-100');
    expect(redSpans.length).toBe(2); // 'el'
    expect(normalSpans.length).toBe(3); // 'h', 'l', 'o'
  });

  it('hides overlay when no wrong spans', () => {
    const { container } = render(HighlightInput, {
      value: 'hello',
      wrongSpans: [],
    });
    const overlay = container.querySelector('[aria-hidden="true"]');
    const redSpans = overlay!.querySelectorAll('.text-red-400');
    expect(redSpans.length).toBe(0);
  });

  it('sets inputmode to numeric when specified', () => {
    render(HighlightInput, { value: '', wrongSpans: [], inputMode: 'numeric' });
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('makes input readonly when specified', () => {
    render(HighlightInput, { value: '', wrongSpans: [], readonly: true });
    const input = screen.getByRole('textbox');
    expect((input as HTMLInputElement).readOnly).toBe(true);
  });

  it('applies correct border style', () => {
    const { container } = render(HighlightInput, {
      value: 'test',
      wrongSpans: [],
      borderStyle: 'correct',
    });
    const input = container.querySelector('input');
    expect(input!.className).toContain('border-emerald-600');
  });

  it('applies error border style', () => {
    const { container } = render(HighlightInput, {
      value: 'test',
      wrongSpans: [],
      borderStyle: 'error',
    });
    const input = container.querySelector('input');
    expect(input!.className).toContain('border-red-700');
  });
});
