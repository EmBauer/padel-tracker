import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Redis } from "@upstash/redis";

import { createDefaultScoreboard } from "@/lib/defaults";
import type { ScoreboardData } from "@/lib/types";

const STORAGE_KEY = "padel:shared-scoreboard:v1";
const JSON_FILE_PATH = path.join(process.cwd(), "data", "scoreboard.json");

type StorageMode = "redis" | "json";

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

async function readFromJson(): Promise<ScoreboardData> {
  try {
    const fileContent = await readFile(JSON_FILE_PATH, "utf-8");
    return JSON.parse(fileContent) as ScoreboardData;
  } catch {
    const initial = createDefaultScoreboard();
    await saveToJson(initial);
    return initial;
  }
}

async function saveToJson(scoreboard: ScoreboardData): Promise<void> {
  await mkdir(path.dirname(JSON_FILE_PATH), { recursive: true });
  await writeFile(JSON_FILE_PATH, JSON.stringify(scoreboard, null, 2), "utf-8");
}

export async function loadScoreboard(): Promise<{ scoreboard: ScoreboardData; storageMode: StorageMode }> {
  const redis = getRedisClient();

  if (!redis) {
    return { scoreboard: await readFromJson(), storageMode: "json" };
  }

  const value = await redis.get<ScoreboardData>(STORAGE_KEY);
  if (value) {
    return { scoreboard: value, storageMode: "redis" };
  }

  const initial = createDefaultScoreboard();
  await redis.set(STORAGE_KEY, initial);
  return { scoreboard: initial, storageMode: "redis" };
}

export async function saveScoreboard(
  scoreboard: ScoreboardData,
): Promise<{ scoreboard: ScoreboardData; storageMode: StorageMode }> {
  const redis = getRedisClient();

  if (!redis) {
    await saveToJson(scoreboard);
    return { scoreboard, storageMode: "json" };
  }

  await redis.set(STORAGE_KEY, scoreboard);
  return { scoreboard, storageMode: "redis" };
}
