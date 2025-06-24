'use client';
import { pingApi } from '@/lib/api/ping';
import React, { useEffect } from 'react'

export default function Ping() {
    useEffect(()=>{
         pingApi();
    },[])
  return (
    <div>
      
    </div>
  )
}
