import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import CommunityPrayer from "@/models/CommunityPrayer";
import config from "@/config";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
}

// GET /api/community-prayers - Retrieve community prayers
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = {};
    if (category && category !== "Todas") {
      query.category = category;
    }

    const prayers = await CommunityPrayer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const processedPrayers = prayers.map((p) => ({
      ...p,
      id: p._id.toString(),
    }));

    return NextResponse.json(processedPrayers);
  } catch (error) {
    console.error("Error in GET /api/community-prayers:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}

// POST /api/community-prayers - Create a new community prayer
export async function POST(req) {
  try {
    const session = await auth();
    await connectMongo();

    const body = await req.json();
    const { title, text, category, userName } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "El título de la oración es requerido" }, { status: 400 });
    }
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "El texto de la oración es requerido" }, { status: 400 });
    }

    let userId = null;
    let displayName = "Anónimo";

    if (session?.user) {
      userId = session.user.id;
      displayName = session.user.name || `Usuario de ${config.appName}`;
    } else if (userName && userName.trim() !== "") {
      displayName = userName.trim();
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) {
      baseSlug = "oracion";
    }
    
    // Check if slug exists, if so append random string
    let slug = baseSlug;
    const existing = await CommunityPrayer.findOne({ slug });
    if (existing) {
      const rand = Math.random().toString(36).substring(2, 7);
      slug = `${baseSlug}-${rand}`;
    }

    const newPrayer = await CommunityPrayer.create({
      title: title.trim(),
      slug: slug,
      text: text.trim(),
      category: category || "comunidad",
      userName: displayName,
      user: userId,
      prayersCount: 0,
    });

    return NextResponse.json(newPrayer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/community-prayers:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
