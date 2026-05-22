import { loadAllSettings } from "@/lib/settings";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function build() {
  const settings = loadAllSettings();
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(PUBLIC_DIR, "settings.json"), JSON.stringify(settings, null, 2));
  console.log("Settings bundle built: public/settings.json");
}

build();
