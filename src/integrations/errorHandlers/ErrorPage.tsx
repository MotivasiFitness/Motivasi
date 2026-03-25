import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
          Oops!
        </h1>
        <p className="text-lg text-dark-gray mb-6">
          We're having trouble displaying this page. Something didn't load correctly on our end.
        </p>
        {error && (
          <details className="mb-6 text-sm text-medium-gray">
            <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
            <pre className="text-left bg-light-gray p-3 rounded overflow-auto text-xs">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        )}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-warm-bronze text-white rounded-lg font-semibold hover:bg-warm-bronze hover:opacity-90 transition-opacity"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
