import { NextRequest ,NextResponse} from 'next/server';
import { createProject } from '@/lib/controllers/project-controller';

export async function POST(req: NextRequest , res: NextResponse) {
  return createProject(req , res); 
}