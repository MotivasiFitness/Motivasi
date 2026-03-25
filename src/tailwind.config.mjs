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
                // Core 4-Color System
                // Primary Color
                'warm-bronze': '#c9956f',
                // Secondary Color
                'warm-cream': '#f5ede3',
                // Neutral Colors
                'charcoal-black': '#1a1a1a',
                'white': '#ffffff',
                'light-gray': '#f0f0f0',
                'medium-gray': '#666666',
                
                // Semantic mappings (using core colors)
                primary: '#c9956f',
                secondary: '#f5ede3',
                background: '#ffffff',
                foreground: '#1a1a1a',
                'primary-foreground': '#ffffff',
                'secondary-foreground': '#1a1a1a',
                destructive: '#D32F2F',
                'destructive-foreground': '#FFFFFF',
                
                // Aliases for backward compatibility (all map to core colors)
                'off-white': '#fafaf9',
                'soft-white': '#FFF8E8',
                'soft-bronze': '#c9a876',
                'warm-grey': '#8b8680',
                'dark-gray': '#2d2d2d',
                'warm-sand-beige': '#e8ddd5',
                // Deprecated legacy colors - use core colors instead
                'rose-blush': '#f5ede3',
                'soft-lavender': '#f5ede3',
                'sage-green': '#f5ede3',
                'accent-blue': '#c9956f',
                'accent-teal': '#c9956f',
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
