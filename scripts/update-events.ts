#!/usr/bin/env node

/**
 * Script to scrape events from Luma calendar and update events.json
 *
 * This script:
 * 1. Scrapes upcoming events from https://lu.ma/DEVxNetwork
 * 2. Scrapes past events by clicking the "Past" filter
 * 3. Attempts to pull authoritative dates from the manage timeline
 * 4. Visits individual event pages to get additional details
 * 5. Combines and deduplicates events
 * 6. Supports --cookie="LUMA_SESSION=..." (or LUMA_MANAGE_COOKIE env var) for authenticated timeline access
 *
 * To refresh the dataset, delete app/data/events.json (or individual entries) and rerun the script.
 */

import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer"
import type { LumaEvent, LumaLocation } from "@/app/services/luma/types"

const PROJECT_ROOT = join(process.cwd())
const EVENTS_FILE = join(PROJECT_ROOT, "app/data/events.json")

// Constants
const PUBLIC_CALENDAR_URL = "https://lu.ma/DEVxNetwork"
const CALENDAR_MANAGE_URL = "https://luma.com/calendar/manage/cal-XOMDXT4v9EMe4yb"
const DEFAULT_TIMEZONE = "America/Los_Angeles"

let manageCalendarCookie = process.env.LUMA_MANAGE_COOKIE || null

const MONTH_NAMES = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december"
]
const MONTH_ABBREVIATIONS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec"
]

type TimelineEntry = {
	start_at?: string
	end_at?: string
	timezone?: string
}

type Coordinates = {
	lat: number
	lng: number
}

type ScrapedLocation = LumaLocation

type RawScrapedEvent = {
	api_id: string | null
	name: string
	description: string
	description_html?: string
	start_at: string | null
	end_at: string | null
	location: ScrapedLocation | null
	cover_url: string | null
	url: string
	guest_count: number
	visibility: "public" | "private"
	timezone?: string
}

const US_STATE_ABBREVIATIONS = {
	alabama: "AL",
	alaska: "AK",
	arizona: "AZ",
	arkansas: "AR",
	california: "CA",
	colorado: "CO",
	connecticut: "CT",
	delaware: "DE",
	"district of columbia": "DC",
	florida: "FL",
	georgia: "GA",
	hawaii: "HI",
	idaho: "ID",
	illinois: "IL",
	indiana: "IN",
	iowa: "IA",
	kansas: "KS",
	kentucky: "KY",
	louisiana: "LA",
	maine: "ME",
	maryland: "MD",
	massachusetts: "MA",
	michigan: "MI",
	minnesota: "MN",
	mississippi: "MS",
	missouri: "MO",
	montana: "MT",
	nebraska: "NE",
	nevada: "NV",
	"new hampshire": "NH",
	"new jersey": "NJ",
	"new mexico": "NM",
	"new york": "NY",
	"north carolina": "NC",
	"north dakota": "ND",
	ohio: "OH",
	oklahoma: "OK",
	oregon: "OR",
	pennsylvania: "PA",
	"rhode island": "RI",
	"south carolina": "SC",
	"south dakota": "SD",
	tennessee: "TN",
	texas: "TX",
	utah: "UT",
	vermont: "VT",
	virginia: "VA",
	washington: "WA",
	"west virginia": "WV",
	wisconsin: "WI",
	wyoming: "WY",
	"puerto rico": "PR"
}

/**
 * Extract event ID from URL
 */
function extractEventId(url: string) {
	const match = url.match(/\/evt-([a-z0-9]+)/) || url.match(/\/([a-z0-9]{8,})$/i)
	if (match) {
		const id = match[1]
		return id.startsWith("evt-") ? id : `evt-${id}`
	}
	return null
}

function isDST(monthIndex: number) {
	return monthIndex >= 2 && monthIndex <= 10
}

function toIsoFromLocal(
	year: number,
	monthIndex: number,
	day: number,
	hour: number,
	minute: number
) {
	const offsetHours = isDST(monthIndex) ? 7 : 8
	const date = new Date(Date.UTC(year, monthIndex, day, hour + offsetHours, minute, 0, 0))
	return date.toISOString()
}

