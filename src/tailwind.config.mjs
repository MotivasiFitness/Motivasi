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
                // Deep Plum & Nude Palette
                'deep-plum': '#1e0f24',
                'rich-plum': '#2d1535',
                'soft-nude-pink': '#dbb8c8',
                'warm-cream': '#f5eee8',
                'muted-cream': 'rgba(245,238,232,0.45)',
                'blush-purple': 'rgba(200,160,180,0.15)',
                'deep-violet': 'rgba(148,70,130,0.2)',
                'soft-nude-border': 'rgba(220,185,200,0.25)',
                // Semantic color mappings
                destructive: '#D32F2F',
                'destructive-foreground': '#FFFFFF',
                background: '#1e0f24',
                secondary: '#dbb8c8',
                foreground: '#f5eee8',
                'secondary-foreground': '#1e0f24',
                'primary-foreground': '#1e0f24',
                primary: '#dbb8c8'
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
