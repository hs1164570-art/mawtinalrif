import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { appointmentStatus } from "@prisma/client";
import { z } from "zod";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(appointmentStatus),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const { id, status } = patchSchema.parse(body);

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
