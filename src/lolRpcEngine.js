export const OFFICIAL_LOL_APP_ID = "401518687463587841";
export const LOL_CHAMPION_PRESETS = [
  { champion: "Yasuo", title: "The Unforgiven", role: "Mid / Top" },
  { champion: "Jinx", title: "The Loose Cannon", role: "Bottom" },
  { champion: "Ahri", title: "The Nine-Tailed Fox", role: "Mid" },
  { champion: "Aatrox", title: "The Darkin Blade", role: "Top" },
  { champion: "Lee Sin", title: "The Blind Monk", role: "Jungle" },
  { champion: "Zed", title: "The Master of Shadows", role: "Mid" },
  { champion: "K'Sante", title: "The Pride of Nazumah", role: "Top" },
  { champion: "Jhin", title: "The Virtuoso", role: "Bottom" },
  { champion: "Thresh", title: "The Chain Warden", role: "Support" },
  { champion: "Viego", title: "The Ruined King", role: "Jungle" }
];
export const LOL_RANK_TIERS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Emerald",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger"
];
export const LOL_GAME_MODES = [
  "Ranked Solo/Duo",
  "Ranked Flex",
  "Normal Draft",
  "ARAM (Howling Abyss)",
  "Arena (2v2v2v2)",
  "Clash Tournament"
];
export function formatChampionDDragonKey(name) {
  if (!name) return "Yasuo";
  const clean = name.trim();
  const specialMap = {
    "K'Sante": "KSante",
    "Cho'Gath": "Chogath",
    "Kai'Sa": "Kaisa",
    "Kha'Zix": "Khazix",
    "Vel'Koz": "Velkoz",
    "LeBlanc": "Leblanc",
    "Wukong": "MonkeyKing",
    "Nunu & Willump": "Nunu",
    "Renata Glasc": "Renata"
  };
  if (specialMap[clean]) return specialMap[clean];
  return clean.replace(/[^a-zA-Z0-9]/g, "");
}
export function getLolChampionIconUrl(championName = "Yasuo") {
  const key = formatChampionDDragonKey(championName);
  return `https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${key}.png`;
}
export function getLolChampionSplashUrl(championName = "Yasuo") {
  const key = formatChampionDDragonKey(championName);
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;
}
export function getLolRankIconUrl(rankTier = "Master") {
  const tier = (rankTier || "master").toLowerCase().trim();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblems/${tier}.png`;
}
export function getLolOfficialLogoUrl() {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/lol-icon.png`;
}
export function extractYoutubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
export function getYoutubeThumbnailUrl(url, fallback = "https://i.ytimg.com/vi/L5rL0pBzmAE/hqdefault.jpg") {
  const videoId = extractYoutubeVideoId(url);
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return fallback;
}
export function normalizeChampionAssetKey(name) {
  if (!name) return "champ_yasuo";
  return `champ_${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}
export function formatLolPresencePayload(config = {}, now = Date.now(), bootTime = Date.now()) {
  const champion = config.champion || "Yasuo";
  const championTitle = config.championTitle || "The Unforgiven";
  const mode = config.mode || "Ranked Solo/Duo";
  const rankTier = config.rankTier || "Master";
  const rankLp = config.lp || "240 LP";
  const kda = config.kda || "8/1/6";
  const championLevel = parseInt(config.championLevel, 10) || 14;
  const cs = parseInt(config.cs, 10) || 185;
  const partyCurrent = parseInt(config.partyCurrent, 10) || 1;
  const partyMax = parseInt(config.partyMax, 10) || 5;
  const champKey = normalizeChampionAssetKey(champion);
  const rankKey = `rank_${rankTier.toLowerCase()}`;
  const rankTooltip = `${rankTier} - ${rankLp}`;
  const useCdn = config.useCdnUrls === true;
  const partyId = config.partyId || `lol_party_${bootTime}`;
  let activePhase = config.phase || "champ_select";
  if (config.autoCycleSimulation) {
    const cycleMinutes = Math.floor((now - bootTime) / 6e4 % 40);
    if (cycleMinutes < 2) activePhase = "queue";
    else if (cycleMinutes < 4) activePhase = "champ_select";
    else if (cycleMinutes < 38) activePhase = "in_game";
    else activePhase = "post_game";
  }
  let details = "";
  let state = "";
  let largeImage = "";
  let largeText = "";
  let smallImage = useCdn ? getLolRankIconUrl(rankTier) : rankKey;
  let smallText = rankTooltip;
  let party = null;
  let startTimestamp = null;
  switch (activePhase) {
    case "queue":
      details = "In Queue";
      state = mode;
      largeImage = useCdn ? getLolOfficialLogoUrl() : "league_icon";
      largeText = "League of Legends";
      party = { size: [partyCurrent, partyMax], id: partyId };
      startTimestamp = now - 45 * 1e3;
      break;
    case "champ_select":
      details = "In Champion Select";
      state = mode;
      largeImage = useCdn ? getLolChampionSplashUrl(champion) : champKey;
      largeText = `Picking ${champion} (${championTitle})`;
      party = { size: [partyCurrent, partyMax], id: partyId };
      startTimestamp = now - 65 * 1e3;
      break;
    case "in_game": {
      const mapName = mode.includes("ARAM") ? "Howling Abyss" : "Summoner's Rift";
      details = mapName;
      state = `Playing ${champion} (${kda}, Lv${championLevel})`;
      largeImage = useCdn ? getLolChampionSplashUrl(champion) : champKey;
      largeText = `${champion} - ${cs} CS`;
      party = { size: [partyCurrent, partyMax], id: partyId };
      startTimestamp = now - (15 * 60 + 24) * 1e3;
      break;
    }
    case "post_game":
      details = "Match Summary - Victory!";
      state = `${mode} (+24 LP)`;
      largeImage = useCdn ? getLolChampionSplashUrl(champion) : champKey;
      largeText = `${champion} - Victory`;
      party = null;
      startTimestamp = now - 180 * 1e3;
      break;
    case "lobby":
    default:
      details = "In Lobby";
      state = mode;
      largeImage = useCdn ? getLolOfficialLogoUrl() : "league_icon";
      largeText = "League of Legends";
      party = { size: [partyCurrent, partyMax], id: partyId };
      startTimestamp = bootTime;
      break;
  }
  return {
    applicationId: OFFICIAL_LOL_APP_ID,
    name: "League of Legends",
    phase: activePhase,
    details,
    state,
    largeImage,
    largeText,
    smallImage,
    smallText,
    party,
    startTimestamp,
    cdnAssets: {
      championIcon: getLolChampionIconUrl(champion),
      championSplash: getLolChampionSplashUrl(champion),
      rankIcon: getLolRankIconUrl(rankTier),
      logoIcon: getLolOfficialLogoUrl()
    }
  };
}
