import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const categories = await db.transactionCategory.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json([], { status: 500 });
    }
}
