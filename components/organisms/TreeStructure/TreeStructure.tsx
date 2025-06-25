'use client'

import { TreeNode } from '@/components/molecules/TreeNode/TreeNode';
import { useTreeStructureStore } from '@/lib/store/treeStructureStore';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function TreeStructure() {
  const { treeStructure, setTreeStructure, setProjectId, projectId } = useTreeStructureStore();

  const rawProjectId = useParams().id;
  const projectId1 = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  useEffect(() => {
    if (projectId1 && projectId !== projectId1) {
      setProjectId(projectId1);
      setTreeStructure();
    }
  }, [projectId1, projectId, setProjectId, setTreeStructure]);

  return (
    <div className="h-screen border-r border-gray-700 overflow-y-auto" style={{backgroundColor: '#1E1E1E'}}>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
          Explorer
        </h3>
        <div className="space-y-0.5">
          {treeStructure ? (
            <TreeNode fileFolderData={treeStructure} />
          ) : (
            <div className="px-2 py-8 text-center">
              <p className="text-sm text-gray-500">Loading project structure...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}