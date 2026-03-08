import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Vercel injects this header automatically on all deployments — free, zero latency
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  if (vercelCountry) {
    return NextResponse.json({ country_code: vercelCountry });
  }

  // Local dev fallback: call ip-api.com server-side (no CORS issues)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "";

  try {
    const url = ip
      ? `http://ip-api.com/json/${ip}?fields=countryCode`
      : "http://ip-api.com/json/?fields=countryCode";
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();
    return NextResponse.json({ country_code: data.countryCode ?? null });
  } catch {
    return NextResponse.json({ country_code: null });
  }
}
