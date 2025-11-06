import type { LumaEvent, LumaService } from "./types"
import eventsData from "@/app/data/events.json"

// Implementation //

export class StaticLumaService implements LumaService {
	private events: LumaEvent[]

	constructor() {
		// Load events synchronously from JSON
		this.events = eventsData as LumaEvent[]
	}

	async listEvents(): Promise<LumaEvent[]> {
		return this.events
	}

	async getEvent(eventId: string): Promise<LumaEvent | null> {
		const event = this.events.find((e) => e.api_id === eventId)
		return event || null
	}

	async registerForEvent(eventId: string, email: string): Promise<void> {
		const event = await this.getEvent(eventId)
		if (!event) {
			throw new Error(`Event ${eventId} not found`)
		}

		// Store email in localStorage for persistence (client-side only)
		if (typeof window !== "undefined") {
			const registrations = this.getLocalRegistrations()
			registrations.push({
				event_id: eventId,
				email,
				registered_at: new Date().toISOString()
			})
			localStorage.setItem("luma_registrations", JSON.stringify(registrations))
		}

		// Redirect to Luma event page for actual registration
		if (typeof window !== "undefined") {
			window.location.href = event.url
		}
	}

	async checkRegistration(eventId: string, email: string): Promise<boolean> {
		// Always return false - we don't know if they've registered or not
		// We just track email in localStorage for one-click RSVP
		return false
	}

	private getLocalRegistrations(): Array<{
		event_id: string
		email: string
		registered_at: string
	}> {
		if (typeof window === "undefined") {
			return []
		}

		const stored = localStorage.getItem("luma_registrations")
		if (!stored) {
			return []
		}

		try {
			return JSON.parse(stored)
		} catch {
			return []
		}
	}
}
