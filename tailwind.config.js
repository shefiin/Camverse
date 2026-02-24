/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js'
  ],
  theme: {
    extend: {
      screens: {
        tablet: '800px',
        xl1180: '1170px',
        xs400: '400px',
        xs500: '500px',
        s600: '600px',
        s700: '700px',
        md800: '800px',
        md900: '900px',
        lg1000: '1000px',
        lg1100: '1100px',
        xl1200: '1200px',
        xl1300: '1300px',
        xxl1400: '1400px',
        xxl1500: '1500px',
        xxxl1600: '1600px',
        xs: '610px',
        sm2: '800px',
        md2: '1201px',
        lg2: '1321px'
      }
    }
  },
  plugins: []
};
