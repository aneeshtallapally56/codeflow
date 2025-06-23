import React, { useState } from 'react'
import './editor-button.css'

export default function EditorButton() {
     const [active, setActive] = useState(false);
  return (
    <button  onClick={() => setActive(!active)} className={`editor-button text-gray-600 active:text-white ${active?'bg-gray-400':'bg-gray-700'}`}>
        file.js
    </button>
  )
}
