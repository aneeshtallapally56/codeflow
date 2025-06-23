/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

export async function pingCheck(req: NextRequest) {
  try {
    return NextResponse.json({
      message: "Pong! The server is up and running.",
    }, { status: 200 });
  } catch (error) {
     const err = error as Error;
    return NextResponse.json({
      error: err.message || "An error occurred",
    }, { status: 500 });
  }
}