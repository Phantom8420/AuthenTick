import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, required, type = "text", ...props }, ref) => {
    const id = useId();

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          required={required}
          className={cn(
            "peer w-full rounded-2xl bg-slate-800 border border-slate-700 px-4 pt-6 pb-2 text-slate-50 placeholder-transparent transition-all focus:border-electric-blue focus:outline-none focus:ring-1 focus:ring-electric-blue disabled:opacity-50",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-2 z-10 origin-[0] -translate-y-0 scale-75 transform text-slate-400 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:scale-100 peer-focus:-translate-y-0 peer-focus:scale-75 peer-focus:text-electric-blue"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
