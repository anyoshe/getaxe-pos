// "use client";

// import { InputHTMLAttributes, useId } from "react";

// interface FloatingInputProps
//   extends InputHTMLAttributes<HTMLInputElement> {
//   label: string;
//   error?: string;
//   helperText?: string;
// }

// export function FloatingInput({
//   label,
//   error,
//   helperText,
//   className = "",
//   required,
//   disabled,
//   ...props
// }: FloatingInputProps) {
//   const id = useId();

//   const hasError = Boolean(error);

//   return (
//     <div className="space-y-2">
//       <div className="relative">
//         <input
//           id={id}
//           placeholder=" "
//           required={required}
//           disabled={disabled}
//           aria-invalid={hasError}
//           aria-describedby={
//             hasError
//               ? `${id}-error`
//               : helperText
//               ? `${id}-helper`
//               : undefined
//           }
//           className={`
//             peer
//             w-full
//             rounded-2xl
//             bg-white/10
//             backdrop-blur-md

//             px-4
//             pt-6
//             pb-2

//             text-white
//             placeholder-transparent

//             outline-none

//             border

//             transition-all
//             duration-300

//             ${
//               hasError
//                 ? `
//                   border-rose-500
//                   focus:border-rose-400
//                   focus:ring-4
//                   focus:ring-rose-500/20
//                   focus:shadow-lg
//                   focus:shadow-rose-500/20
//                 `
//                 : `
//                   border-white/20
//                   focus:border-cyan-400
//                   focus:ring-4
//                   focus:ring-cyan-500/20
//                   focus:shadow-lg
//                   focus:shadow-cyan-500/20
//                 `
//             }

//             disabled:cursor-not-allowed
//             disabled:opacity-50

//             ${className}
//           `}
//           {...props}
//         />

//         <label
//           htmlFor={id}
//           className="
//             absolute
//             left-4
//             top-4

//             pointer-events-none

//             text-white/60

//             transition-all
//             duration-300

//             peer-placeholder-shown:text-base
//             peer-placeholder-shown:top-4

//             peer-focus:-translate-y-2
//             peer-focus:text-xs
//             peer-focus:text-cyan-300

//             peer-not-placeholder-shown:-translate-y-2
//             peer-not-placeholder-shown:text-xs
//           "
//         >
//           {label}

//           {required && (
//             <span className="ml-1 text-rose-400">
//               *
//             </span>
//           )}
//         </label>
//       </div>

//       {hasError ? (
//         <p
//           id={`${id}-error`}
//           className="text-sm text-rose-400"
//         >
//           {error}
//         </p>
//       ) : helperText ? (
//         <p
//           id={`${id}-helper`}
//           className="text-sm text-white/50"
//         >
//           {helperText}
//         </p>
//       ) : null}
//     </div>
//   );
// }

"use client";

import { ComponentPropsWithRef, useId } from "react";

type FloatingInputProps = ComponentPropsWithRef<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function FloatingInput({
  label,
  error,
  helperText,
  className = "",
  required,
  disabled,
  id,
  ...props
}: FloatingInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const hasError = Boolean(error);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={inputId}
          placeholder=" "
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={`
            peer
            w-full
            rounded-2xl
            bg-white/10
            backdrop-blur-md

            px-4
            pt-6
            pb-2

            text-white
            placeholder-transparent

            outline-none

            border

            transition-all
            duration-300

            ${
              hasError
                ? `
                  border-rose-500
                  focus:border-rose-400
                  focus:ring-4
                  focus:ring-rose-500/20
                  focus:shadow-lg
                  focus:shadow-rose-500/20
                `
                : `
                  border-white/20
                  focus:border-cyan-400
                  focus:ring-4
                  focus:ring-cyan-500/20
                  focus:shadow-lg
                  focus:shadow-cyan-500/20
                `
            }

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${className}
          `}
          {...props}
        />

        <label
          htmlFor={inputId}
          className="
            absolute
            left-4
            top-4

            pointer-events-none

            text-white/60

            transition-all
            duration-300

            peer-placeholder-shown:text-base
            peer-placeholder-shown:top-4

            peer-focus:-translate-y-2
            peer-focus:text-xs
            peer-focus:text-cyan-300

            peer-not-placeholder-shown:-translate-y-2
            peer-not-placeholder-shown:text-xs
          "
        >
          {label}

          {required && (
            <span className="ml-1 text-rose-400">*</span>
          )}
        </label>
      </div>

      {hasError ? (
        <p
          id={`${inputId}-error`}
          className="text-sm text-rose-400"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="text-sm text-white/50"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}