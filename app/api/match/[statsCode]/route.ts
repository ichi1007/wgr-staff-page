import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ statsCode: string }> }
) {
  try {
    const { statsCode } = await params;
    const gameApiUrl = process.env.GAME_API_URL;

    if (!gameApiUrl) {
      return NextResponse.json(
        { error: "GAME_API_URL is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${gameApiUrl}${statsCode}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch match data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching match data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
