import { NextRequest, NextResponse } from "next/server";
import { runOsint } from "@/lib/detector";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project: string = typeof body.project === "string" ? body.project.trim() : "";
    if (!project) return NextResponse.json({ error: "Projet requis" }, { status: 400 });
    const out = await runOsint(project);
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
