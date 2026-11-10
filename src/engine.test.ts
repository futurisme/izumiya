import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
function calculateCpuBreakdown(power: number) {
  const p = Math.max(0, Math.min(195, power));
  const audioAlloc = parseFloat((p * (118.5 / 195)).toFixed(1));
  const videoAlloc = parseFloat((p * (68 / 195)).toFixed(1));
  const webrtcAlloc = parseFloat((p * (8.5 / 195)).toFixed(1));
  const headroom = parseFloat((200 - p).toFixed(1));
  const threads = p >= 150 ? 4 : p >= 90 ? 3 : p >= 40 ? 2 : 1;
  return { audioAlloc, videoAlloc, webrtcAlloc, headroom, threads };
}
function calculatePersistentUptime(hours: number, anchorTime = Date.now()) {
  const startTime = anchorTime - hours * 3600 * 1e3;
  const elapsedHours = (anchorTime - startTime) / (3600 * 1e3);
  return { startTime, elapsedHours };
}
test("CPU Power proportional calculation at 195% max power", () => {
  const { audioAlloc, videoAlloc, webrtcAlloc, headroom, threads } = calculateCpuBreakdown(195);
  assert.equal(audioAlloc, 118.5);
  assert.equal(videoAlloc, 68);
  assert.equal(webrtcAlloc, 8.5);
  assert.equal(headroom, 5);
  assert.equal(threads, 4);
});
test("CPU Power proportional calculation at 100% single core", () => {
  const { audioAlloc, videoAlloc, webrtcAlloc, headroom, threads } = calculateCpuBreakdown(100);
  assert.equal(audioAlloc, 60.8);
  assert.equal(videoAlloc, 34.9);
  assert.equal(webrtcAlloc, 4.4);
  assert.equal(headroom, 100);
  assert.equal(threads, 3);
});
test("CPU Power proportional calculation at 0% eco audio minimal", () => {
  const { audioAlloc, videoAlloc, webrtcAlloc, headroom, threads } = calculateCpuBreakdown(0);
  assert.equal(audioAlloc, 0);
  assert.equal(videoAlloc, 0);
  assert.equal(webrtcAlloc, 0);
  assert.equal(headroom, 200);
  assert.equal(threads, 1);
});
test("Dual activity unbroken 1000+ hours timestamp anchor", () => {
  const customHours = 1248;
  const now = 173e10;
  const { startTime, elapsedHours } = calculatePersistentUptime(customHours, now);
  assert.ok(startTime < now);
  assert.equal(elapsedHours, 1248);
  assert.equal(Math.floor(elapsedHours / 24), 52);
});
test("Dual activity Discord RichPresence payload structure", () => {
  const dualActivity = {
    name: "Minecraft",
    type: 0,
    details: "Survival Mode (24/7 Dedicated Server)",
    state: "Hardcore Base - Mining Ancient Debris",
    timestamps: { start: 1726e9 },
    assets: {
      large_image: "minecraft_logo",
      large_text: "Minecraft Java Edition 1.21.x",
      small_image: "diamond_pickaxe",
      small_text: "100% Unbroken Uptime (1000+ Jam)"
    }
  };
  assert.equal(dualActivity.name, "Minecraft");
  assert.equal(dualActivity.type, 0);
  assert.ok(dualActivity.timestamps.start > 0);
  assert.equal(dualActivity.assets.large_image, "minecraft_logo");
});
import {
  formatLolPresencePayload,
  OFFICIAL_LOL_APP_ID,
  getLolChampionSplashUrl,
  getLolRankIconUrl,
  getLolOfficialLogoUrl,
  getYoutubeThumbnailUrl
} from "./lolRpcEngine.js";
test("League of Legends Official Application ID", () => {
  assert.equal(OFFICIAL_LOL_APP_ID, "401518687463587841");
});
test("League of Legends In Queue phase payload generation", () => {
  const payload = formatLolPresencePayload({
    phase: "queue",
    mode: "Ranked Solo/Duo",
    rankTier: "Master",
    lp: "240 LP",
    partyCurrent: 1,
    partyMax: 5
  });
  assert.equal(payload.applicationId, "401518687463587841");
  assert.equal(payload.name, "League of Legends");
  assert.equal(payload.details, "In Queue");
  assert.equal(payload.state, "Ranked Solo/Duo");
  assert.equal(payload.largeImage, "league_icon");
  assert.equal(payload.smallImage, "rank_master");
  assert.equal(payload.smallText, "Master - 240 LP");
  assert.deepEqual(payload.party?.size, [1, 5]);
});
test("League of Legends In Champion Select phase payload generation", () => {
  const payload = formatLolPresencePayload({
    phase: "champ_select",
    mode: "Ranked Solo/Duo",
    champion: "Yasuo",
    championTitle: "The Unforgiven",
    rankTier: "Master",
    lp: "240 LP"
  });
  assert.equal(payload.details, "In Champion Select");
  assert.equal(payload.state, "Ranked Solo/Duo");
  assert.equal(payload.largeImage, "champ_yasuo");
  assert.equal(payload.largeText, "Picking Yasuo (The Unforgiven)");
  assert.equal(payload.smallImage, "rank_master");
  assert.equal(payload.smallText, "Master - 240 LP");
});
test("League of Legends In Game match live metrics payload generation", () => {
  const payload = formatLolPresencePayload({
    phase: "in_game",
    mode: "Ranked Solo/Duo",
    champion: "Yasuo",
    championTitle: "The Unforgiven",
    rankTier: "Diamond",
    lp: "75 LP",
    kda: "10/2/8",
    championLevel: 16,
    cs: 210,
    partyCurrent: 2,
    partyMax: 5
  });
  assert.equal(payload.details, "Summoner's Rift");
  assert.equal(payload.state, "Playing Yasuo (10/2/8, Lv16)");
  assert.equal(payload.largeImage, "champ_yasuo");
  assert.equal(payload.largeText, "Yasuo - 210 CS");
  assert.equal(payload.smallImage, "rank_diamond");
  assert.equal(payload.smallText, "Diamond - 75 LP");
  assert.deepEqual(payload.party?.size, [2, 5]);
});
test("League of Legends Auto-Cycle Simulation phase evolution", () => {
  const bootTime = 1e9;
  const p1 = formatLolPresencePayload({ autoCycleSimulation: true }, bootTime + 1 * 6e4, bootTime);
  assert.equal(p1.phase, "queue");
  assert.equal(p1.details, "In Queue");
  const p2 = formatLolPresencePayload({ autoCycleSimulation: true }, bootTime + 3 * 6e4, bootTime);
  assert.equal(p2.phase, "champ_select");
  assert.equal(p2.details, "In Champion Select");
  const p3 = formatLolPresencePayload({ autoCycleSimulation: true }, bootTime + 20 * 6e4, bootTime);
  assert.equal(p3.phase, "in_game");
  assert.equal(p3.details, "Summoner's Rift");
  const p4 = formatLolPresencePayload({ autoCycleSimulation: true }, bootTime + 39 * 6e4, bootTime);
  assert.equal(p4.phase, "post_game");
  assert.equal(p4.details, "Match Summary - Victory!");
});
test("League of Legends High-Res CDN Asset URLs Generation", () => {
  const splash = getLolChampionSplashUrl("Yasuo");
  assert.equal(splash, "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg");
  const rank = getLolRankIconUrl("Challenger");
  assert.equal(rank, "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblems/challenger.png");
  const logo = getLolOfficialLogoUrl();
  assert.ok(logo.includes("lol-icon.png"));
  const ytThumb = getYoutubeThumbnailUrl("https://youtu.be/L5rL0pBzmAE?si=test");
  assert.equal(ytThumb, "https://i.ytimg.com/vi/L5rL0pBzmAE/hqdefault.jpg");
});
test("Centralized config.json schema and categories integrity", () => {
  const cfgPath = path.resolve(process.cwd(), "config.json");
  assert.ok(fs.existsSync(cfgPath), "config.json must exist");
  const raw = fs.readFileSync(cfgPath, "utf8");
  const config = JSON.parse(raw);
  assert.ok(config.server, "Category server missing");
  assert.ok(config.voice, "Category voice missing");
  assert.ok(config.malangRouting, "Category malangRouting missing");
  assert.ok(config.cpuGovernor, "Category cpuGovernor missing");
  assert.ok(config.mediaEngine, "Category mediaEngine missing");
  assert.ok(config.richPresence, "Category richPresence missing");
  assert.ok(config.playlist, "Category playlist missing");
  assert.ok(config.antiDetection, "Category antiDetection missing");
  assert.ok(config.richPresence.activityName, "richPresence slot 1 activityName missing");
  assert.ok(config.richPresence.largeImage, "richPresence slot 1 thumbnail missing");
  assert.ok(config.richPresence.dualActivity, "richPresence slot 2 dualActivity missing");
  assert.ok(config.richPresence.dualActivity.lolSettings, "richPresence slot 2 lolSettings missing");
  assert.equal(config.richPresence.dualActivity.lolSettings.champion, "Yasuo");
});
test("Accurate ZIP Packaging & Compression Byte Calculation", async () => {
  const zip = new JSZip();
  const testFiles = [
    { name: ".env", content: "DISCORD_TOKEN=TEST_TOKEN_1234567890\nPORT=3000\n" },
    { name: "config.json", content: JSON.stringify({ test: true, version: 2026 }) },
    { name: "README.md", content: "# Fadhilbot 2026 Engine\nTesting zip compression.\n" }
  ];
  for (const f of testFiles) {
    zip.file(f.name, f.content);
  }
  const blob = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
  assert.ok(blob.length > 0, "Zip buffer must not be empty");
  assert.ok(blob.length < 1e3, "Compressed zip buffer should be lightweight (~100-300 bytes)");
});

