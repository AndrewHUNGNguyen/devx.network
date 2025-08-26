import { NextResponse, NextRequest } from "next/server"
import Database from "better-sqlite3"

// Types //

interface Talk {
	id: number
	description: string | null
	speaker: string | null
	title: string | null
}

// Constants //

const db = new Database("./talks.db")
db.pragma("journal_mode = WAL")

// Functions //

export const getTalks = async (): Promise<Talk[]> => {
	const stmt = db.prepare("SELECT * FROM talks")
	const talks = stmt.all() as Talk[]
	return talks
}

export async function GET() {
	const talks = await getTalks()
	return NextResponse.json({ data: talks })
}

export async function POST(req: NextRequest) {
	const formData = await req.formData()
	const description = formData.get("description") as string | null
	const speaker = formData.get("speaker") as string | null
	const title = formData.get("title") as string | null

	const stmt = db.prepare(`
		INSERT INTO Talks (description, speaker, title)
		VALUES (?, ?, ?)
	`)
	stmt.run(description, speaker, title)

	return NextResponse.redirect(new URL("/talk/submitted", req.url))
}

// Initialize database table
db.prepare(
	`
	CREATE TABLE IF NOT EXISTS Talks (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		description TEXT,
		speaker TEXT,
		title TEXT
	);
	`
).run()
