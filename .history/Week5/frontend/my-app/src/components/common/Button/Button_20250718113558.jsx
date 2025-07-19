import React from 'react'
import './Button.css'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const className = `btn btn-${variant} btn-${size} ${disabled ? 'btn-disabled' : ''}`
  
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
