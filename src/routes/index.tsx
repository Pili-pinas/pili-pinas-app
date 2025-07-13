import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/assets/logo-main.svg?react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // just a basic form to handle submissions
  // change this later if needed
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const message = formData.get("message") as string;
    const subject = encodeURIComponent("Contact From Pili-Pinas");
    const body = encodeURIComponent(`Name: ${name}\n\nMessage: ${message}`);

    window.location.href = `mailto:change@pili-pinas.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow-1 flex flex-col justify-center items-center gap-y-1 bg-white text-center">
        <Logo className="xs:w-auto md:w-160" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Real facts about our politicians, parties, and issues.
        </h2>
      </div>

      <div className="bg-orange-300 flex sm:justify-around xl:justify-center-safe flex-grow-0">
        <Button
          size="lg"
          variant="link"
          className="text-lg font-semibold uppercase text-gray-900 px-6 py-6"
        >
          Fact checking
        </Button>
        <Button
          size="lg"
          variant="link"
          className="text-lg font-semibold uppercase text-gray-900 px-6 py-6"
        >
          Candidate Profiles
        </Button>
        <Button
          size="lg"
          variant="link"
          className="text-lg font-semibold uppercase text-gray-900 px-6 py-6"
        >
          Voting Guides
        </Button>
        <Button
          size="lg"
          variant="link"
          className="text-lg font-semibold uppercase text-gray-900 px-6 py-6"
        >
          Credibility Scores
        </Button>
      </div>

      <div className="w-full max-w-6xl mx-auto px-12 flex flex-col flex-grow-0">
        <div className="mt-8 flex flex-col md:flex-row md:justify-between">
          <div className="flex-grow-0 sm:w-dvw md:w-5/12 text-left space-y-4 grid gap-y-3">
            <h1 className="text-5xl font-semibold">
              Ready to vote <span className="text-red-500">smarter?</span>
            </h1>
            <div>
              We're here to help make politics clearer for you. Drop us a
              message!
            </div>
            <div>
              For inquiries please email us at{" "}
              <a href="mailto:change@pili-pinas.com">change@pili-pinas.com</a>.
            </div>
          </div>
          <div className="flex-grow-0 sm:w-dvw md:w-5/12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-10">
              <div className="grid gap-y-2">
                <Label htmlFor="name" className="text-left">
                  Your name
                </Label>
                <Input name="name" placeholder="Type your name..." />
              </div>

              <div className="grid gap-y-2">
                <Label htmlFor="message" className="text-left">
                  Type your message here
                </Label>
                <Textarea
                  name="message"
                  className="h-32"
                  placeholder="Type your message here..."
                />
              </div>

              <Button variant="default" className="w-1/3">
                Contact us
              </Button>
            </form>
          </div>
        </div>

        <div className="my-8">
          <hr className="mb-4 bg-white h-px border-0" />
          <span className="text-sm">
            2025 Pili-Pinas Inc. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
}
