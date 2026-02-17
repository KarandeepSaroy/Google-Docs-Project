"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface CustomJwtSessionClaims {
  o?: {
    id: string;
    slug: string;
  };
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function getDocuments(ids: Id<"documents">[]) {
    return await convex.query(api.documents.getByIds, { ids })
};

export async function getUsers() {
    const { sessionClaims } = await auth();
    const clerk = await clerkClient();

    const claims = sessionClaims as CustomJwtSessionClaims;

    const response = await clerk.users.getUserList({
      organizationId: [claims?.o?.id as string],
    });

    // For future refrence->
    // const response = await clerk.users.getUserList({
    //     organizationId: [sessionClaims?.o?.id as string]
    // })

    const users = response.data.map((user) => ({
        id: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
        avatar: user.imageUrl,
    }))

    return users;
}