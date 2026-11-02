// A gentle message under a form field explaining what's missing.
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="mt-1 block rounded-lg bg-amber-light px-3 py-1.5 text-sm text-amber">
      {message}
    </span>
  );
}
