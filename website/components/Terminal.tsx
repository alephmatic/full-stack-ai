'use client';

import React from 'react'

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const LINE1 = 'export OPENAI_API_KEY=...'
const LINE2 = `npx fsai gen "Build a clone of Twitter called StackPrompt."`

export function Terminal() {
  const [clicked, setClicked] = React.useState(false)

  return (
    <div className="gradient-border p-6 bg-black bg-opacity-80">
      <div className="flex justify-between items-center">
        <code className="font-mono text- text-gray-200 mr-4 text-left">
          <p>{LINE1}</p>
          <p className="mt-2">{LINE2}</p>
        </code>
        <button className="hover:bg-transparent hover:border-transparent" onClick={() => {
          copyText(LINE1 + '\n' + LINE2)
          setClicked(true)
        }}>
          {clicked ?
            <IconCheck className="h-5 w-5 text-gray-400 hover:text-gray-200" /> :
            <IconCopy className="h-5 w-5 text-gray-400 hover:text-gray-200" />
          }
        </button>
      </div>
    </div>
  )
}

function IconCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconCopy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}
