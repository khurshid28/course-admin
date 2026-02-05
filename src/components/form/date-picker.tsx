import { useEffect, useState, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  const [flatPickrInstance, setFlatPickrInstance] = useState<flatpickr.Instance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const flatPickr = flatpickr(inputRef.current, {
      mode: mode || "single",
      dateFormat: "Y-m-d",
      defaultDate,
      position: "auto",
      onChange: onChange ? [onChange].flat() : undefined,
      clickOpens: false, // Disable default click behavior
    });

    setFlatPickrInstance(Array.isArray(flatPickr) ? flatPickr[0] : flatPickr);

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, defaultDate, onChange]); // Include onChange back in dependencies

  const handleInputClick = () => {
    if (flatPickrInstance) {
      flatPickrInstance.open();
    }
  };

  const handleIconClick = () => {
    if (flatPickrInstance) {
      flatPickrInstance.open();
    }
  };

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          onClick={handleInputClick}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span 
          className="absolute text-gray-500 -translate-y-1/2 pointer-events-auto right-3 top-1/2 dark:text-gray-400 cursor-pointer"
          onClick={handleIconClick}
        >
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
