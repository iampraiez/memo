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
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
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

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

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
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={cn(
          "min-h-[2.5rem] px-3 py-2 bg-white border border-neutral-300 rounded-lg shadow-sm cursor-pointer",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent",
          "transition-all duration-200",
          disabled && "bg-neutral-50 text-neutral-400 cursor-not-allowed",
          error && "border-destructive-500 focus-within:ring-destructive-500",
          isOpen && "ring-2 ring-primary-500 border-transparent",
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded border border-primary-200"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(option.value);
                }}
                className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isOpen && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[120px] outline-none bg-transparent"
              placeholder={selectedOptions.length === 0 ? placeholder : ""}
              autoFocus
            />
          )}

          {!isOpen && selectedOptions.length === 0 && (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </div>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform duration-200",
              isOpen && "transform rotate-180",
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-soft-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center justify-between",
                  "first:rounded-t-lg last:rounded-b-lg",
                  value.includes(option.value) &&
                    "bg-primary-50 text-primary-900",
                )}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive-600">{error}</p>}
    </div>
  );
};

export default MultiSelect;
