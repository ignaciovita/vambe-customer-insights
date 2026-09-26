import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const clients = await db.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        salesRep: true,
        meetingDate: true,
        closed: true,
        transcript: true,
        industry: true,
        painPoint: true,
        requiredIntegrations: true,
        estimatedVolume: true,
        acquisitionChannel: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error: any) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error al recuperar clientes de la base de datos", message: error?.message },
      { status: 500 }
    );
  }
}