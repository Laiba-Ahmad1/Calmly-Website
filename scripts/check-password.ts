// scripts/check-password.ts
import bcrypt from "bcryptjs";

const storedHash = "$2b$10$3Xl8uXbwVwON.VLfGns6YuD5Sb1TvTOabTYTPShuXCNjKLi01fgtS";

const candidates = [
  "Passw0rd!",
  "passw0rd!",
  // add whatever you think the agent might have used
];

async function main() {
  for (const pw of candidates) {
    const match = await bcrypt.compare(pw, storedHash);
    console.log(`"${pw}" -> ${match}`);
  }
}

main();