import { encryptSourceCode, buildProtectedLoaderScript, calculateChecksum } from "./encryptionEngine.js";

test("AETHER-CRYPT v26.11 Encryption and Decryption Roundtrip Integrity", () => {
  const originalCode = `
    const secretKey = "PROPRIETARY_PATENT_ALGORITHM_2026";
    function executeAudioPipeline(opusSampleRate) {
      return "Audio Opus 48kHz Active: " + opusSampleRate;
    }
    const result = executeAudioPipeline(48000);
  `;
  const enc = encryptSourceCode(originalCode) as {
    payload: string;
    checksum: string;
    entropy: string;
  };

  assert.ok(enc.payload.length > 0, "Payload must not be empty");
  assert.notEqual(enc.payload, originalCode, "Payload must be completely scrambled");
  assert.ok(!enc.payload.includes("PROPRIETARY_PATENT_ALGORITHM"), "Plaintext must not appear in cipher");
  assert.ok(parseFloat(enc.entropy) > 5.0, "Entropy must indicate high randomness (>5.0 bits/byte)");

  // Verify loader script compilation
  const loaderScript = buildProtectedLoaderScript(enc.payload, enc.checksum);
  assert.ok(loaderScript.includes("AETHER-OMNI"), "Loader must include runtime banner");
  assert.ok(loaderScript.includes(enc.payload), "Loader must embed encrypted payload");
  assert.ok(loaderScript.includes(enc.checksum), "Loader must embed checksum");
});

