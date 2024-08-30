tailwind.config = {
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
        clr_white: '#ffffff',
        clr_title: '#181818',
        clr_mtitle: '#000d27',
        clr_pra: '#999999',
        clr_subtitle: '#121212',
        clr_base: '#c9f31d',
        clr_hover: '#c2ec1d9e',
        clr_bg1: '#e9f0ff',
        clr_ftext: '#818181',
        clr_footer: '#181818',
        clr_cusborder: 'rgb(38, 37, 37)',
        clr_border1: '#414141',
        clr_ratting: '#ffa311',
        clr_bgsection: '#000d27',
        clr_success: '#3fca90',
        clr_danger: '#ed5050',
        clr_boxes1: 'rgba(26, 77, 190, 0.05)',
        clr_cborder: '#d9d9d9',
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
};
