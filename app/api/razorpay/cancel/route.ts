import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { cancelSubscription, razorpayErrorMessage } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.razorpaySubscriptionId) {
    return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
  }

  try {
    await cancelSubscription(user.razorpaySubscriptionId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: razorpayErrorMessage(e, "Couldn't cancel the subscription.") }, { status: 500 });
  }
}
