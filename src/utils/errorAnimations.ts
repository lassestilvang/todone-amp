/**
 * Error Animation Utilities
 * Provides visual feedback for errors with smooth animations and transitions
 */

/**
 * Shake animation configuration
 */
export interface ShakeConfig {
  duration?: number; // milliseconds
  intensity?: number; // pixels
  iterations?: number;
}

/**
 * Pulse animation configuration
 */
export interface PulseConfig {
  duration?: number;
  intensity?: number; // 0-1 scale (opacity change)
  color?: string;
}

/**
 * Bounce animation configuration
 */
export interface BounceConfig {
  duration?: number;
  distance?: number; // pixels
  iterations?: number;
}

const DEFAULT_SHAKE_CONFIG: ShakeConfig = {
  duration: 500,
  intensity: 5,
  iterations: 3,
};

const DEFAULT_PULSE_CONFIG: PulseConfig = {
  duration: 1000,
  intensity: 0.3,
  color: 'rgba(239, 68, 68, 0.1)', // red-500 with opacity
};

const DEFAULT_BOUNCE_CONFIG: BounceConfig = {
  duration: 600,
  distance: 10,
  iterations: 2,
};

/**
 * Apply shake animation to an element
 * Useful for indicating errors, validation failures, or invalid input
 */
export function shakeElement(
  element: HTMLElement,
  config: ShakeConfig = DEFAULT_SHAKE_CONFIG
): Promise<void> {
  return new Promise((resolve) => {
    const { duration = DEFAULT_SHAKE_CONFIG.duration!, intensity = DEFAULT_SHAKE_CONFIG.intensity!, iterations = DEFAULT_SHAKE_CONFIG.iterations! } = config;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        element.style.transform = 'translateX(0)';
        resolve();
        return;
      }

      const currentIteration = Math.floor((elapsed / duration) * (iterations * 2));
      const offset = currentIteration % 2 === 0 ? intensity : -intensity;

      element.style.transform = `translateX(${offset}px)`;
      element.style.transition = `none`;

      requestAnimationFrame(animate);
    };

    animate();
  });
}

/**
 * Apply pulse animation to an element
 * Useful for highlighting errors or drawing attention to problematic fields
 */
export function pulseElement(
  element: HTMLElement,
  config: PulseConfig = DEFAULT_PULSE_CONFIG
): Promise<void> {
  return new Promise((resolve) => {
    const { duration = DEFAULT_PULSE_CONFIG.duration!, intensity = DEFAULT_PULSE_CONFIG.intensity!, color = DEFAULT_PULSE_CONFIG.color! } = config;
    const startTime = Date.now();
    const originalBgColor = element.style.backgroundColor;

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        element.style.backgroundColor = originalBgColor;
        element.style.transition = 'none';
        resolve();
        return;
      }

      const progress = (elapsed % (duration / 2)) / (duration / 2);
      const opacity = Math.sin(progress * Math.PI) * intensity;

      element.style.transition = 'none';
      element.style.backgroundColor = color;
      element.style.opacity = String(1 - opacity);

      requestAnimationFrame(animate);
    };

    animate();
  });
}

/**
 * Apply bounce animation to an element
 * Useful for error notifications or alerts
 */
export function bounceElement(
  element: HTMLElement,
  config: BounceConfig = DEFAULT_BOUNCE_CONFIG
): Promise<void> {
  return new Promise((resolve) => {
    const { duration = DEFAULT_BOUNCE_CONFIG.duration!, distance = DEFAULT_BOUNCE_CONFIG.distance!, iterations = DEFAULT_BOUNCE_CONFIG.iterations! } = config;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        element.style.transform = 'translateY(0)';
        element.style.transition = 'none';
        resolve();
        return;
      }

      const currentIteration = Math.floor((elapsed / duration) * (iterations * 2));
      const offset = currentIteration % 2 === 0 ? -distance : distance;

      element.style.transform = `translateY(${offset}px)`;
      element.style.transition = 'none';

      requestAnimationFrame(animate);
    };

    animate();
  });
}

/**
 * Apply flash animation to an element
 * Useful for error highlighting or validation feedback
 */
export function flashElement(
  element: HTMLElement,
  color: string = 'rgba(239, 68, 68, 0.2)', // red with opacity
  duration: number = 600
): Promise<void> {
  return new Promise((resolve) => {
    const originalBgColor = element.style.backgroundColor;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        element.style.backgroundColor = originalBgColor;
        element.style.transition = 'none';
        resolve();
        return;
      }

      const progress = elapsed / duration;
      const isFlashing = Math.floor((progress * 4) % 2) === 0;

      element.style.backgroundColor = isFlashing ? color : originalBgColor;
      element.style.transition = `background-color ${duration / 4}ms ease-in-out`;

      requestAnimationFrame(animate);
    };

    animate();
  });
}

/**
 * Apply slide-in animation with error styling
 */
export function slideInErrorAnimation(
  element: HTMLElement,
  direction: 'left' | 'right' = 'left',
  duration: number = 400
): Promise<void> {
  return new Promise((resolve) => {
    const startPos = direction === 'left' ? -50 : 50;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentPos = startPos * (1 - easeProgress);

      element.style.transform = `translateX(${currentPos}px)`;
      element.style.opacity = String(easeProgress);

      if (progress >= 1) {
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
        resolve();
      } else {
        requestAnimationFrame(animate);
      }
    };

    element.style.opacity = '0';
    element.style.transform = `translateX(${startPos}px)`;
    animate();
  });
}

/**
 * Create error feedback with multiple animations
 * Combines shake + pulse for strong error feedback
 */
export async function errorFeedback(
  element: HTMLElement,
  options: {
    shake?: boolean;
    pulse?: boolean;
    bounce?: boolean;
    color?: string;
  } = {}
): Promise<void> {
  const { shake = true, pulse = true, bounce = false, color } = options;

  const animations: Promise<void>[] = [];

  if (shake) {
    animations.push(shakeElement(element));
  }

  if (pulse) {
    animations.push(
      pulseElement(element, color ? { color, intensity: 0.2 } : undefined)
    );
  }

  if (bounce) {
    animations.push(bounceElement(element));
  }

  if (animations.length === 0) {
    return Promise.resolve();
  }

  // Run first animation, then others in parallel if multiple
  if (animations.length === 1) {
    return animations[0];
  }

  await animations[0];
  return Promise.all(animations.slice(1)).then(() => {});
}

/**
 * Add visual error border to element
 */
export function addErrorBorder(
  element: HTMLElement,
  color: string = 'rgb(239, 68, 68)',
  width: number = 2,
  duration: number = 3000
): Promise<void> {
  return new Promise((resolve) => {
    const originalBorder = element.style.border;

    element.style.border = `${width}px solid ${color}`;
    element.style.transition = 'border-color 0.3s ease-in-out';

    setTimeout(() => {
      element.style.border = originalBorder;
      setTimeout(resolve, 300);
    }, duration);
  });
}

/**
 * Remove error styling from element
 */
export function clearErrorStyling(element: HTMLElement): void {
  element.style.transform = '';
  element.style.opacity = '';
  element.style.backgroundColor = '';
  element.style.border = '';
  element.style.transition = '';
}

/**
 * Add error class with smooth transition
 */
export function addErrorClass(
  element: HTMLElement,
  errorClass: string = 'error-state',
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.classList.add(errorClass);
    setTimeout(resolve, duration);
  });
}

/**
 * Remove error class with smooth transition
 */
export function removeErrorClass(
  element: HTMLElement,
  errorClass: string = 'error-state',
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.classList.remove(errorClass);
    setTimeout(resolve, duration);
  });
}