function parseTimelineText(text: string): TimelineEntry | null {
	if (!text) {
		return null
	}

	const cleaned = text
		.replace(/This event ended.*?ago\.?/gi, " ")
		.replace(/\s+/g, " ")
		.trim()

	const dateMatch = cleaned.match(
		/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)?,?\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s*(\d{4})/i
	)

	if (!dateMatch) {
		return null
	}

	const monthName = dateMatch[2].toLowerCase()
	let monthIndex = MONTH_NAMES.indexOf(monthName)
	if (monthIndex === -1) {
		monthIndex = MONTH_ABBREVIATIONS.indexOf(monthName)
	}

	if (monthIndex === -1) {
		return null
	}

	const day = parseInt(dateMatch[3], 10)
	const year = parseInt(dateMatch[4], 10)

	const timeRangeRegex =
		/(\d{1,2}:\d{2})\s*(AM|PM)(?:\s*(?:PT|PST|PDT))?\s*(?:[-–]\s*(\d{1,2}:\d{2})\s*(AM|PM)(?:\s*(?:PT|PST|PDT))?)?/i
	const rangeMatch = cleaned.match(timeRangeRegex)

	let startHour = 9
	let startMinute = 0
	let endHour = null
	let endMinute = null

	if (rangeMatch) {
		const [startTime, startPeriod] = [rangeMatch[1], rangeMatch[2]]
		const [sHour, sMinute] = startTime.split(":").map((value: string) => parseInt(value, 10))
		startHour = (sHour % 12) + (startPeriod.toUpperCase() === "PM" ? 12 : 0)
		startMinute = sMinute

		if (rangeMatch[3] && rangeMatch[4]) {
			const [endTime, endPeriod] = [rangeMatch[3], rangeMatch[4]]
			const [eHourRaw, eMinuteRaw] = endTime.split(":").map((value: string) => parseInt(value, 10))
			endHour = (eHourRaw % 12) + (endPeriod.toUpperCase() === "PM" ? 12 : 0)
			endMinute = eMinuteRaw
		}
	} else {
		// Fallback: look for single time such as "12:00 PM"
		const singleTimeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*(?:PT|PST|PDT))?/i)
		if (singleTimeMatch) {
			const hour = parseInt(singleTimeMatch[1], 10)
			startMinute = parseInt(singleTimeMatch[2], 10)
			const period = singleTimeMatch[3].toUpperCase()
			startHour = (hour % 12) + (period === "PM" ? 12 : 0)
		}
	}

	const startIso = toIsoFromLocal(year, monthIndex, day, startHour, startMinute)

	let endIso = null

	if (endHour !== null && endMinute !== null) {
		let computedEndHour = endHour
		let computedEndMinute = endMinute
		let computedDay = day

		if (
			computedEndHour < startHour ||
			(computedEndHour === startHour && computedEndMinute < startMinute)
		) {
			computedDay += 1
		}

		endIso = toIsoFromLocal(year, monthIndex, computedDay, computedEndHour, computedEndMinute)
	} else {
		const tentative = new Date(startIso)
		tentative.setUTCHours(tentative.getUTCHours() + 4)
		endIso = tentative.toISOString()
	}

	return {
		start_at: startIso,
		end_at: endIso,
		timezone: DEFAULT_TIMEZONE
	}
}

/**
 * Scrape event details from individual event page
 */
