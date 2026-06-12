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
        muted: 'var(--muted)',
        git: 'var(--git)',
        docker: 'var(--docker)',
        bash: 'var(--bash)'
      },
      fontFamily: {
        sans: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        display: ['var(--font-display)', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        // Phosphor glows — no hard offset shadows on a CRT
        stack: '0 0 0 1px rgba(61, 255, 124, 0.04), 0 0 26px rgba(61, 255, 124, 0.07)',
        glow: '0 0 0 1px var(--accent), 0 0 22px rgba(61, 255, 124, 0.30)',
        'glow-soft': '0 0 18px rgba(61, 255, 124, 0.18)',
        'glow-amber': '0 0 18px rgba(255, 176, 0, 0.25)'
      },
      maxWidth: {
        page: 'var(--page-max)'
      },
      letterSpacing: {
        kicker: '0.18em'
      }
    }
  },
  plugins: []
};
