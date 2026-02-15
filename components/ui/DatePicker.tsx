import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "./Button";

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (date: Date) => {
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={cn("relative", className)}>
      {label && <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left",
          "focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none",
          "transition-all duration-200",
          disabled && "cursor-not-allowed bg-neutral-50 text-neutral-400",
          error && "border-destructive-500 focus:ring-destructive-500",
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(selectedDate ? "text-neutral-900" : "text-neutral-400")}>
            {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-neutral-400" />
        </div>
      </button>

      {isOpen && (
        <div className="shadow-soft-lg absolute z-50 mt-1 w-80 rounded-lg border border-neutral-200 bg-white p-4">
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-neutral-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of Week */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-neutral-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-full w-full rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-primary-100 hover:text-primary-900",
                      selectedDate &&
                        formatDate(day) === formatDate(selectedDate) &&
                        "bg-primary-600 hover:bg-primary-700 text-white",
                      formatDate(day) === formatDate(today) &&
                        "bg-neutral-100 font-semibold text-neutral-900",
                    )}
                  >
                    {day.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-destructive-600 mt-1 text-sm">{error}</p>}
    </div>
  );
};

export default DatePicker;
