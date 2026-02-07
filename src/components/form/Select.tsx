import { useState } from "react";
import { ChevronDownIcon } from "../../icons";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Option[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  defaultValue?: string;
  children?: React.ReactNode;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  onChange,
  className = "",
  defaultValue = "",
  children,
  value: controlledValue,
  ...rest
}) => {
  // Manage the selected value only if not controlled
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : selectedValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setSelectedValue(newValue);
    }
    if (onChange) {
      onChange(e);
    }
  };
 
  return (
   <div className="relative ">
     <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        value
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={value}
      onChange={handleChange}
      {...rest}
    >
      {placeholder && !children && (
        <option
          value=""
          disabled
          style={{ color: '#9CA3AF' }}
        >
          {placeholder}
        </option>
      )}
      
      {/* If children are provided, use them (native mode) */}
      {children}
      
      {/* Otherwise, use options prop */}
      {!children && options && options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDownIcon
                  className={`absolute right-2 top-0 h-11 w-5 text-gray-500 pointer-events-none  transition-transform duration-200 `}
    />
   </div>
  );
};

export default Select;
