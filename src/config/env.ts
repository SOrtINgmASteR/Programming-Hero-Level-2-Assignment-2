import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const parseBcryptRounds = (): number => {
  const raw = process.env.BCRYPT_ROUNDS ?? "10";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 8 || parsed > 12) {
    throw new Error("BCRYPT_ROUNDS must be between 8 and 12");
  }
  return parsed;
};

export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  bcryptRounds: parseBcryptRounds(),
  port: Number.parseInt(process.env.PORT ?? "5000", 10)
};
