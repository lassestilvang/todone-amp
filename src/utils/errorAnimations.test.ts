import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  shakeElement,
  pulseElement,
  bounceElement,
  flashElement,
  slideInErrorAnimation,
  errorFeedback,
  addErrorBorder,
  clearErrorStyling,
  addErrorClass,
  removeErrorClass,
} from './errorAnimations';

describe('Error Animations', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('shakeElement', () => {
    it('applies shake animation to element', async () => {
      const promise = shakeElement(element);
      expect(element.style.transform).toBeTruthy();
      await promise;
      expect(element.style.transform).toBe('translateX(0)');
    }, { timeout: 1000 });

    it('respects custom duration', async () => {
      const promise = shakeElement(element, { duration: 500 });
      await promise;
      expect(element.style.transform).toBe('translateX(0)');
    }, { timeout: 1000 });

    it('respects custom intensity', async () => {
      const promise = shakeElement(element, { intensity: 10 });
      await promise;
      expect(element.style.transform).toBe('translateX(0)');
    }, { timeout: 1000 });

    it('resets transform after animation', async () => {
      const promise = shakeElement(element);
      await promise;
      expect(element.style.transform).toBe('translateX(0)');
    }, { timeout: 1000 });
  });

  describe('pulseElement', () => {
    it('applies pulse animation to element', async () => {
      const promise = pulseElement(element);
      expect(element.style.opacity).not.toBe('');
      await promise;
    }, { timeout: 2000 });

    it('restores original background color', async () => {
      element.style.backgroundColor = 'blue';
      const promise = pulseElement(element);
      await promise;
      expect(element.style.backgroundColor).toBe('blue');
    }, { timeout: 2000 });

    it('respects custom duration', async () => {
      const promise = pulseElement(element, { duration: 500 });
      await promise;
    }, { timeout: 1000 });

    it('respects custom intensity', async () => {
      const promise = pulseElement(element, { intensity: 0.5 });
      await promise;
    }, { timeout: 2000 });
  });

  describe('bounceElement', () => {
    it('applies bounce animation to element', async () => {
      const promise = bounceElement(element);
      expect(element.style.transform).toBeTruthy();
      await promise;
      expect(element.style.transform).toBe('translateY(0)');
    }, { timeout: 1000 });

    it('respects custom distance', async () => {
      const promise = bounceElement(element, { distance: 20 });
      const transform = element.style.transform;
      expect(transform).toContain('translateY');
      await promise;
    }, { timeout: 1000 });

    it('resets transform after animation', async () => {
      const promise = bounceElement(element);
      await promise;
      expect(element.style.transform).toBe('translateY(0)');
    }, { timeout: 1000 });
  });

  describe('flashElement', () => {
    it('applies flash animation to element', async () => {
      const promise = flashElement(element);
      await promise;
    }, { timeout: 1000 });

    it('restores original background after animation', async () => {
      element.style.backgroundColor = 'green';
      const promise = flashElement(element);
      await promise;
      expect(element.style.backgroundColor).toBe('green');
    }, { timeout: 1000 });

    it('respects custom color', async () => {
      const promise = flashElement(element, 'blue', 500);
      await promise;
    }, { timeout: 1000 });

    it('respects custom duration', async () => {
      const promise = flashElement(element, 'red', 500);
      await promise;
    }, { timeout: 1000 });
  });

  describe('slideInErrorAnimation', () => {
    it('animates element from left', async () => {
      const promise = slideInErrorAnimation(element, 'left');
      expect(element.style.transform).toContain('translateX');
      expect(parseFloat(element.style.opacity)).toBeLessThan(1);
      await promise;
      expect(element.style.transform).toBe('translateX(0)');
      expect(element.style.opacity).toBe('1');
    }, { timeout: 1000 });

    it('animates element from right', async () => {
      const promise = slideInErrorAnimation(element, 'right');
      expect(element.style.transform).toContain('translateX');
      await promise;
    }, { timeout: 1000 });

    it('respects custom duration', async () => {
      const promise = slideInErrorAnimation(element, 'left', 300);
      await promise;
    }, { timeout: 1000 });
  });

  describe('errorFeedback', () => {
    it('applies default shake and pulse animations', async () => {
      const promise = errorFeedback(element);
      expect(element.style.transform).toBeTruthy();
      await promise;
    }, { timeout: 2000 });

    it('applies bounce when enabled', async () => {
      const promise = errorFeedback(element, { bounce: true });
      await promise;
    }, { timeout: 2000 });

    it('skips animations when disabled', async () => {
      const promise = errorFeedback(element, {
        shake: false,
        pulse: false,
        bounce: false,
      });
      await promise;
    }, { timeout: 1000 });

    it('respects custom color', async () => {
      const promise = errorFeedback(element, { color: 'purple' });
      await promise;
    }, { timeout: 2000 });
  });

  describe('addErrorBorder', () => {
    it('adds error border to element', async () => {
      const promise = addErrorBorder(element);
      expect(element.style.border).toContain('solid');
      await promise;
    }, { timeout: 4000 });

    it('respects custom color', async () => {
      const promise = addErrorBorder(element, 'blue');
      expect(element.style.border).toContain('blue');
      await promise;
    }, { timeout: 4000 });

    it('respects custom width', async () => {
      const promise = addErrorBorder(element, 'red', 4);
      expect(element.style.border).toContain('4px');
      await promise;
    }, { timeout: 4000 });

    it('removes border after duration', async () => {
      const promise = addErrorBorder(element, 'red', 2, 500);
      await promise;
    }, { timeout: 1000 });
  });

  describe('clearErrorStyling', () => {
    it('clears all error styling', () => {
      element.style.transform = 'translateX(5px)';
      element.style.opacity = '0.5';
      element.style.backgroundColor = 'red';
      element.style.border = '2px solid red';

      clearErrorStyling(element);

      expect(element.style.transform).toBe('');
      expect(element.style.opacity).toBe('');
      expect(element.style.backgroundColor).toBe('');
      expect(element.style.border).toBe('');
    });
  });

  describe('addErrorClass', () => {
    it('adds error class to element', async () => {
      const promise = addErrorClass(element, 'error-state');
      expect(element.classList.contains('error-state')).toBe(true);
      await promise;
    }, { timeout: 1000 });

    it('applies transition', async () => {
      const promise = addErrorClass(element, 'error', 300);
      expect(element.style.transition).toContain('300ms');
      await promise;
    }, { timeout: 1000 });
  });

  describe('removeErrorClass', () => {
    it('removes error class from element', async () => {
      element.classList.add('error-state');
      const promise = removeErrorClass(element, 'error-state');
      expect(element.classList.contains('error-state')).toBe(false);
      await promise;
    }, { timeout: 1000 });

    it('applies transition', async () => {
      element.classList.add('error');
      const promise = removeErrorClass(element, 'error', 300);
      expect(element.style.transition).toContain('300ms');
      await promise;
    }, { timeout: 1000 });
  });
});
