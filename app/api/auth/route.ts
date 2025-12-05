import { type NextRequest, NextResponse } from "next/server"

const USERS = {
  manager: {
    password: "pass123",
    name: "Manager",
  },
  staff: {
    password: "pass456",
    name: "Staff Member",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Check environment variables first
    const envUsername = process.env.AUTH_USERNAME
    const envPassword = process.env.AUTH_PASSWORD

    if (envUsername && envPassword) {
      if (username === envUsername && password === envPassword) {
        return NextResponse.json({
          success: true,
          name: username,
        })
      }
    }

    // Fallback to default users
    const user = USERS[username as keyof typeof USERS]
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      name: user.name,
    })
  } catch (error) {
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}
