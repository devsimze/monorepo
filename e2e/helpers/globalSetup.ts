import { seedTestData } from "./seed";
import fs from "fs";
import path from "path";

export default async function globalSetup() {
  const result = await seedTestData();
  const file = path.join(process.cwd(), "e2e/.seed.json");
  fs.writeFileSync(file, JSON.stringify(result, null, 2));
}
