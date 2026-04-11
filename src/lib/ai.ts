import { supabase } from './supabase'

const GPT_API_KEY = import.meta.env.VITE_GPT_API_KEY || ''
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001'

// Types for AI services
interface GuestContext {
  name: string
  preferences: string[]
  loyaltyPoints: number
  vipLevel: string
  previousStays: number
}

interface RevenueContext {
  propertyId: string
  currentOccupancy: number
  adr: number
  competitorRates: number[]
  upcomingBookings: number
  season: string
}

interface MaintenanceContext {
  equipmentId: string
  equipmentType: string
  lastMaintenance: string
  usageHours: number
  failureHistory: string[]
}

// AI Concierge - Guest Service Assistant
export async function askAIConcierge(
  prompt: string, 
  guestContext: GuestContext,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const systemMessage = `You are a professional 5-star hotel concierge AI assistant named "Safari Assistant". 
You help guests with:
- Restaurant reservations and recommendations
- Room service orders
- Spa and wellness bookings
- Activity and excursion recommendations
- Transportation arrangements
- Local area information and attractions
- Special requests and preferences

Guest context:
- Name: ${guestContext.name}
- VIP Level: ${guestContext.vipLevel}
- Loyalty Points: ${guestContext.loyaltyPoints}
- Previous Stays: ${guestContext.previousStays}
- Preferences: ${guestContext.preferences.join(', ') || 'None specified'}

Always be polite, professional, and anticipate guest needs. Provide personalized recommendations based on their preferences.`

  const messages = [
    { role: 'system', content: systemMessage },
    ...conversationHistory,
    { role: 'user', content: prompt }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage
    }
  } catch (error) {
    console.error('AI Concierge error:', error)
    return {
      success: false,
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
      error
    }
  }
}

// Revenue Optimization AI
export async function getRevenueRecommendation(revenueContext: RevenueContext) {
  const prompt = `Analyze the following hotel revenue data and provide pricing recommendations:

Current Metrics:
- Occupancy Rate: ${revenueContext.currentOccupancy}%
- Average Daily Rate (ADR): R${revenueContext.adr}
- Competitor ADR Range: R${revenueContext.competitorRates.join(', ')}
- Upcoming Bookings: ${revenueContext.upcomingBookings}
- Season: ${revenueContext.season}

Please provide:
1. Recommended ADR adjustment (percentage)
2. Optimal pricing strategy
3. Key insights and reasoning`

  const messages = [
    { role: 'system', content: 'You are a revenue management expert specializing in hotel dynamic pricing. Provide data-driven recommendations in South African Rand (ZAR).' },
    { role: 'user', content: prompt }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.3,
        max_tokens: 300
      })
    })

    const data = await response.json()
    return {
      success: true,
      recommendation: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Revenue AI error:', error)
    return { success: false, error }
  }
}

// Predictive Maintenance AI
export async function predictMaintenanceIssues(maintenanceContext: MaintenanceContext) {
  const prompt = `Analyze the following equipment data and predict maintenance needs:

Equipment:
- ID: ${maintenanceContext.equipmentId}
- Type: ${maintenanceContext.equipmentType}
- Last Maintenance: ${maintenanceContext.lastMaintenance}
- Usage Hours: ${maintenanceContext.usageHours}
- Failure History: ${maintenanceContext.failureHistory.join(', ') || 'None'}

Please provide:
1. Risk assessment (low/medium/high)
2. Predicted days until next maintenance
3. Recommended actions`

  const messages = [
    { role: 'system', content: 'You are a predictive maintenance AI expert for hotel equipment. Provide actionable insights.' },
    { role: 'user', content: prompt }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.2,
        max_tokens: 250
      })
    })

    const data = await response.json()
    return {
      success: true,
      prediction: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Maintenance AI error:', error)
    return { success: false, error }
  }
}

// Guest Feedback Sentiment Analysis
export async function analyzeGuestFeedback(feedback: string) {
  const messages = [
    { role: 'system', content: 'You are a sentiment analysis expert for hotel guest feedback. Analyze the feedback and provide: 1) Sentiment (positive/negative/neutral), 2) Key themes, 3) Actionable insights for management.' },
    { role: 'user', content: feedback }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.1,
        max_tokens: 200
      })
    })

    const data = await response.json()
    return {
      success: true,
      analysis: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Feedback AI error:', error)
    return { success: false, error }
  }
}

// Staff Scheduling AI
export async function optimizeStaffSchedule(
  propertyId: string,
  expectedOccupancy: number,
  currentStaff: number,
  date: string
) {
  const prompt = `Provide staff scheduling recommendations for a hotel property:

- Date: ${date}
- Expected Occupancy: ${expectedOccupancy}%
- Current Staff Count: ${currentStaff}
- Property ID: ${propertyId}

Please suggest:
1. Optimal staff count
2. Department breakdown (housekeeping, front desk, F&B)
3. Key considerations`

  const messages = [
    { role: 'system', content: 'You are a hotel staffing optimization AI expert. Provide practical shift scheduling recommendations based on occupancy levels.' },
    { role: 'user', content: prompt }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.3,
        max_tokens: 250
      })
    })

    const data = await response.json()
    return {
      success: true,
      schedule: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Scheduling AI error:', error)
    return { success: false, error }
  }
}

// Generate automated response to guest inquiry
export async function generateAutoResponse(guestInquiry: string, guestContext: GuestContext) {
  const messages = [
    { role: 'system', content: `You are a hotel guest service AI. Generate a professional, personalized response to the guest inquiry. Guest: ${guestContext.name}, VIP: ${guestContext.vipLevel}` },
    { role: 'user', content: guestInquiry }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.5,
        max_tokens: 200
      })
    })

    const data = await response.json()
    return {
      success: true,
      response: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Auto-response AI error:', error)
    return { success: false, error }
  }
}

export default {
  askAIConcierge,
  getRevenueRecommendation,
  predictMaintenanceIssues,
  analyzeGuestFeedback,
  optimizeStaffSchedule,
  generateAutoResponse
}
