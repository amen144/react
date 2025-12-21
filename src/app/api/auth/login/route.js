import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(
      process.env.NEXT_PUBLIC_API_URL`/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
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

