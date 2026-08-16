import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ScoreRing from '@/components/ui/ScoreRing';

/**
 * ScoreRing was fixed twice by hand in one session — the label was clipped by a
 * `w-fit` wrapper, then the number was too large for the ring — because nothing
 * rendered it in a test. These pin the geometry contract rather than the pixels.
 */

// The count-up runs on rAF; jsdom needs it driven manually.
beforeEach(() => {
  let now = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    now += 1000; // jump past `duration` so the first frame settles the value
    setTimeout(() => cb(now), 0);
    return 1;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ScoreRing', () => {
  it('exposes the score to assistive tech', async () => {
    render(<ScoreRing score={88} />);
    expect(await screen.findByLabelText('ATS Match Score: 88%')).toBeTruthy();
  });

  it('reserves at least 72px of width so the label is never clipped', () => {
    // The label sits at a fixed 11px and is wider than a small ring. With the
    // previous `w-fit` the box collapsed to the SVG and "ATS MATCH" was cut off
    // on both sides.
    const { container } = render(<ScoreRing score={50} size={40} />);
    const wrapper = container.querySelector('[aria-label]') as HTMLElement;
    expect(parseInt(wrapper.style.width, 10)).toBeGreaterThanOrEqual(72);
  });

  it('grows the wrapper with the ring when the ring is the larger of the two', () => {
    const { container } = render(<ScoreRing score={50} size={120} />);
    const wrapper = container.querySelector('[aria-label]') as HTMLElement;
    expect(wrapper.style.width).toBe('120px');
  });

  it('keeps the label at the 11px legibility floor at every size', () => {
    // An earlier fix scaled the label down to fit, producing 8-9px text. Small
    // rings widen the container instead.
    for (const size of [64, 88, 120]) {
      const { container } = render(<ScoreRing score={50} size={size} />);
      const label = screen.getAllByText('ATS Match')[0];
      expect(label.className).toContain('text-[11px]');
      cleanup();
      void container;
    }
  });

  it('sizes the number relative to the ring so "100%" fits inside it', () => {
    const { container } = render(<ScoreRing score={100} size={88} />);
    const number = container.querySelector('.tabular-nums') as HTMLElement;
    // 0.22 x 88 = 19px, which leaves clearance inside the 76px inner diameter.
    expect(parseInt(number.style.fontSize, 10)).toBeLessThanOrEqual(20);
  });

  it('uses tabular figures so the ring does not jitter while counting up', () => {
    const { container } = render(<ScoreRing score={100} />);
    expect(container.querySelector('.tabular-nums')).toBeTruthy();
  });

  describe('score colour thresholds', () => {
    const strokeOf = (container: HTMLElement) =>
      (container.querySelectorAll('circle')[1] as SVGCircleElement).style.stroke;

    it('uses the success token at or above 70', () => {
      const { container } = render(<ScoreRing score={70} />);
      expect(strokeOf(container)).toContain('--success');
    });

    it('uses the warning token between 40 and 69', () => {
      const { container } = render(<ScoreRing score={55} />);
      expect(strokeOf(container)).toContain('--warning');
    });

    it('uses the danger token below 40', () => {
      const { container } = render(<ScoreRing score={12} />);
      expect(strokeOf(container)).toContain('--danger');
    });
  });

  it('treats a null score as zero rather than rendering NaN', () => {
    const { container } = render(<ScoreRing score={null as unknown as number} />);
    expect(container.textContent).not.toContain('NaN');
  });
});
