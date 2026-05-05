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
                paragraph: "sora-light",
                sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
            },
            colors: {
                // New Brand Color Palette
                // Primary background: Warm off-white / stone
                'primary-bg': '#E8E2D8',
                // Secondary background: Soft cream
                'secondary-bg': '#F5F1EA',
                // Primary text: Deep charcoal / near black
                'primary-text': '#1A1A1A',
                // Secondary text: Warm grey
                'secondary-text': '#6E6A64',
                // Accent / buttons: Black / dark charcoal
                'accent': '#111111',
                // Light contrast areas: Pure white
                'light-contrast': '#FFFFFF',
                
                // Semantic mappings (using new brand colors)
                primary: '#111111',
                secondary: '#F5F1EA',
                background: '#E8E2D8',
                foreground: '#1A1A1A',
                'primary-foreground': '#FFFFFF',
                'secondary-foreground': '#1A1A1A',
                destructive: '#D32F2F',
                'destructive-foreground': '#FFFFFF',
                
                // Aliases for backward compatibility (mapped to new palette)
                'off-white': '#E8E2D8',
                'soft-white': '#F5F1EA',
                'warm-bronze': '#111111',
                'soft-bronze': '#6E6A64',
                'warm-grey': '#6E6A64',
                'charcoal-black': '#1A1A1A',
                'dark-gray': '#111111',
                'warm-sand-beige': '#E8E2D8',
                'white': '#FFFFFF',
                'light-gray': '#F5F1EA',
                'medium-gray': '#6E6A64',
                // Deprecated legacy colors - use core colors instead
                'rose-blush': '#F5F1EA',
                'soft-lavender': '#F5F1EA',
                'sage-green': '#E8E2D8',
                'accent-blue': '#111111',
                'accent-teal': '#111111',
                'warm-cream': '#F5F1EA',
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
