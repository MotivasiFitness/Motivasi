import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-5xl font-bold text-deep-plum mb-4">
          Oops!
        </h1>
        <p className="text-lg text-deep-plum mb-6">
          We're having trouble displaying this page. Something didn't load correctly on our end.
        </p>
        {error && (
          <details className="mb-6 text-sm text-deep-plum opacity-75">
            <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
            <pre className="text-left bg-soft-nude-pink bg-opacity-20 p-3 rounded overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        )}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-deep-plum text-warm-cream rounded-lg font-semibold hover:bg-rich-plum transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
