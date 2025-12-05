import { type NextRequest, NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const DATA_FILE = path.join(process.cwd(), "data", "sales.json")

async function ensureDataFile() {
  try {
    await readFile(DATA_FILE)
  } catch {
    const dir = path.dirname(DATA_FILE)
    await import("fs/promises").then((fs) => fs.mkdir(dir, { recursive: true }))
    await writeFile(DATA_FILE, JSON.stringify({ sales: [] }, null, 2))
  }
}

export async function GET() {
  try {
    await ensureDataFile()
    const data = await readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(data)
    // Sort by most recent first
    const sorted = parsed.sales.sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    return NextResponse.json({ sales: sorted })
  } catch (error) {
    return NextResponse.json({ sales: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataFile()
    const body = await request.json()

    const newSale = {
      id: uuidv4(),
      date: body.date,
      type: body.type, // online-revenue, cash-revenue, or expense
      amount: body.amount,
      description: body.description,
      addedBy: body.addedBy,
      timestamp: new Date().toISOString(),
    }

    const data = await readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(data)
    parsed.sales.push(newSale)
    await writeFile(DATA_FILE, JSON.stringify(parsed, null, 2))

    return NextResponse.json({ sale: newSale }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to save transaction" }, { status: 500 })
  }
}
