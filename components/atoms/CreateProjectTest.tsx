'use client'
import { useCreateProject } from '@/hooks/api/mutations/useCreateProject'
import React from 'react'

export default function CreateProjectTest() {
    const {createProjectMutation , isPending} = useCreateProject();
    async function handleCreateProject() {
        console.log('going to trigger the api')
        try {
            await createProjectMutation({ name: 'sandbox' });
            
            console.log('redirect to the editor')
        } catch (error) {
            console.error('Error creating project:', error);
        }
    }
  return (
    <div>
      <h1 className='text-white'>Create Project</h1>
      <button className="text-white"onClick={handleCreateProject}>create</button>
        {isPending && <p>Creating project...</p>}
        {/* Add more UI elements as needed */}
    </div>
  )
}