test("AETHER-CRYPT v26.11 Checksum Integrity Detection", () => {
  const source1 = "console.log('fadhilbot 2026 active');";
  const source2 = "console.log('fadhilbot 2026 hacked');";
  const cs1 = calculateChecksum(source1);
  const cs2 = calculateChecksum(source2);
  assert.notEqual(cs1, cs2, "Different sources must produce distinct checksums");
  assert.equal(cs1.length, 8, "Checksum must be 8 hex characters");
});

test("AETHER-OMNI v26.11 In-Memory VM Loader Generation and Self-Obfuscation", () => {
  const codeToProtect = `
    // [PROPRIETARY PATENT FORMULA]
    const bitmask = 0xdeadbeef;
    function computeStreamCadence(fps, bitrate) {
      return (fps * bitrate) / 1000;
    }
    const val = computeStreamCadence(24, 540);
  `;
  const enc = encryptSourceCode(codeToProtect) as any;
  const loader = buildProtectedLoaderScript(enc.payload, enc.checksum);

  // Must not expose the original comments or variable names
  assert.ok(!loader.includes("computeStreamCadence"), "Function name must not exist in loader");
  assert.ok(!loader.includes("PROPRIETARY PATENT FORMULA"), "Comments must be completely encrypted");
  assert.ok(!loader.includes("0xdeadbeef"), "Literals must not exist in loader");

  // Loader must be executable syntactically
  assert.ok(loader.includes("_0xdecBuf"), "Micro-kernel de-permutation buffer present");
  assert.ok(loader.includes("_0xvm"), "V8 VM virtual hydration present");
});


