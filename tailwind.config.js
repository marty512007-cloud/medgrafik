export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px'
    },
    extend: {
      colors: {
        primary: {
          50: '#f9fafb',
          500: '#6b7280',
          600: '#374151',
          700: '#1f2937'
        },
        success: {
          500: '#4b5563',
          600: '#374151'
        },
        danger: {
          500: '#374151',
          600: '#1f2937'
        },
        warning: {
          500: '#6b7280',
          600: '#4b5563'
        }
      }
    }
  },
  plugins: [],
}