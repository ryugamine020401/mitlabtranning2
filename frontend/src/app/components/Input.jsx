
export function Input({label,error,className="",...props}){
    return(
        <div className="space-y-1">
            {label&&<label className="block text-sm font-medium text-gray-700">{label}</label>}
            <input
                {...props}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${error ? "border-red-500 focus:ring-red-500":"border-gray-300 focus:ring-blue-500"}
                    ${className}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}