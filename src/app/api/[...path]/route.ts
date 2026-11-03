import { NextRequest, NextResponse } from "next/server";

const getTargetBaseUrl = () => {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "http://api-service:8080" : "http://localhost:8080")
  );
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathParts: string[]) {
  const baseUrl = getTargetBaseUrl();
  const search = req.nextUrl.search;
  const targetUrl = `${baseUrl}/api/${pathParts.join("/")}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (err: any) {
    // If api-service failed and we are running outside container, try localhost:8080
    if (baseUrl.includes("api-service")) {
      try {
        const fallbackUrl = `http://localhost:8080/api/${pathParts.join("/")}${search}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: req.method,
          headers,
          body,
        });
        return new Response(fallbackRes.body, {
          status: fallbackRes.status,
          statusText: fallbackRes.statusText,
          headers: fallbackRes.headers,
        });
      } catch (fallbackErr) {}
    }
    return NextResponse.json(
      { error: "Backend proxy unreachable", targetUrl, message: String(err) },
      { status: 502 }
    );
  }
}
