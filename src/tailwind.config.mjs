/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.025em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.025em', fontWeight: '400' }],
                xl: ['1.25rem', { lineHeight: '1.75', letterSpacing: '0.025em', fontWeight: '400' }],
                '2xl': ['1.5rem', { lineHeight: '2', letterSpacing: '0.025em', fontWeight: '500' }],
                '3xl': ['1.875rem', { lineHeight: '2.25', letterSpacing: '0.025em', fontWeight: '500' }],
                '4xl': ['2.25rem', { lineHeight: '2.5', letterSpacing: '0.025em', fontWeight: '500' }],
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
                '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
            },
            fontFamily: {
                heading: "cormorantgaramond",
                paragraph: "sora-light"
            },
            colors: {
                // New warm, inviting palette
                'rose-blush': '#FBE8F0',
                'soft-lavender': '#F4E4F1',
                'sage-green': '#E8F4F1',
                'warm-cream': '#FFF8E8',
                // Neutral palette
                'charcoal-black': '#1a1a1a',
                'dark-gray': '#2d2d2d',
                'medium-gray': '#666666',
                'light-gray': '#f0f0f0',
                'white': '#ffffff',
                // Legacy colors (kept for backward compatibility)
                'accent-blue': '#0066cc',
                'accent-teal': '#00a8a8',
                'soft-white': '#FFF8E8',
                'warm-sand-beige': '#e8ddd5',
                'soft-bronze': '#c9a876',
                'warm-grey': '#8b8680',
                // Semantic color mappings
                destructive: '#D32F2F',
                'destructive-foreground': '#FFFFFF',
                background: '#FFF8E8',
                secondary: '#F4E4F1',
                foreground: '#1a1a1a',
                'secondary-foreground': '#666666',
                'primary-foreground': '#ffffff',
                primary: '#FBE8F0'
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
