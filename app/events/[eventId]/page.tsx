import EventDetailClient from "./EventDetailClient"
import { lumaService } from "@/app/services/luma"

// Static Generation //

export async function generateStaticParams() {
	const events = await lumaService.listEvents()
	return events.map((event) => ({
		eventId: event.api_id
	}))
}

// Components //

export default function EventDetail() {
	return <EventDetailClient />
}
