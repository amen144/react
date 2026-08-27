import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { noteId } = params;
    const body = await req.json();

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`,
      {
        method: "PUT",
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

export async function DELETE(req, { params }) {
  try {
    const { noteId } = params;
    const authHeader = req.headers.get("authorization");

    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`,
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

