import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'peer h-4 w-4 appearance-none rounded border border-input bg-background shadow-sm outline-none transition-colors checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute inset-0 m-auto h-3 w-3 scale-0 text-primary-foreground transition-transform peer-checked:scale-100" />
    </span>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
