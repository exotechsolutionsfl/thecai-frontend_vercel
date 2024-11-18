import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    className={`px-4 py-2 rounded ${
      props.disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-600'
    } text-white`}
    {...props}
  >
    {children}
  </button>
)