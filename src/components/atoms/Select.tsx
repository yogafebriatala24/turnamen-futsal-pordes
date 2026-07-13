import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface SelectProps {
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "-- Pilih --",
  error = false,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current selected label
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optionValue: string | number) => {
    if (onChange) {
      // Simulate standard HTML Select Change Event to maintain compatibility
      onChange({
        target: {
          name,
          value: String(optionValue),
        },
      } as React.ChangeEvent<HTMLSelectElement>);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900 border ${
          error
            ? "border-rose-500 focus:ring-rose-500/20"
            : "border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20"
        } rounded-xl text-zinc-150 text-sm transition-all duration-200 outline-none focus:ring-4 cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={selectedOption ? "text-zinc-200 font-medium" : "text-zinc-550"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950/40">
            <Search className="w-4 h-4 text-zinc-550 flex-shrink-0 ml-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-550 outline-none border-none py-1 pr-2"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-850/40 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-zinc-550 text-center">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
