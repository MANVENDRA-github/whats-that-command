/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        hairline: 'var(--hairline)',
        ink: 'var(--ink)',
        accent: {
          DEFAULT: 'var(--accent)',
          deep: 'var(--accent-deep)'
        },
        moss: 'var(--accent-2)',
        muted: 'var(--muted)'
      },
      fontFamily: {
        sans: ['var(--font-spline-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-spline-sans-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif']
      },
      boxShadow: {
        block: '18px 18px 0 rgba(22, 20, 15, 0.9)',
        'block-sm': '12px 12px 0 rgba(22, 20, 15, 0.9)',
        card: '4px 4px 0 rgba(22, 20, 15, 0.9)'
      },
      maxWidth: {
        page: '1080px'
      },
      letterSpacing: {
        kicker: '0.18em'
      }
    }
  },
  plugins: []
};
