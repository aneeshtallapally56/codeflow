// components/organisms/PingStatus.tsx
'use client';

import { usePing } from "@/hooks/api/queries/use-ping";



export default function PingStatus() {
const { isLoading, data } = usePing();


  if (isLoading) return <p>Loading...</p>;

  return <p>✅ {data.message}</p>;
}