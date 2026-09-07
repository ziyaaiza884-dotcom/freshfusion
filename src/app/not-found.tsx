import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-28 text-center sm:px-6">
      <p className="font-serif text-6xl font-bold text-primary/30">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">
        This jar rolled off the shelf
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you’re after doesn’t exist. Let’s get you back to the kitchen.
      </p>
      <ButtonLink href="/" className="mt-6">
        Back to home
      </ButtonLink>
    </div>
  );
}