async function scrapeEventPage(
	page: Page,
	eventUrl: string,
	isPastEvent = false,
	timelineOverride: TimelineEntry | null = null
): Promise<LumaEvent | null> {
	let rawEvent: RawScrapedEvent | null = null

	try {
		console.log(`  Scraping event: ${eventUrl}`)
		await page.goto(eventUrl, { waitUntil: "networkidle2", timeout: 30000 })

		// Wait for page to load
		await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {})
		// Wait for date/time content to appear
		await page
			.waitForFunction(
				() => {
					const text = document.body.textContent || ""
					return (
						text.includes("Sunday") ||
						text.includes("Monday") ||
						text.includes("Tuesday") ||
						text.includes("Wednesday") ||
						text.includes("Thursday") ||
						text.includes("Friday") ||
						text.includes("Saturday") ||
						text.includes("November") ||
						text.includes("December") ||
						text.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)
					)
				},
				{ timeout: 5000 }
			)
			.catch(() => {})
		// Wait a bit more for dynamic content to fully render
		await new Promise((resolve) => setTimeout(resolve, 1000))

		rawEvent = await page.evaluate(
			(isPast: boolean, defaultTimezone: string): RawScrapedEvent | null => {
				// Extract event ID from URL
				const url = window.location.href
				const eventIdMatch = url.match(/\/([a-z0-9]{8,})$/i)
				const apiId = eventIdMatch ? `evt-${eventIdMatch[1]}` : null

				// Extract name
				const nameElement = document.querySelector("h1")
				const name = nameElement?.textContent?.trim() || "Untitled Event"

				// Extract cover image
				const coverImg = document.querySelector("img[alt*='Cover'], img[alt*='cover']")
				const coverUrl = coverImg?.getAttribute("src") || coverImg?.getAttribute("data-src") || null

				// Extract date/time - prefer structured data when available
				let startAt = null
				let endAt = null
				let timezone = defaultTimezone
				let structuredLocationCandidate: any = null
				let structuredAddressCandidate: any = null
				let structuredGeoCandidate: any = null
				let structuredLocationType: any = null
				let structuredLocationName: any = null

				const parseCoordinate = (value: any) => {
					if (typeof value === "number" && Number.isFinite(value)) return value
					if (typeof value === "string") {
						const num = parseFloat(value)
						return Number.isNaN(num) ? null : num
					}
					return null
				}

				try {
					const ldScripts = Array.from(
						document.querySelectorAll("script[type='application/ld+json']")
					)
					const dateInfo = { start: null, end: null }

					const captureLocation = (loc: any) => {
						if (!loc || typeof loc !== "object") {
							return
						}
						if (!structuredLocationCandidate) structuredLocationCandidate = loc
						if (!structuredLocationType && typeof loc["@type"] === "string")
							structuredLocationType = loc["@type"]
						if (!structuredLocationName && typeof loc.name === "string")
							structuredLocationName = loc.name
						const addrCandidate =
							loc.address && typeof loc.address === "object" ? loc.address : null
						if (addrCandidate && !structuredAddressCandidate)
							structuredAddressCandidate = addrCandidate
						const geoCandidate = loc.geo && typeof loc.geo === "object" ? loc.geo : null
						if (geoCandidate && !structuredGeoCandidate) structuredGeoCandidate = geoCandidate
						if (!timezone && typeof loc.timezone === "string") {
							timezone = loc.timezone
						}
					}

					const processNode = (node: any) => {
						if (!node || typeof node !== "object") {
							return
						}

						if (!dateInfo.start && typeof node.startDate === "string") {
							dateInfo.start = node.startDate
						}
						if (!dateInfo.end && typeof node.endDate === "string") {
							dateInfo.end = node.endDate
						}
						if (!timezone && typeof node.timezone === "string") {
							timezone = node.timezone
						}

						if (node.location) {
							if (Array.isArray(node.location)) {
								node.location.forEach(captureLocation)
							} else {
								captureLocation(node.location)
							}
						}

						if (typeof node["@type"] === "string") {
							const typeLower = node["@type"].toLowerCase()
							if (typeLower === "place" || typeLower === "virtuallocation") {
								captureLocation(node)
							}
						}

						const nestedKeys = ["@graph", "event", "events", "itemListElement"]
						nestedKeys.forEach((key) => {
							const value = node[key]
							if (!value) {
								return
							}
							if (Array.isArray(value)) {
								value.forEach(processNode)
							} else if (typeof value === "object") {
								processNode(value)
							}
						})
					}

					ldScripts.forEach((script) => {
						try {
							const text = script.textContent || ""
							if (!text.trim()) {
								return
							}
							const parsed = JSON.parse(text)
							if (Array.isArray(parsed)) {
								parsed.forEach(processNode)
							} else {
								processNode(parsed)
							}
						} catch {
							// Ignore malformed JSON-LD blocks
						}
					})

					if (dateInfo.start) {
						try {
							startAt = new Date(dateInfo.start).toISOString()
						} catch {
							// Ignore invalid values
						}
					}
					if (dateInfo.end) {
						try {
							endAt = new Date(dateInfo.end).toISOString()
						} catch {
							// Ignore invalid values
						}
					}

					if (!startAt) {
						const metaStart = document.querySelector<HTMLMetaElement>(
							"meta[property='og:start_time'], meta[name='start_time']"
						)
						if (metaStart?.content) {
							try {
								startAt = new Date(metaStart.content).toISOString()
							} catch {
								// Ignore invalid values
							}
						}
					}

					if (!endAt) {
						const metaEnd = document.querySelector<HTMLMetaElement>(
							"meta[property='og:end_time'], meta[name='end_time']"
						)
						if (metaEnd?.content) {
							try {
								endAt = new Date(metaEnd.content).toISOString()
							} catch {
								// Ignore invalid values
							}
						}
					}

					if (!endAt && startAt) {
						const fallbackEnd = new Date(startAt)
						fallbackEnd.setUTCHours(fallbackEnd.getUTCHours() + 4)
						endAt = fallbackEnd.toISOString()
					}
				} catch (error) {
					console.warn("Failed to parse date:", error)
				}

				// Extract location
				let location: LumaLocation | null = null
				const locationElement = document.querySelector<HTMLElement>(
					"[class*='location'], [class*='Location'], a[href*='maps']"
				)
				let domLocationText = null
				let domAddress = null
				let domCity = null
				let domState = null
				let domCoordinates = null

				if (structuredLocationCandidate || structuredAddressCandidate) {
					const addressObj =
						structuredAddressCandidate ||
						(structuredLocationCandidate && typeof structuredLocationCandidate.address === "object"
							? structuredLocationCandidate.address
							: null)
					const streetAddress =
						typeof addressObj?.streetAddress === "string" ? addressObj.streetAddress.trim() : ""
					const cityFromStructured =
						typeof addressObj?.addressLocality === "string" ? addressObj.addressLocality.trim() : ""
					const stateFromStructured =
						typeof addressObj?.addressRegion === "string" ? addressObj.addressRegion.trim() : ""
					let latFromStructured = null
					let lngFromStructured = null

					if (structuredGeoCandidate) {
						if (structuredGeoCandidate.latitude !== undefined) {
							latFromStructured = parseCoordinate(structuredGeoCandidate.latitude)
						} else if (structuredGeoCandidate.lat !== undefined) {
							latFromStructured = parseCoordinate(structuredGeoCandidate.lat)
						}
						if (structuredGeoCandidate.longitude !== undefined) {
							lngFromStructured = parseCoordinate(structuredGeoCandidate.longitude)
						} else if (structuredGeoCandidate.lng !== undefined) {
							lngFromStructured = parseCoordinate(structuredGeoCandidate.lng)
						}
					}

					const addressParts = []
					if (streetAddress) addressParts.push(streetAddress)
					const cityStateCombo = [cityFromStructured, stateFromStructured]
						.filter(Boolean)
						.join(", ")
					if (cityStateCombo) addressParts.push(cityStateCombo)
					const postalCode =
						typeof addressObj?.postalCode === "string" ? addressObj.postalCode.trim() : ""
					if (postalCode) addressParts.push(postalCode)
					const structuredAddress = addressParts.join(", ")
					const typeToken = structuredLocationType ? structuredLocationType.toLowerCase() : ""

					if (typeToken.includes("virtual") || typeToken.includes("online")) {
						location = { type: "online" }
					} else {
						const hasCoords =
							latFromStructured !== null &&
							lngFromStructured !== null &&
							Number.isFinite(latFromStructured) &&
							Number.isFinite(lngFromStructured)
						const fallbackName =
							typeof structuredLocationName === "string" ? structuredLocationName.trim() : undefined
						let coordinates: { lat: number; lng: number } | undefined = undefined
						if (hasCoords) {
							coordinates = { lat: latFromStructured!, lng: lngFromStructured! }
						}
						location = {
							type: "physical",
							address: structuredAddress || fallbackName,
							city: cityFromStructured || undefined,
							state: stateFromStructured || undefined,
							coordinates
						}
					}

					if (!timezone && typeof structuredLocationCandidate?.timezone === "string") {
						timezone = structuredLocationCandidate.timezone
					}
				}

				if (locationElement) {
					const rawText = locationElement.innerText || locationElement.textContent || ""
					const normalizedText = rawText
						.replace(/\s*\n\s*/g, ", ")
						.replace(/\s{2,}/g, " ")
						.replace(/\s+,/g, ", ")
						.trim()

					if (normalizedText) {
						domLocationText = normalizedText
						const cityStateRegex = /([A-Za-z](?:[A-Za-z\s.']|-)+?),\s*([A-Z]{2})(?:\s|,|$)/
						const cityStateMatch = normalizedText.match(cityStateRegex)

						if (cityStateMatch) {
							domCity = cityStateMatch[1].trim()
							domState = cityStateMatch[2].trim()
							domAddress = normalizedText.slice(0, cityStateMatch.index).replace(/,\s*$/, "").trim()
						}

						if (!domAddress) {
							const parts = normalizedText
								.split(",")
								.map((part) => part.trim())
								.filter(Boolean)
							if (parts.length > 0) {
								domAddress = parts[0]
							}
						}
					}

					const mapsLink =
						locationElement.getAttribute("href") ||
						locationElement.querySelector("a")?.getAttribute("href") ||
						""
					if (mapsLink) {
						let latVal: number | null = null
						let lngVal: number | null = null

						const atMatch = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
						if (atMatch) {
							latVal = parseFloat(atMatch[1])
							lngVal = parseFloat(atMatch[2])
						}

						if (latVal === null || lngVal === null) {
							const queryMatch = mapsLink.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/)
							if (queryMatch) {
								latVal = parseFloat(queryMatch[1])
								lngVal = parseFloat(queryMatch[2])
							}
						}

						if (latVal === null || lngVal === null) {
							const floats = mapsLink.match(/-?\d+\.\d+/g)
							if (floats && floats.length >= 2) {
								latVal = parseFloat(floats[0])
								lngVal = parseFloat(floats[1])
							}
						}

						if (
							latVal !== null &&
							lngVal !== null &&
							Number.isFinite(latVal) &&
							Number.isFinite(lngVal) &&
							Math.abs(latVal) <= 90 &&
							Math.abs(lngVal) <= 180
						) {
							domCoordinates = { lat: latVal, lng: lngVal }
						}
					}

					const lower = (domLocationText || "").toLowerCase()
					if (!location && (lower.includes("online") || lower.includes("virtual"))) {
						location = { type: "online" }
					}
				}

				if (location && location.type === "physical") {
					if (!location.address && domAddress) location.address = domAddress
					if (!location.city && domCity) location.city = domCity
					if (!location.state && domState) location.state = domState
					if (!location.coordinates && domCoordinates) location.coordinates = domCoordinates
					if (location.address) {
						location.address = location.address
							.replace(/\s*\n\s*/g, " ")
							.replace(/\s{2,}/g, " ")
							.trim()
					}
				} else if (!location) {
					if (domAddress || domCity || domState || domCoordinates) {
						location = {
							type: "physical",
							address:
								(domAddress || domLocationText || "")
									.replace(/\s*\n\s*/g, " ")
									.replace(/\s{2,}/g, " ")
									.trim() || undefined,
							city: domCity || undefined,
							state: domState || undefined,
							coordinates: domCoordinates || undefined
						}
					}
				}

				// Extract description (preserve markup)
				const primaryAboutSelector = "[class*='about'] [class*='content']"
				const fallbackAboutSelector = "[class*='About'], [class*='about'], [class*='description']"
				const aboutSection =
					(document.querySelector(primaryAboutSelector) as HTMLElement | null) ??
					(document.querySelector(fallbackAboutSelector) as HTMLElement | null)
				let description = ""
				let descriptionHtml: string | undefined
				if (aboutSection instanceof HTMLElement) {
					const clone = aboutSection.cloneNode(true) as HTMLElement
					clone
						.querySelectorAll("script, style, iframe, noscript")
						.forEach((element) => element.remove())
					clone.querySelectorAll("[style]").forEach((element) => element.removeAttribute("style"))
					clone.querySelectorAll("*").forEach((element) => {
						Array.from(element.attributes)
							.filter((attribute) => attribute.name.toLowerCase().startsWith("on"))
							.forEach((attribute) => element.removeAttribute(attribute.name))
					})
					clone.querySelectorAll("a[href]").forEach((anchor) => {
						const href = anchor.getAttribute("href")
						if (href) {
							try {
								const absoluteUrl = new URL(href, window.location.href)
								anchor.setAttribute("href", absoluteUrl.toString())
							} catch {
								anchor.removeAttribute("href")
							}
						}
						anchor.setAttribute("target", "_blank")
						anchor.setAttribute("rel", "noopener noreferrer")
					})

					descriptionHtml = clone.innerHTML.trim() || undefined
					description = clone.textContent?.replace(/\s+/g, " ").trim() || ""
				}

				// Extract guest count
				const guestElement = document.querySelector(
					"[class*='Going'], [class*='going'], [class*='attendees']"
				)
				let guestCount = -1
				if (guestElement) {
					const guestText = guestElement.textContent || ""
					const guestMatch = guestText.match(/(\d+)\s*(Going|going|Attending|attending)/i)
					if (guestMatch) {
						guestCount = parseInt(guestMatch[1], 10)
					}
				}

				if (!description) {
					description = name
				}

				return {
					api_id: apiId,
					name,
					description,
					description_html: descriptionHtml,
					start_at: startAt || new Date().toISOString(),
					end_at: endAt || new Date().toISOString(),
					location,
					cover_url: coverUrl,
					url: window.location.href,
					guest_count: guestCount,
					visibility: "public",
					timezone
				}
			},
			isPastEvent,
			DEFAULT_TIMEZONE
		)
	} catch (error) {
		console.error(`  Error scraping event ${eventUrl}:`, error)
		return null
	}

	if (!rawEvent || !rawEvent.api_id) {
		return null
	}

	const normalizedLocation = rawEvent.location
		? normalizeLocationFields(rawEvent.location)
		: undefined

	const startAt = rawEvent.start_at ?? new Date().toISOString()
	let endAt = rawEvent.end_at
	if (!endAt) {
		const tentativeEnd = new Date(startAt)
		tentativeEnd.setUTCHours(tentativeEnd.getUTCHours() + 4)
		endAt = tentativeEnd.toISOString()
	}

	const normalizedEvent: LumaEvent = {
		api_id: rawEvent.api_id,
		name: rawEvent.name,
		description: rawEvent.description,
		description_html: rawEvent.description_html,
		start_at: startAt,
		end_at: endAt,
		location: normalizedLocation,
		cover_url: rawEvent.cover_url ?? undefined,
		url: rawEvent.url,
		guest_count: rawEvent.guest_count,
		visibility: rawEvent.visibility ?? "public",
		timezone: rawEvent.timezone ?? DEFAULT_TIMEZONE
	}

	if (timelineOverride) {
		if (timelineOverride.start_at) {
			normalizedEvent.start_at = timelineOverride.start_at
		}
		if (timelineOverride.end_at) {
			normalizedEvent.end_at = timelineOverride.end_at
		}
		if (timelineOverride.timezone) {
			normalizedEvent.timezone = timelineOverride.timezone
		}
	}

	return normalizedEvent
}

