import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { noteId } = params;

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notes/note/${noteId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Proxy error" },
      { status: 500 }
    );
  }
}

