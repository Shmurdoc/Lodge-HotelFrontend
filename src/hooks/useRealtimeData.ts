import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

// Real-time hook that manages SignalR connections for live data updates
// Connects to backend at http://localhost:7001/hubs/pms
export const useRealtimeData = (propertyId: string | null) => {
  const connectionRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  // Get store update functions
  const updateRoom = useAppStore((state) => state.updateRoom);
  const updateBooking = useAppStore((state) => state.updateBooking);
  const addAttendance = useAppStore((state) => state.addAttendance);
  const updateRfidTag = useAppStore((state) => state.updateRfidTag);
  const addMessage = useAppStore((state) => state.addMessage);

  // Initialize SignalR connection
  const initializeConnection = useCallback(async () => {
    if (!propertyId) return;

    try {
      // Dynamically import SignalR only when needed
      const signalR = await import('@microsoft/signalr');

      const connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:7001/hubs/pms', {
          withCredentials: true,
          headers: {
            'X-Property-Id': propertyId,
          },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      // ============================================
      // EVENT LISTENERS
      // ============================================

      // Room Status Changed (CRITICAL - <500ms)
      connection.on('RoomStatusChanged', (data: any) => {
        console.log('[SignalR] Room status changed:', data);
        updateRoom(data.roomId, {
          status: data.newStatus,
          lastCleaned: data.lastCleaned,
          lastInspected: data.lastInspected,
        });
      });

      // Booking Status Changed (CRITICAL - <1s)
      connection.on('BookingStatusChanged', (data: any) => {
        console.log('[SignalR] Booking status changed:', data);
        updateBooking(data.bookingId, {
          status: data.newStatus,
          paymentStatus: data.paymentStatus,
        });
      });

      // RFID Attendance Recorded (CRITICAL - <1s)
      connection.on('RfidAttendanceRecorded', (data: any) => {
        console.log('[SignalR] RFID attendance recorded:', data);
        addAttendance({
          id: data.attendanceId,
          userId: data.userId,
          userName: data.userName,
          checkIn: data.checkIn,
          date: new Date().toISOString().split('T')[0],
          status: 'present',
        });
        updateRfidTag(data.tagId, {
          lastUsed: data.timestamp,
        });
      });

      // Payment Confirmed (CRITICAL - <1s)
      connection.on('PaymentConfirmed', (data: any) => {
        console.log('[SignalR] Payment confirmed:', data);
        // Update booking payment status
        updateBooking(data.bookingId, {
          paymentStatus: 'paid',
        });
        // Notify team
        addMessage({
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          content: `Payment confirmed for booking ${data.bookingId}: ${data.amount} ${data.currency}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'alert',
        });
      });

      // Housekeeping Task Updated (HIGH - 2-5s)
      connection.on('HousekeepingTaskUpdated', (data: any) => {
        console.log('[SignalR] Housekeeping task updated:', data);
        // Update room status
        if (data.roomId) {
          updateRoom(data.roomId, {
            status: data.roomStatus,
          });
        }
      });

      // Booking Cancelled Event
      connection.on('BookingCancelled', (data: any) => {
        console.log('[SignalR] Booking cancelled:', data);
        updateBooking(data.bookingId, {
          status: 'cancelled',
        });
      });

      // System Alerts
      connection.on('SystemAlert', (data: any) => {
        console.log('[SignalR] System alert:', data);
        addMessage({
          id: `alert-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          content: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'alert',
        });
      });

      // Connection state handlers
      connection.onreconnecting(() => {
        console.log('[SignalR] Attempting to reconnect...');
        reconnectAttempts.current += 1;
      });

      connection.onreconnected(() => {
        console.log('[SignalR] Reconnected successfully');
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
      });

      connection.onclose(() => {
        console.log('[SignalR] Connection closed');
        connectionRef.current = null;
      });

      // Start connection
      await connection.start();
      console.log('[SignalR] Connected to PMS hub');

      // Join property group for scoped updates
      await connection.invoke('JoinPropertyGroup', propertyId);
      console.log('[SignalR] Joined property group:', propertyId);

      connectionRef.current = connection;
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);

      // Exponential backoff retry
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);

        console.log(
          `[SignalR] Retrying in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
        );

        setTimeout(() => {
          initializeConnection();
        }, delay);
      } else {
        console.error('[SignalR] Max reconnection attempts reached');
      }
    }
  }, [propertyId, updateRoom, updateBooking, addAttendance, updateRfidTag, addMessage]);

  // Cleanup on unmount or property change
  useEffect(() => {
    initializeConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .then(() => {
            console.log('[SignalR] Disconnected gracefully');
          })
          .catch((err: any) => {
            console.error('[SignalR] Error disconnecting:', err);
          });
      }
    };
  }, [initializeConnection]);

  // Expose connection for manual operations if needed
  return {
    connection: connectionRef.current,
    isConnected: connectionRef.current?.state === 'Connected',
    invoke: async (methodName: string, ...args: any[]) => {
      if (connectionRef.current?.state === 'Connected') {
        return connectionRef.current.invoke(methodName, ...args);
      }
      console.warn(`[SignalR] Cannot invoke ${methodName}: connection not active`);
    },
  };
};

// Hook for listening to specific real-time events
export const useRealtimeEvent = (eventName: string, callback: (data: any) => void) => {
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    // Would attach to existing connection in a real implementation
    // For now, we register the callback with the global SignalR instance
  }, [eventName, callback]);

  return {
    emit: async (data: any) => {
      // Manual event emission for testing/triggering
      if (connectionRef.current) {
        await connectionRef.current.invoke('SendEvent', eventName, data);
      }
    },
  };
};

// Hook for room status real-time updates (most critical)
export const useRoomRealtimeStatus = (roomId: string | null) => {
  const updateRoom = useAppStore((state) => state.updateRoom);
  const room = useAppStore((state) =>
    state.rooms.find((r) => r.id === roomId)
  );

  useEffect(() => {
    if (!roomId) return;

    // Setup specific room status listener
    // This would connect to a SignalR group for the specific room
  }, [roomId, updateRoom]);

  return { room };
};

// Hook for occupancy real-time updates
export const useOccupancyRealtime = (propertyId: string | null) => {
  const rooms = useAppStore((state) => state.rooms);
  const occupiedCount = rooms.filter((r) => r.propertyId === propertyId && r.status === 'occupied').length;
  const availableCount = rooms.filter((r) => r.propertyId === propertyId && r.status === 'available').length;
  const cleaningCount = rooms.filter((r) => r.propertyId === propertyId && r.status === 'cleaning').length;
  const maintenanceCount = rooms.filter((r) => r.propertyId === propertyId && r.status === 'maintenance').length;

  return {
    occupied: occupiedCount,
    available: availableCount,
    cleaning: cleaningCount,
    maintenance: maintenanceCount,
    total: occupiedCount + availableCount + cleaningCount + maintenanceCount,
    occupancyRate: rooms.length > 0 ? (occupiedCount / rooms.length) * 100 : 0,
  };
};

// Hook for revenue real-time updates
export const useRevenueRealtime = (propertyId: string | null) => {
  const bookings = useAppStore((state) => state.bookings);
  const propertyBookings = bookings.filter((b) => b.propertyId === propertyId);

  const totalRevenue = propertyBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const paidRevenue = propertyBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingRevenue = propertyBookings
    .filter((b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partial')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  return {
    total: totalRevenue,
    paid: paidRevenue,
    pending: pendingRevenue,
    paidPercentage: totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0,
  };
};