/**
 * Scrape events from calendar page
 */
async function scrapeCalendarEvents(
	page: Page,
	filter: "upcoming" | "past" = "upcoming",
	existingEventMap: Map<string, LumaEvent> = new Map(),
	timelineMap: Map<string, TimelineEntry> = new Map()
): Promise<LumaEvent[]> {
	console.log(`\nScraping ${filter} events from: ${PUBLIC_CALENDAR_URL}`)

	await page.goto(PUBLIC_CALENDAR_URL, { waitUntil: "networkidle2", timeout: 30000 })

	// Wait for events section to load
	await page.waitForSelector("h2, [class*='Events']", { timeout: 10000 }).catch(() => {})

	// Click Past button if needed
	if (filter === "past") {
		try {
			// Find button containing "Past" text
			const pastButton = await page.evaluateHandle(() => {
				const buttons = Array.from(document.querySelectorAll("button"))
				return buttons.find((btn) => {
					const text = btn.textContent?.trim() || ""
					return text.toLowerCase().includes("past")
				})
			})

			if (pastButton && pastButton.asElement()) {
				const element = pastButton.asElement()
				if (element != null) {
					await (element as ElementHandle<Element>).click()
				}
				await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for events to load
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.warn("Could not click Past button:", e.message)
			} else {
				console.warn("Could not click Past button:", e)
			}
		}
	}

	// Scroll to load more events
	await page.evaluate(() => {
		return new Promise<void>((resolve) => {
			let totalHeight = 0
			const distance = 100
			const timer = setInterval(() => {
				const scrollHeight = document.body.scrollHeight
				window.scrollBy(0, distance)
				totalHeight += distance

				if (totalHeight >= scrollHeight || totalHeight > 5000) {
					clearInterval(timer)
					resolve()
				}
			}, 100)
		})
	})

	// Extract event links
	const eventLinks: string[] = await page.evaluate(() => {
		const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
		const eventUrls = new Set<string>()

		links.forEach((link) => {
			const hrefAttr = link.getAttribute("href")
			const href = hrefAttr || link.href
			// Match event URLs - look for short codes like /py8urggk or /evt-xxx
			if (
				href.match(/\/evt-[a-z0-9]+/i) ||
				(href.match(/\/[a-z0-9]{8,12}$/i) &&
					!href.includes("/DEVxNetwork") &&
					!href.includes("/discover") &&
					!href.includes("/signin"))
			) {
				const fullUrl = href.startsWith("http") ? href : `https://lu.ma${href}`
				// Only add if it looks like an event URL
				if (!fullUrl.includes("?k=") && !fullUrl.includes("?e=")) {
					eventUrls.add(fullUrl)
				}
			}
		})

		return Array.from(eventUrls)
	})

	console.log(`  Found ${eventLinks.length} event links`)

	// Scrape each event page
	const events: LumaEvent[] = []
	for (const eventUrl of eventLinks) {
		const apiIdFromLink = extractEventId(eventUrl)
		const cachedEvent = apiIdFromLink ? existingEventMap.get(apiIdFromLink) : undefined

		const timelineOverride = apiIdFromLink ? (timelineMap.get(apiIdFromLink) ?? null) : null
		const scrapedEvent = await scrapeEventPage(page, eventUrl, filter === "past", timelineOverride)

		if (!scrapedEvent) {
			if (cachedEvent) {
				events.push(cachedEvent)
			}
			continue
		}

		if (!scrapedEvent.api_id && apiIdFromLink) {
			scrapedEvent.api_id = apiIdFromLink
		}

		const mergedEvent = cachedEvent ? { ...cachedEvent, ...scrapedEvent } : scrapedEvent
		events.push(mergedEvent)

		// Small delay to avoid rate limiting
		await new Promise<void>((resolve) => setTimeout(resolve, 500))
	}

	return events
}

