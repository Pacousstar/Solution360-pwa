// /src/components/PasswordInput.tsx
// ✅ Composant réutilisable pour champ mot de passe avec icône œil
'use client'

import { useState } from 'react'

interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  label?: string
  labelIcon?: React.ReactNode
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
  id = "password",
  name = "password",
  className = "",
  label,
  labelIcon
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      {label && (
        <label 
          htmlFor={id}
          className="flex items-center gap-2 text-gray-800 font-bold mb-2 text-sm"
        >
          {labelIcon}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete="current-password"
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-800 bg-white ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
