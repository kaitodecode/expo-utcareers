/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins_400Regular'],
        'poppins': {
          '200': 'Poppins_200ExtraLight',
          '400': 'Poppins_400Regular',
          '500': 'Poppins_500Medium',
          '600': 'Poppins_600SemiBold',
          '700': 'Poppins_700Bold',
        }
      },
    },
  },
  plugins: [],
}