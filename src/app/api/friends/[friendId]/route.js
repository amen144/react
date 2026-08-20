import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { friendId } = params;
    const authHeader = req.headers.get("authorization");

    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendResponse = await fetch(
      `${process.env.SERVICE}/friends/${friendId}`,
      {
        method: "DELETE",
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

