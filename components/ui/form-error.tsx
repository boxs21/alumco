import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Accessible form error message component
 * - role="alert" announces errors to screen readers
 * - Should be associated with form inputs via aria-describedby
 * - Visual: red text + icon
 *
 * @example
 * <Input id="email" aria-describedby="email-error" />
 * <FormError id="email-error">Invalid email address</FormError>
 */
export default function FormError({ id, children }: FormErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      className="flex items-center gap-2 text-sm text-destructive mt-1"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