/**
 * Merge and deduplicate events
 */
function mergeEvents(existingEvents: LumaEvent[], newEvents: LumaEvent[]): LumaEvent[] {
	const eventMap = new Map<string, LumaEvent>()

	for (const event of existingEvents) {
		if (event.api_id) {
			eventMap.set(event.api_id, event)
		}
	}

	for (const event of newEvents) {
		if (!event.api_id) {
			continue
		}

		const existing = eventMap.get(event.api_id)
		if (existing) {
			eventMap.set(event.api_id, { ...existing, ...event })
		} else {
			eventMap.set(event.api_id, event)
		}
	}

	return Array.from(eventMap.values())
}

function normalizeStateAbbreviation(value: string) {
	if (!value) {
		return value
	}

	const trimmed = value.trim()
	if (!trimmed) {
		return trimmed
	}

	if (trimmed.length <= 2) {
		return trimmed.toUpperCase()
	}

	const lookup =
		US_STATE_ABBREVIATIONS[trimmed.toLowerCase() as keyof typeof US_STATE_ABBREVIATIONS]
	return lookup || trimmed
}

function normalizeLocationFields(
	location: ScrapedLocation | null | undefined
): ScrapedLocation | undefined {
	if (!location) {
		return undefined
	}

	if (location.type !== "physical") {
		return location
	}

	const normalized: ScrapedLocation = { ...location }

	if (normalized.address) {
		normalized.address = normalized.address.replace(/\s{2,}/g, " ").trim()
	}

	if (normalized.city) {
		normalized.city = normalized.city.replace(/\s{2,}/g, " ").trim()
	}

	if (normalized.state) {
		normalized.state = normalizeStateAbbreviation(normalized.state)

		if (normalized.address && normalized.state.length === 2) {
			let fullName = null
			for (const [name, abbr] of Object.entries(US_STATE_ABBREVIATIONS)) {
				if (abbr === normalized.state) {
					fullName = name
					break
				}
			}

			if (fullName) {
				const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
				const regex = new RegExp(escaped, "i")
				if (regex.test(normalized.address)) {
					normalized.address = normalized.address.replace(regex, normalized.state)
				} else if (!normalized.address.includes(normalized.state)) {
					normalized.address = `${normalized.address}, ${normalized.state}`.trim()
				}
			}
		}
	}

	return normalized
}

