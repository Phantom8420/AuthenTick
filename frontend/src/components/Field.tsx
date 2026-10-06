import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  full?: boolean;
  mono?: boolean;
  action?: ReactNode;
};

export function Field({ label, hint, full, mono, action, className, ...rest }: Props) {
  const id = `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className={`field${full ? " full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {hint && <small>{hint}</small>}
      </label>
      <div className="input-row">
        <input id={id} className={`input${mono ? " mono" : ""} ${className ?? ""}`} {...rest} />
        {action}
      </div>
    </div>
  );
}
