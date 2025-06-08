// services/ability.service.ts
import {
  Ability,
  AbilityBuilder,
  createMongoAbility,
  RawRule,
  MongoQuery,
  Subject,
} from "@casl/ability";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";

// Define proper types
export type AppSubjects = "User" | "Article" | "all";
export type AppActions = "create" | "read" | "update" | "delete" | "manage";
export type AppAbility = Ability<[AppActions, AppSubjects]>;

interface UserWithRole {
  id: number;
  email: string;
  role?: {
    permissions: Array<{
      action: string;
      subject: string;
      conditions: any;
    }>;
  };
}

// Cache for abilities (optional - for better performance)
const abilityCache = new Map<number, AppAbility>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function defineAbilitiesForUser(
  userId: number
): Promise<AppAbility> {
  // Check cache first
  const cached = abilityCache.get(userId);
  if (cached) return cached;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    const permissions = user.role?.permissions || [];

    for (const permission of permissions) {
      try {
        const conditions = resolvePlaceholders(permission.conditions, user);

        // Validate action and subject
        if (
          isValidAction(permission.action) &&
          isValidSubject(permission.subject)
        ) {
          can(
            permission.action as AppActions,
            permission.subject as AppSubjects,
            conditions as any
          );
        }
      } catch (error) {
        console.warn(
          `Invalid permission for user ${userId}:`,
          permission,
          error
        );
      }
    }

    const ability = build();

    // Cache the result
    abilityCache.set(userId, ability);
    setTimeout(() => abilityCache.delete(userId), CACHE_TTL);

    return ability;
  } catch (error) {
    console.error(`Error defining abilities for user ${userId}:`, error);
    // Return minimal ability on error
    throw new ApiError(500,"Failed to define user abilities")
  }
}

function resolvePlaceholders(
  conditions: any,
  user: UserWithRole
): MongoQuery | null {
  if (!conditions || typeof conditions !== "object") {
    return conditions;
  }

  try {
    // More secure placeholder resolution
    const resolveValue = (value: any): any => {
      if (typeof value === "string") {
        // Support multiple placeholder types
        const placeholders: Record<string, any> = {
          "$user.id": user.id,
          "$user.email": user.email,
          // Add more as needed
        };

        // Replace known placeholders
        for (const [placeholder, replacement] of Object.entries(placeholders)) {
          if (value === placeholder) {
            return replacement;
          }
        }
        return value;
      }

      if (Array.isArray(value)) {
        return value.map(resolveValue);
      }

      if (typeof value === "object" && value !== null) {
        const resolved: any = {};
        for (const [key, val] of Object.entries(value)) {
          resolved[key] = resolveValue(val);
        }
        return resolved;
      }

      return value;
    };

    return resolveValue(conditions);
  } catch (error) {
    console.warn("Error resolving placeholders:", error);
    return null;
  }
}

// Validation helpers
function isValidAction(action: string): action is AppActions {
  return ["create", "read", "update", "delete", "manage"].includes(action);
}

function isValidSubject(subject: string): subject is AppSubjects {
  return ["User", "Article", "all"].includes(subject);
}

// Clear cache when user permissions change
export function clearUserAbilityCache(userId: number) {
  abilityCache.delete(userId);
}

// Clear all cache
export function clearAllAbilityCache() {
  abilityCache.clear();
}

export const createAbility = (rules: RawRule[]): AppAbility =>
  createMongoAbility(rules as any, {
    detectSubjectType: (object: any) => {
      // Better subject type detection
      if (object.__typename) return object.__typename;
      if (object.constructor?.name) return object.constructor.name;
      if (typeof object === "string") return object;
      return "Unknown";
    },
  });
