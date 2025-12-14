import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { requestId } = params;
    const authHeader = req.headers.get("authorization");

    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendResponse = await fetch(
      `http://myapp11.ddns.net:5000/friends/request/${requestId}`,
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

