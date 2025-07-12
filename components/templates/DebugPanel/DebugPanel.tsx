// Add this as a temporary debug component
// Place it inside your Editor component for testing

import React, { useState } from 'react';

interface DebugPanelProps {
  lockState: {
    requestId: string | null;
    isRequesting: boolean;
    error: string | null;
  };
  currentFilePath: string | undefined;
  isCurrentFileLocked: boolean;
  isLockedByCurrentUser: boolean;
  canEdit: boolean;
  editorSocket: { on: (event: string, callback: (data: unknown) => void) => void; off: (event: string) => void; disconnect: () => void; connect: () => void; connected?: boolean } | null;
  userId: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  lockState,
  currentFilePath,
  isCurrentFileLocked,
  isLockedByCurrentUser,
  canEdit,
  editorSocket,
  userId
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Socket event logger
  React.useEffect(() => {
    if (!editorSocket) return;

    const logEvent = (eventName: string, data: unknown) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${eventName}: ${JSON.stringify(data)}`;
      setEventLog(prev => [...prev.slice(-9), logEntry]); // Keep last 10 events
      console.log('🔍 Socket Event:', eventName, data);
    };

    const events = [
      'fileLocked',
      'fileLockedByOther', 
      'fileUnlocked',
      'lockError',
      'connect',
      'disconnect',
      'reconnect'
    ];

    events.forEach(event => {
      editorSocket.on(event, (data: unknown) => logEvent(event, data));
    });

    return () => {
      events.forEach(event => {
        editorSocket.off(event);
      });
    };
  }, [editorSocket]);

  const clearLog = () => setEventLog([]);

  const forceDisconnect = () => {
    if (editorSocket) {
      editorSocket.disconnect();
    }
  };

  const forceReconnect = () => {
    if (editorSocket && !editorSocket.connected) {
      editorSocket.connect();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-purple-500 text-white px-3 py-1 rounded text-xs z-50"
        title="Show Debug Panel"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-md text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-purple-300">🐛 Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Current State */}
      <div className="space-y-1 mb-3">
        <div className="text-yellow-300 font-semibold">Current State:</div>
        <div>File: <span className="text-green-300">{currentFilePath || 'None'}</span></div>
        <div>User ID: <span className="text-blue-300">{userId}</span></div>
        <div>Socket: <span className={editorSocket?.connected ? 'text-green-300' : 'text-red-300'}>
          {editorSocket?.connected ? 'Connected' : 'Disconnected'}
        </span></div>
        <div>Locked: <span className={isCurrentFileLocked ? 'text-red-300' : 'text-green-300'}>
          {isCurrentFileLocked ? 'Yes' : 'No'}
        </span></div>
        <div>By Me: <span className={isLockedByCurrentUser ? 'text-green-300' : 'text-red-300'}>
          {isLockedByCurrentUser ? 'Yes' : 'No'}
        </span></div>
        <div>Can Edit: <span className={canEdit ? 'text-green-300' : 'text-red-300'}>
          {canEdit ? 'Yes' : 'No'}
        </span></div>
      </div>

      {/* Lock State */}
      <div className="space-y-1 mb-3">
        <div className="text-yellow-300 font-semibold">Lock State:</div>
        <div>Requesting: <span className={lockState.isRequesting ? 'text-orange-300' : 'text-gray-400'}>
          {lockState.isRequesting ? 'Yes' : 'No'}
        </span></div>
        <div>Request ID: <span className="text-purple-300">
          {lockState.requestId || 'None'}
        </span></div>
        <div>Error: <span className="text-red-300">
          {lockState.error || 'None'}
        </span></div>
      </div>

      {/* Controls */}
      <div className="space-y-1 mb-3">
        <div className="text-yellow-300 font-semibold">Test Controls:</div>
        <div className="flex gap-1">
          <button
            onClick={forceDisconnect}
            className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
            disabled={!editorSocket?.connected}
          >
            Disconnect
          </button>
          <button
            onClick={forceReconnect}
            className="bg-green-600 px-2 py-1 rounded text-xs hover:bg-green-700"
            disabled={editorSocket?.connected}
          >
            Reconnect
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="text-yellow-300 font-semibold">Socket Events:</div>
          <button
            onClick={clearLog}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear
          </button>
        </div>
        <div className="bg-black p-2 rounded max-h-32 overflow-y-auto">
          {eventLog.length === 0 ? (
            <div className="text-gray-500">No events yet...</div>
          ) : (
            eventLog.map((event, index) => (
              <div key={index} className="text-xs break-all">
                {event}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};