import React from 'react'

export default function Logo() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-500"
    >
      <circle cx="25" cy="25" r="23" stroke="currentColor" strokeWidth="4" />
      <path
        d="M25 10V40M17 18H33M17 32H33"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}