async function scrapeManageCalendarDates(
	browser: Browser,
	period: string
): Promise<Map<string, TimelineEntry>> {
	const page = await browser.newPage()
	const url = `${CALENDAR_MANAGE_URL}?period=${period}`

	try {
		console.log(`\nFetching manage calendar dates (${period}) from: ${url}`)
		if (manageCalendarCookie) {
			await page.setExtraHTTPHeaders({ Cookie: manageCalendarCookie })
		}
		await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
		await page.waitForSelector("a[href]", { timeout: 10000 }).catch(() => {})

		const entries: Array<{ href: string; text: string }> = await page.evaluate(() => {
			const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
			return links.map((link) => {
				const hrefAttr = link.getAttribute("href")
				const href = hrefAttr || link.href || ""
				const container = link.closest("article") || link.closest("div") || link
				const text = container
					? (container as HTMLElement).textContent || ""
					: (link as HTMLElement).textContent || ""
				return {
					href,
					text
				}
			})
		})

		if (entries.length === 0) {
			const bodyText = await page.evaluate(() => document.body.innerText)
			console.warn(
				"  Warning: No event links detected on manage calendar page. The page may require authentication."
			)
			console.warn("  Sample text:", bodyText.slice(0, 200))
		}

		const dateMap = new Map<string, TimelineEntry>()

		entries.forEach(({ href, text }: { href: string; text: string }) => {
			const apiId = extractEventId(href || "")
			if (!apiId) {
				return
			}

			const parsed = parseTimelineText(text || "")
			if (parsed && parsed.start_at) {
				if (!dateMap.has(apiId)) {
					dateMap.set(apiId, parsed)
				}
			}
		})

		console.log(`  Collected timeline data for ${dateMap.size} events (${period})`)

		return dateMap
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.warn(`Failed to fetch manage calendar dates for period="${period}":`, error.message)
		} else {
			console.warn(`Failed to fetch manage calendar dates for period="${period}":`, error)
		}
		return new Map()
	} finally {
		await page.close()
	}
}

