import { users } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl?: string | null;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UpsertAuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

export interface IAuthStorage {
  getUser(id: string): Promise<AuthUser | undefined>;
  upsertUser(user: UpsertAuthUser): Promise<AuthUser>;
}

class AuthStorage implements IAuthStorage {
  async getUser(email: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user as AuthUser | undefined;
  }

  async upsertUser(userData: UpsertAuthUser): Promise<AuthUser> {
    if (!userData.email) {
      throw new Error("Email is required for user creation");
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, userData.email));
    
    if (existingUsers.length > 0) {
      const [updated] = await db
        .update(users)
        .set({
          firstName: userData.firstName || existingUsers[0].firstName,
          lastName: userData.lastName || existingUsers[0].lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email))
        .returning();
      return updated as AuthUser;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: "oauth_user",
        firstName: userData.firstName || "User",
        lastName: userData.lastName || "",
        role: "analyst",
      })
      .returning();
    return newUser as AuthUser;
  }
}

export const authStorage = new AuthStorage();
