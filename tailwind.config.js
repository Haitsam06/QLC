import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'qlc-green': '#065f46', // Emerald 800 (Primary - Islam & Pertumbuhan)
                'qlc-light-green': '#f0fdf4', // Background ringan
                'qlc-blue': '#1e40af',  // Blue 800 (Secondary - Trust & Pendidikan)
                'qlc-gold': '#fbbf24',  // Amber 400 (Accent - Kemuliaan & Leadership)
                'qlc-red': '#dc2626',   // Red 600 (Alert - Urgent)
            },
        },
    },

    plugins: [forms],
};