/**
 * Main function
 */
async function main() {
	console.log("Starting event update...\n")

	const args = process.argv.slice(2)
	const cookieArg = args.find((arg) => arg.startsWith("--cookie="))

	if (cookieArg) {
		manageCalendarCookie = cookieArg.substring("--cookie=".length)
	}

	if (manageCalendarCookie) {
		console.log("Using provided manage calendar cookie for timeline scraping")
	}

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"]
	})

	try {
		// Read existing events (if present)
		let existingEvents: LumaEvent[] = []
		try {
			const existingData = readFileSync(EVENTS_FILE, "utf-8")
			existingEvents = JSON.parse(existingData) as LumaEvent[]
			console.log(`Loaded ${existingEvents.length} existing events`)
		} catch (error) {
			console.warn("No existing events file found. A new dataset will be created.")
		}

		const existingEventMap = new Map<string, LumaEvent>()
		for (const event of existingEvents) {
			if (event?.api_id) {
				existingEventMap.set(event.api_id, event)
			}
		}

		const manageUpcomingMap = await scrapeManageCalendarDates(browser, "upcoming")
		const managePastMap = await scrapeManageCalendarDates(browser, "past")
		const timelineMap = new Map<string, TimelineEntry>(manageUpcomingMap)
		for (const [eventId, timeline] of managePastMap) {
			timelineMap.set(eventId, timeline)
		}

		const page = await browser.newPage()
		await page.setViewport({ width: 1920, height: 1080 })

		// Scrape upcoming events
		const upcomingEvents = await scrapeCalendarEvents(
			page,
			"upcoming",
			existingEventMap,
			timelineMap
		)

		// Scrape past events
		const pastEvents = await scrapeCalendarEvents(page, "past", existingEventMap, timelineMap)

		// Combine all events
		const allNewEvents = [...upcomingEvents, ...pastEvents]

		// Merge with existing events (removing duplicates)
		const mergedEvents = mergeEvents(existingEvents, allNewEvents)

		// Sort by start date (newest first)
		mergedEvents.sort((a, b) => {
			const dateA = new Date(a.start_at).getTime()
			const dateB = new Date(b.start_at).getTime()
			return dateB - dateA
		})

		// Write updated events
		writeFileSync(EVENTS_FILE, JSON.stringify(mergedEvents, null, "\t") + "\n", "utf-8")

		const upcomingCount = mergedEvents.filter((e) => new Date(e.start_at) >= new Date()).length
		const pastCount = mergedEvents.filter((e) => new Date(e.start_at) < new Date()).length

		console.log(`\n✅ Successfully updated ${mergedEvents.length} events`)
		console.log(`   - Upcoming: ${upcomingCount}`)
		console.log(`   - Past: ${pastCount}`)
	} catch (error) {
		console.error("\n❌ Error updating events:", error)
		process.exit(1)
	} finally {
		await browser.close()
	}
}

main()
