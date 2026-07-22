// "use client";

// import { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// interface PasswordInputProps {
//   id?: string;
//   name?: string;
//   placeholder?: string;
//   defaultValue?: string;
//   required?: boolean;
// }

// export function PasswordInput({
//   id = "password",
//   name = "password",
//   placeholder = "Enter your password",
//   defaultValue,
//   required = true,
// }: PasswordInputProps) {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <div className="relative">
//       <Input
//         id={id}
//         name={name}
//         type={showPassword ? "text" : "password"}
//         placeholder={placeholder}
//         defaultValue={defaultValue}
//         required={required}
//         className="h-12 pr-12 rounded-xl"
//       />

//       <Button
//         type="button"
//         variant="ghost"
//         size="icon"
//         onClick={() => setShowPassword((prev) => !prev)}
//         className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
//       >
//         {showPassword ? (
//           <EyeOff className="h-5 w-5 text-slate-500" />
//         ) : (
//           <Eye className="h-5 w-5 text-slate-500" />
//         )}
//       </Button>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FloatingInput } from "./floating-input";

export function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">

      <FloatingInput
        label="Password"
        type={show ? "text" : "password"}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-white/70
          hover:text-white
        "
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

    </div>
  );
}