export function Button({ children, className, ...props }) {
  return (
    <button className={`rounded-full bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700 ${className}`} {...props}>
      {children}
    </button>
  );
}
