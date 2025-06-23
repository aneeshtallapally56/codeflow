

import { NextRequest, NextResponse } from 'next/server';
import util from 'util';
import child_process from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const execPromise = util.promisify(child_process.exec);

export async function createProject(req: NextRequest , res: NextResponse) {
 //step1: create a unique id and then inside the projects folder create a new folder with that id
 
}
