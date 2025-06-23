'use client'
import React from 'react'
import Navbar from '../molecules/Navbar'
import HeroCTA from '../atoms/HeroCTA'

export default function HomeTemplate() {
  return (
  <div className="overflow-hidden w-full relative">
  <div className="w-[100%] absolute top-[-40vh] h-[80vh] bg-gradient-to-r from-[#101010] via-[#1f2027] to-[#101010] rounded-full left-1/2 -translate-x-1/2 blur-[100px]" />
<Navbar />
  <div className="relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 md:pt-10 pt-20 pb-6 text-center relative z-10">
      
      {/* Debugging Button */}
      <div className="relative inline-block md:mb-6 mb-4 overflow-hidden rounded-full">
        <button className="px-4 py-2 rounded-full bg-[#202020] text-zinc-300 text-sm font-semibold relative border border-zinc-700">
          ✨ AI-Powered Debugging
        </button>
      </div>

      {/* Hero Heading */}
      <h1 className="text-5xl lg:text-[80px] leading-none font-extrabold capitalize tracking-tight text-zinc-300 mb-4">
        AI-Powered <br />Collaborative <span className="text-[#4F7CFF]">Coding</span>
      </h1>

      {/* Description */}
      <p className="text-zinc-500 md:text-lg mb-12 max-w-2xl mx-auto">
        Supercharge your collaborative development with real-time AI assistance, instant debugging, and seamless teamwork — all in one powerful platform.<br/>
        Built and crafted with precision by Aneesh Tallapally. See his Portfolio
      </p>

      {/* CTA Button */}
    
     <HeroCTA />

    </div>
  </div>
</div>
  )
}
