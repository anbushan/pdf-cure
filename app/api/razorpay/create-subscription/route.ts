import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { createSubscription } from "@/lib/razorpay";
import { getSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    const subscription = await createSubscription({
      userId: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { razorpaySubscriptionId: subscription.id },
    });

    const keyId = await getSetting("RAZORPAY_KEY_ID");
    return NextResponse.json({ subscriptionId: subscription.id, keyId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Couldn't start checkout." }, { status: 500 });
  }
}
