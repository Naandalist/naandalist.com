/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{html,js}'],
  theme: {
    extend: {
      translate: {
        '-50': '-50%',
      },
      animationDelay: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
        600: '600ms',
      },
      colors: {
        sub_dark: '#232323',
        main: '#c8f31d',
        dark: '#1d1d1d',
        sub_light: '#fff',
        main2: '#55e6a5',
        light: '#e6eaee',
      },
      borderRadius: {
        30: '30px',
      },
      boxShadow: {
        mainShadow: 'rgba(0, 0, 0, 0.15) 0px -1px 34px 0px',
      },
      backgroundImage: {
        banner_image: "url('/assets/img/banner/banner-bg.png')",
        common_bg: "url('/assets/img/about/about-bg.png')",
      },
      keyframes: {
        scales: {
          '0%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.4)',
          },
          '100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
        loading: {
          '0%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
        cir5: {
          '50%': {
            transform: 'rotate(10deg)',
          },
        },
      },
      animation: {
        loading: 'loading 1s ease-in-out infinite alternate',
        scales: 'scales 2s linear infinite',
        cir5: 'cir5 2s  infinite',
      },
      screens: {
        xxl: '1399px',
      },
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
