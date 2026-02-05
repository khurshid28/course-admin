import { useCallback } from "react";
import DatePicker from "./date-picker";
import Input from "./input/InputField";

type PropsType = {
  dateId: string;
  timeId: string;
  dateLabel?: string;
  timeLabel?: string;
  datePlaceholder?: string;
  timePlaceholder?: string;
  dateValue?: string;
  timeValue?: string;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: string) => void;
  dateDefaultDate?: Date;
  timePattern?: string;
  timeTitle?: string;
};

export default function DateTimePicker({
  dateId,
  timeId,
  dateLabel = "",
  timeLabel = "",
  datePlaceholder = "Sana tanlang",
  timePlaceholder = "00:00",
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateDefaultDate,
  timePattern = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  timeTitle = "24-soat formatda vaqt kiriting (HH:MM)",
}: PropsType) {
  const handleDateChange = useCallback((selectedDates: Date[]) => {
    if (selectedDates && selectedDates.length > 0 && onDateChange) {
      const date = selectedDates[0];
      // Use local date parts to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onDateChange(`${year}-${month}-${day}`);
    }
  }, [onDateChange]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onTimeChange) {
      const rawValue = e.target.value;
      
      // Agar user tozalayotgan bo'lsa (bo'sh yoki faqat raqamlar), ruxsat berish
      if (rawValue === '' || /^\d{0,2}:?\d{0,2}$/.test(rawValue)) {
        let value = rawValue.replace(/\D/g, ''); // Faqat raqamlar
        
        // Auto-format: 1000 -> 10:00
        if (value.length >= 3) {
          const hours = value.substring(0, 2);
          const minutes = value.substring(2, 4);
          value = `${hours}:${minutes}`;
        } else if (value.length === 2 && !rawValue.includes(':')) {
          value = `${value}:`;
        }
        
        onTimeChange(value);
      }
    }
  }, [onTimeChange]);

  return (
    <div>
      {dateLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{dateLabel}</label>}
      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          id={dateId}
          label=""
          placeholder={datePlaceholder}
          defaultDate={dateDefaultDate}
          onChange={handleDateChange}
        />
        <Input
          type="text"
          value={timeValue || ""}
          onChange={handleTimeChange}
          placeholder={timePlaceholder}
          pattern={timePattern}
          title={timeTitle}
        />
      </div>
      {timeLabel && <p className="text-xs text-gray-500 mt-1">{timeLabel}</p>}
    </div>
  );
}