import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = "Select options",
  options,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOptions = options.filter((option) => value.includes(option.value));

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      {label && <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>}

      <div
        className={cn(
          "min-h-[2.5rem] cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm",
          "focus-within:ring-primary-500 focus-within:border-transparent focus-within:ring-2 focus-within:outline-none",
          "transition-all duration-200",
          disabled && "cursor-not-allowed bg-neutral-50 text-neutral-400",
          error && "border-destructive-500 focus-within:ring-destructive-500",
          isOpen && "ring-primary-500 border-transparent ring-2",
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="flex flex-wrap items-center gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="bg-primary-100 text-primary-800 border-primary-200 inline-flex items-center rounded border px-2 py-1 text-sm"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(option.value);
                }}
                className="hover:bg-primary-200 ml-1 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {isOpen && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-[120px] flex-1 bg-transparent outline-none"
              placeholder={selectedOptions.length === 0 ? placeholder : ""}
              autoFocus
            />
          )}

          {!isOpen && selectedOptions.length === 0 && (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </div>

        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-400 transition-transform duration-200",
              isOpen && "rotate-180 transform",
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="shadow-soft-lg absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-50",
                  "first:rounded-t-lg last:rounded-b-lg",
                  value.includes(option.value) && "bg-primary-50 text-primary-900",
                )}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && <Check className="text-primary-600 h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="text-destructive-600 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default MultiSelect;
