
export function Button({ variant = "primary", disabled, children, className = "", ...props }) {
    return (
      <button
        {...props}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-medium transition-colors
          ${
            disabled
              ? "bg-gray-400 text-gray-600 cursor-not-allowed" // 禁用樣式
              : variant === "primary"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }
          ${className}`}
      >
        {children}
      </button>
    )
  }
  
  