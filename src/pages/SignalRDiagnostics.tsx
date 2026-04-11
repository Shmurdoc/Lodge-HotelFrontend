import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../lib/authContext';

interface ConnectionTest {
  status: 'pending' | 'connecting' | 'connected' | 'error';
  message: string;
  details?: string;
}

/**
 * SignalR Diagnostics Page
 * Tests real-time connection and verifies critical events
 */
const SignalRDiagnostics: React.FC = () => {
  const { user, propertyId } = useAuth();
  const [connectionTest, setConnectionTest] = useState<ConnectionTest>({
    status: 'pending',
    message: 'Ready to test',
  });
  const [eventTests, setEventTests] = useState<Record<string, ConnectionTest>>({
    RoomStatusChanged: { status: 'pending', message: 'Waiting...' },
    BookingStatusChanged: { status: 'pending', message: 'Waiting...' },
    RfidAttendanceRecorded: { status: 'pending', message: 'Waiting...' },
    PaymentConfirmed: { status: 'pending', message: 'Waiting...' },
    HousekeepingTaskUpdated: { status: 'pending', message: 'Waiting...' },
    BookingCancelled: { status: 'pending', message: 'Waiting...' },
    SystemAlert: { status: 'pending', message: 'Waiting...' },
  });
  const [receivedEvents, setReceivedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!propertyId || !user) return;

    const runTests = async () => {
      setConnectionTest({
        status: 'connecting',
        message: 'Connecting to SignalR hub...',
      });

      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl('http://localhost:7001/hubs/pms', {
            withCredentials: true,
            headers: {
              'X-Property-Id': propertyId,
            },
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
          .withHubProtocol(new signalR.JsonHubProtocol())
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Register event listeners
        const eventNames = Object.keys(eventTests);
        eventNames.forEach((eventName) => {
          connection.on(eventName, (data: any) => {
            console.log(`[SignalR] Received ${eventName}:`, data);
            setReceivedEvents((prev) => [...prev, { event: eventName, data, time: new Date() }]);
            setEventTests((prev) => ({
              ...prev,
              [eventName]: {
                status: 'connected',
                message: `Event received at ${new Date().toLocaleTimeString()}`,
                details: JSON.stringify(data).substring(0, 100),
              },
            }));
          });
        });

        // Connection events
        connection.onreconnecting(() => {
          setConnectionTest({
            status: 'connecting',
            message: 'Reconnecting...',
          });
        });

        connection.onreconnected(() => {
          setConnectionTest({
            status: 'connected',
            message: 'Reconnected successfully',
          });
        });

        connection.onclose(() => {
          setConnectionTest({
            status: 'error',
            message: 'Connection closed',
          });
        });

        // Start connection
        await connection.start();

        setConnectionTest({
          status: 'connected',
          message: 'Connected to SignalR hub successfully!',
          details: `Connected as ${user.name} (${user.role}) to property ${propertyId}`,
        });

        // Test event subscription
        console.log('[SignalR Diagnostics] Subscribing to events...');
        await connection.invoke('SubscribeToProperty', propertyId);

        // Cleanup
        return () => {
          connection.stop();
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setConnectionTest({
          status: 'error',
          message: 'Failed to connect',
          details: errorMsg,
        });
        console.error('SignalR connection error:', error);
      }
    };

    runTests();
  }, [propertyId, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-900/20 border-green-700';
      case 'connecting':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'error':
        return 'bg-red-900/20 border-red-700';
      default:
        return 'bg-gray-900/20 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">SignalR Diagnostics</h1>

        {/* Connection Status */}
        <div className={`border rounded-lg p-6 mb-8 ${getStatusColor(connectionTest.status)}`}>
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon(connectionTest.status)}
            <h2 className="text-xl font-semibold text-white">Connection Status</h2>
          </div>
          <p className="text-white mb-2">{connectionTest.message}</p>
          {connectionTest.details && (
            <p className="text-gray-400 text-sm">{connectionTest.details}</p>
          )}
        </div>

        {/* Event Tests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Event Listeners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(eventTests).map(([eventName, test]) => (
              <div
                key={eventName}
                className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(test.status)}
                  <span className="font-mono text-sm text-white">{eventName}</span>
                </div>
                <p className="text-gray-400 text-xs">{test.message}</p>
                {test.details && (
                  <p className="text-gray-500 text-xs mt-2 truncate">{test.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Received Events Log */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Received Events ({receivedEvents.length})
          </h2>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            {receivedEvents.length === 0 ? (
              <p className="text-gray-500">No events received yet. Try triggering events from the backend...</p>
            ) : (
              <div className="space-y-3">
                {receivedEvents.map((evt, idx) => (
                  <div key={idx} className="bg-gray-800 rounded p-3 border border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-sm text-green-400">{evt.event}</span>
                      <span className="text-xs text-gray-500">{evt.time.toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(evt.data, null, 2).substring(0, 300)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Instructions</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• This page connects to the SignalR hub at http://localhost:7001/hubs/pms</li>
            <li>• Make sure the backend API is running</li>
            <li>• Events will appear in the log when triggered from the backend</li>
            <li>• Check the browser console for detailed debug logs</li>
            <li>• If connection fails, verify firewall and CORS settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignalRDiagnostics;
