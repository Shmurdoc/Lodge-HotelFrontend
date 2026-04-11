import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import * as api from '../lib/backendApi'

// Hook to sync store mutations with backend API
export function useBackendSync() {
  const store = useAppStore()
  
  useEffect(() => {
    // If backend is available, sync will happen automatically
    // on data mutations in the store
  }, [])
  
  return {
    // Property sync
    addProperty: async (property: any) => {
      store.addProperty(property)
      try {
        await api.propertyApi.create(property)
        console.log('Property synced to backend')
      } catch (e) {
        console.warn('Property saved locally:', e)
      }
    },
    
    updateProperty: async (id: string, data: any) => {
      store.updateProperty(id, data)
      try {
        await api.propertyApi.update(id, data)
        console.log('Property updated in backend')
      } catch (e) {
        console.warn('Property update saved locally:', e)
      }
    },
    
    // Room sync
    addRoom: async (room: any) => {
      store.addRoom(room)
      try {
        await api.roomApi.create(room)
        console.log('Room synced to backend')
      } catch (e) {
        console.warn('Room saved locally:', e)
      }
    },
    
    updateRoom: async (id: string, data: any) => {
      store.updateRoom(id, data)
      try {
        await api.roomApi.update(id, data)
        console.log('Room updated in backend')
      } catch (e) {
        console.warn('Room update saved locally:', e)
      }
    },
    
    deleteRoom: async (id: string) => {
      store.deleteRoom(id)
      try {
        await api.roomApi.update(id, { status: 'deleted' })
        console.log('Room deleted in backend')
      } catch (e) {
        console.warn('Room delete saved locally:', e)
      }
    },
    
    // Booking sync
    addBooking: async (booking: any) => {
      store.addBooking(booking)
      try {
        await api.bookingApi.create(booking)
        console.log('Booking synced to backend')
      } catch (e) {
        console.warn('Booking saved locally:', e)
      }
    },
    
    updateBooking: async (id: string, data: any) => {
      store.updateBooking(id, data)
      try {
        await api.bookingApi.update(id, data)
        console.log('Booking updated in backend')
      } catch (e) {
        console.warn('Booking update saved locally:', e)
      }
    },
    
    // Guest sync
    addGuest: async (guest: any) => {
      store.addGuest(guest)
      try {
        await api.guestApi.create(guest)
        console.log('Guest synced to backend')
      } catch (e) {
        console.warn('Guest saved locally:', e)
      }
    },
    
    updateGuest: async (id: string, data: any) => {
      store.updateGuest(id, data)
      try {
        await api.guestApi.update(id, data)
        console.log('Guest updated in backend')
      } catch (e) {
        console.warn('Guest update saved locally:', e)
      }
    },
    
    // Staff sync
    addUser: async (user: any) => {
      store.addUser(user)
      try {
        await api.staffApi.create(user)
        console.log('Staff synced to backend')
      } catch (e) {
        console.warn('Staff saved locally:', e)
      }
    },
    
    updateUser: async (id: string, data: any) => {
      store.updateUser(id, data)
      try {
        await api.staffApi.update(id, data)
        console.log('Staff updated in backend')
      } catch (e) {
        console.warn('Staff update saved locally:', e)
      }
    },
  }
}

export default useBackendSync