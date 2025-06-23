
import uuid4 from 'uuid4';
import { NextRequest, NextResponse } from 'next/server';
import util from 'util';
import child_process from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const execPromise = util.promisify(child_process.exec);

export async function createProject(req: NextRequest , res: NextResponse) {
  try {

    const projectId = uuid4();
    console.log('new project id:', projectId);


    const projectPath = path.join(process.cwd(), 'generated-projects', projectId);
    await fs.mkdir(projectPath, { recursive: true });


    const response = await execPromise('npm create vite@latest sandbox -- --template react-ts --yes',{
        cwd: projectPath,
    })

    return NextResponse.json({
      message: 'Project directory created successfully',
      projectId,
      path: projectPath,
    }, { status: 201 });

  } catch (error) {
    const err = error as Error;
    console.error('Error creating project folder:', err.message);
    return NextResponse.json({
      error: err.message || 'Failed to create project directory'
    }, { status: 500 });
  }
}
 

