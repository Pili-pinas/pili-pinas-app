import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          pili-pinas
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">
          Battling misinformation one page at a time.
        </p>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">
          For inquiries please email us at{" "}
          <a href="mailto:change@pili-pinas.com">change@pili-pinas.com</a>
        </p>
      </div>
    </div>
  );
}
