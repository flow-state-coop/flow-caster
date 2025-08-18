import { ReactNode } from "react";

interface BaseButtonProps {
  children: ReactNode;
}

export default function BaseButton({
  children,
  ...props
}: React.ComponentProps<"button"> & BaseButtonProps) {
  const { disabled, className } = props;
  const getButtonClass = () => {
    const baseClass =
      "w-full px-4 py-3 rounded-lg text-white font-bold text-base transition-colors";

    if (disabled) {
      return `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed`;
    }

    return `${baseClass} bg-accent-800 hover:bg-accent-600 ${className}`;
  };
  return (
    <button {...props} className={getButtonClass()}>
      {children}
    </button>
  );
}
