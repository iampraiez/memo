import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      {label && <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left shadow-sm",
          "focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none",
          "transition-all duration-200",
          disabled && "cursor-not-allowed bg-neutral-50 text-neutral-400",
          error && "border-destructive-500 focus:ring-destructive-500",
          isOpen && "ring-primary-500 border-transparent ring-2",
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(selectedOption ? "text-neutral-900" : "text-neutral-400")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-400 transition-transform duration-200",
              isOpen && "rotate-180 transform",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="shadow-soft-lg absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-50",
                "first:rounded-t-lg last:rounded-b-lg",
                value === option.value && "bg-primary-50 text-primary-900",
              )}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="text-primary-600 h-4 w-4" />}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-destructive-600 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default Select;
