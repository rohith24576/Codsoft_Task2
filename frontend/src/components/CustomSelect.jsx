import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option', 
  label,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} className={clsx("relative w-full", className)}>
      {label && (
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-5 py-3.5 bg-white border rounded-2xl text-sm font-bold shadow-xs transition-all outline-none cursor-pointer",
          disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" :
          isOpen ? "border-indigo-600 ring-4 ring-indigo-50/80 bg-white shadow-md" : 
          "border-gray-200/80 text-gray-800 hover:border-gray-300 hover:bg-gray-50/50"
        )}
      >
        <div className="flex items-center gap-3 truncate pr-2">
          {selectedOption ? (
            <>
              {selectedOption.avatar && (
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                  {selectedOption.avatar}
                </div>
              )}
              {selectedOption.icon && <selectedOption.icon className="w-4 h-4 text-indigo-600 shrink-0" />}
              <div className="flex items-center gap-2 truncate">
                <span className="text-gray-900 truncate">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className={clsx(
                    "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border",
                    selectedOption.badge === 'Manager' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                    selectedOption.badge === 'Admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                  )}>
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-gray-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={clsx("w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180 text-indigo-600")} />
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-[150] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl shadow-slate-900/10 py-2 max-h-64 overflow-y-auto outline-none no-scrollbar"
          >
            {options.length === 0 ? (
              <div className="px-5 py-4 text-sm text-gray-400 italic text-center">No options available</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center justify-between px-5 py-3 text-left transition-colors cursor-pointer group",
                      isSelected ? "bg-indigo-50/80 text-indigo-900 font-bold" : "hover:bg-gray-50/80 text-gray-700 font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      {opt.avatar && (
                        <div className={clsx(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 shadow-xs",
                          isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                        )}>
                          {opt.avatar}
                        </div>
                      )}
                      {opt.icon && <opt.icon className={clsx("w-4 h-4 shrink-0", isSelected ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600")} />}
                      <div className="truncate">
                        <div className="flex items-center gap-2 truncate">
                          <span className={clsx("truncate text-sm", isSelected ? "font-bold text-indigo-950" : "text-gray-900")}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className={clsx(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border",
                              opt.badge === 'Manager' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                              opt.badge === 'Admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            )}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.sublabel && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5 font-normal">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
