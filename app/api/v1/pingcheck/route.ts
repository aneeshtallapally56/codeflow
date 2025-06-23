import { NextRequest } from 'next/server';
import { pingCheck } from '@/lib/controllers/ping-controller';

export async function GET(req: NextRequest) {
  return pingCheck(req); 
}