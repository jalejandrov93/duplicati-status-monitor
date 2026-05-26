import { NextRequest, NextResponse } from "next/server";

export function apiHandler(
  fn: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await fn(req, ...args);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Error interno del servidor" },
        { status: 500 }
      );
    }
  };
}
