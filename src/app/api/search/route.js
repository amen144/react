import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const authHeader = req.headers.get("authorization");

    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendResponse = await fetch(
      `http://myapp11.ddns.net:5000/search?q=${encodeURIComponent(query || "")}`,
      {
        method: "GET",
        headers
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

