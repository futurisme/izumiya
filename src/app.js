import { generateSynchronizedFiles, analyzeDiscordToken, formatFileSize } from "./syncEngine.js";
import { exportFilesAsZip, calculateExactZipSize } from "./zipExporter.js";
const state = {
  botMode: "selfbot",
  userToken: "mtq1njmyntizmtaendmuotaing.gij-ke.u0wwkuvmatd21tfxdnlvjb5vmmpmtx9aedirs",
  maskToken: true,
  voiceChannelId: "1366441630151737445",
  voiceGuildId: "1323944038117675038",
  autoRejoin: true,
  rejoinDelaySec: 8,
  rpcViewMode: "status",
  lastCalculatedZipSize: "24.8 KB",
  streamEnabled: true,
  autoLoop: true,
  videoMin: "360p",
  videoMax: "480p",
  videoFps: 24,
  videoBitrate: 540,
  adaptiveDiscrimination: true,
  aizoDefense: true,
  playlistMode: "alternating",
  audioBoost: 1.48,
  audioPriorityMode: "extreme_zero_drop",
  audioBitrate: 96,
  breakEnabled: true,
  breakIntervalMin: 120,
  breakDurationSec: 90,
  rpcName: "KANA-BOON - \u3050\u3089\u3067\u30FC\u3057\u3087\u3093",
  rpcType: "STREAMING",
  rpcUrl: "https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ",
  rpcDetails: "Yamada-kun Lv999 OP \u2194 AIZO",
  rpcState: "Di Voice: #Music 24/7 (480p Boosted)",
  rpcStatus: "online",
  rpcLargeImage: "youtube",
  rpcLargeText: "480p Studio Audio Boost (Opus 192k)",
  rpcSmallImage: "live",
  rpcSmallText: "Always ON-MIC Active (+3.4dB)",
  rpcAppId: "367827983903490050",
  dynamicTimeline: true,
  dynamicTrackSync: true,
  playlist: [
    {
      id: "gradation",
      title: "KANA-BOON - \u3050\u3089\u3067\u30FC\u3057\u3087\u3093",
      durationSec: 235,
      videoFile: "assets/yamada_op.mp4",
      audioFile: "assets/yamada_op.mp3",
      imageFile: "assets/yamada_op.png",
      imageAsset: "youtube",
      resolution: "480p"
    },
    {
      id: "aizo",
      title: "AIZO (\u611B\u8535) - 480p Broadcast",
      durationSec: 238,
      videoFile: "assets/aizo480p.mp4",
      audioFile: "assets/aizo.mp3",
      imageFile: "assets/aizo.png",
      imageAsset: "aizo",
      resolution: "480p"
    }
  ],
  activePreviewTrackIndex: 0,
  timebarElapsedSec: 35,
  timebarPlaying: true,
  hardwareAccel: "auto",
  rtcpPli: true,
  daveRatchet: true,
  malangRtcRegion: "singapore",
  antiJamming: true,
  malangPeering: true,
  ispTarget: "all_indonesia",
  dnsProfile: "cloudflare_1111",
  activeTab: "credentials",
  selectedFile: ".env",
  activeMalangSubTab: "prompt",
  isDownloadingZip: false,
  cpuPower: 195,
  dualActivityEnabled: true,
  dualActivityName: "Minecraft",
  dualActivityType: "PLAYING",
  dualActivityDetails: "Survival Mode (24/7 Dedicated Server)",
  dualActivityState: "Hardcore Base - Mining Ancient Debris",
  dualActivityUptimeHours: 1248,
  dualActivityAppId: "432980957394370572",
  dualActivityLargeImage: "minecraft_logo",
  dualActivityLargeText: "Minecraft Java Edition 1.21.x",
  dualActivitySmallImage: "diamond_pickaxe",
  dualActivityStartEpoch: 1726e9,
  lolPhase: "champ_select",
  lolMode: "Ranked Solo/Duo",
  lolChampion: "Yasuo",
  lolChampionTitle: "The Unforgiven",
  lolRankTier: "Master",
  lolRankLp: "240 LP",
  lolKda: "8/1/6",
  lolChampionLevel: 14,
  lolCs: 185,
  lolPartyCurrent: 1,
  lolPartyMax: 5,
  lolAutoCycle: true,
  encryptSourceCode: true
};
let currentFiles = [];
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
export function initApp() {
  bindDOMEvents();
  renderPlaylistDOM();
  startTimebarSimulation();
  refreshStateAndUI();
  scheduleZipSizeUpdate(currentFiles);
}
function refreshStateAndUI() {
  currentFiles = generateSynchronizedFiles(state);
  updateCredentialsUI();
  updateStreamUI();
  updateRpcUI();
  updateMalangUI();
  updateExportUI();
  scheduleZipSizeUpdate(currentFiles);
}
function bindDOMEvents() {
  document.querySelectorAll("[data-tab-target]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = btn.getAttribute("data-tab-target");
      switchTab(target);
    });
  });
  const btnModeSelf = document.getElementById("btnModeSelf");
  const btnModeBot = document.getElementById("btnModeBot");
  if (btnModeSelf && btnModeBot) {
    btnModeSelf.addEventListener("click", () => {
      state.botMode = "selfbot";
      btnModeSelf.classList.add("active-self");
      btnModeBot.classList.remove("active-bot");
      refreshStateAndUI();
    });
    btnModeBot.addEventListener("click", () => {
      state.botMode = "official";
      btnModeBot.classList.add("active-bot");
      btnModeSelf.classList.remove("active-self");
      refreshStateAndUI();
    });
  }
  const btnDownloadZip = document.getElementById("btnDownloadZip");
  const btnDownloadZipExport = document.getElementById("btnDownloadZipExport");
  const triggerZipDownload = async () => {
    if (state.isDownloadingZip) return;
    state.isDownloadingZip = true;
    updateZipButtonsState(true);
    try {
      currentFiles = generateSynchronizedFiles(state);
      const zipSuffix = state.encryptSourceCode !== false ? "protected-vps" : "clean-source";
      const filename = `fadhilbot-${state.botMode}-2026-${zipSuffix}.zip`;
      await exportFilesAsZip(currentFiles, filename);
      const btn1Text = document.getElementById("btnDownloadZipText");
      const btn2Text = document.getElementById("btnDownloadZipExportText");
      if (btn1Text) btn1Text.textContent = `✓ Terunduh (${state.lastCalculatedZipSize || "25 KB"})!`;
      if (btn2Text) btn2Text.textContent = `✓ Terunduh (${state.lastCalculatedZipSize || "25 KB"})!`;
      setTimeout(() => {
        updateZipButtonsState(false);
      }, 2500);
    } catch (err) {
      console.error("[ZIP Export Error]:", err);
      const btn1Text = document.getElementById("btnDownloadZipText");
      const btn2Text = document.getElementById("btnDownloadZipExportText");
      if (btn1Text) btn1Text.textContent = "⚠️ Gagal Unduh";
      if (btn2Text) btn2Text.textContent = "⚠️ Gagal Unduh";
      setTimeout(() => {
        updateZipButtonsState(false);
      }, 3000);
    } finally {
      state.isDownloadingZip = false;
    }
  };
  if (btnDownloadZip) btnDownloadZip.addEventListener("click", triggerZipDownload);
  if (btnDownloadZipExport) btnDownloadZipExport.addEventListener("click", triggerZipDownload);

  const btnModeEncryptOn = document.getElementById("btnModeEncryptOn");
  const btnModeEncryptOff = document.getElementById("btnModeEncryptOff");
  const encryptionStatusBadge = document.getElementById("encryptionStatusBadge");
  const headerSecurityTag = document.getElementById("headerSecurityTag");

  if (btnModeEncryptOn && btnModeEncryptOff) {
    btnModeEncryptOn.addEventListener("click", () => {
      state.encryptSourceCode = true;
      btnModeEncryptOn.classList.add("active");
      btnModeEncryptOff.classList.remove("active");
      if (encryptionStatusBadge) {
        encryptionStatusBadge.textContent = "🔒 ENKRIPSI MUTLAK (PERLINDUNGAN HAK PATEN & PRIVASI 100%)";
        encryptionStatusBadge.className = "card-badge-purple";
      }
      if (headerSecurityTag) {
        headerSecurityTag.innerHTML = "<span>🛡️</span><span>AETHER-OMNI 2026 MUTLAK AKTIF</span>";
        headerSecurityTag.style.background = "rgba(168, 85, 247, 0.18)";
        headerSecurityTag.style.color = "#c084fc";
      }
      refreshStateAndUI();
    });

    btnModeEncryptOff.addEventListener("click", () => {
      state.encryptSourceCode = false;
      btnModeEncryptOff.classList.add("active");
      btnModeEncryptOn.classList.remove("active");
      if (encryptionStatusBadge) {
        encryptionStatusBadge.textContent = "🔓 ENKRIPSI NONAKTIF (KODE MENTAH DEBUG)";
        encryptionStatusBadge.className = "card-badge-success";
      }
      if (headerSecurityTag) {
        headerSecurityTag.innerHTML = "<span>⚠️</span><span>MODE DEBUG MENTAH</span>";
        headerSecurityTag.style.background = "rgba(234, 179, 8, 0.18)";
        headerSecurityTag.style.color = "#facc15";
      }
      refreshStateAndUI();
    });
  }
  const btnCopyEnvHeader = document.getElementById("btnCopyEnvHeader");
  if (btnCopyEnvHeader) {
    btnCopyEnvHeader.addEventListener("click", () => {
      const envFile = currentFiles.find((f) => f.name === ".env");
      if (envFile) {
        copyToClipboard(envFile.content, btnCopyEnvHeader, "Tersalin!", "Salin .env");
      }
    });
  }
  const inputToken = document.getElementById("inputToken");
  const btnToggleMaskToken = document.getElementById("btnToggleMaskToken");
  const btnPasteToken = document.getElementById("btnPasteToken");
  const btnClearToken = document.getElementById("btnClearToken");
  if (inputToken) {
    inputToken.value = state.userToken;
    inputToken.addEventListener("input", (e) => {
      state.userToken = e.target.value;
      refreshStateAndUI();
    });
  }
  if (btnToggleMaskToken) {
    btnToggleMaskToken.addEventListener("click", () => {
      state.maskToken = !state.maskToken;
      inputToken.type = state.maskToken ? "password" : "text";
      btnToggleMaskToken.textContent = state.maskToken ? "\u{1F441}\uFE0F Lihat" : "\u{1F512} Sembunyi";
    });
  }
  if (btnPasteToken) {
    btnPasteToken.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          state.userToken = text.trim();
          inputToken.value = state.userToken;
          refreshStateAndUI();
        }
      } catch (_) {
      }
    });
  }
  if (btnClearToken) {
    btnClearToken.addEventListener("click", () => {
      state.userToken = "";
      inputToken.value = "";
      refreshStateAndUI();
    });
  }
  const inputChannelId = document.getElementById("inputChannelId");
  const inputGuildId = document.getElementById("inputGuildId");
  const btnPresetResmi = document.getElementById("btnPresetResmi");
  if (inputChannelId) {
    inputChannelId.value = state.voiceChannelId;
    inputChannelId.addEventListener("input", (e) => {
      state.voiceChannelId = e.target.value;
      refreshStateAndUI();
    });
  }
  if (inputGuildId) {
    inputGuildId.value = state.voiceGuildId;
    inputGuildId.addEventListener("input", (e) => {
      state.voiceGuildId = e.target.value;
      refreshStateAndUI();
    });
  }
  if (btnPresetResmi) {
    btnPresetResmi.addEventListener("click", () => {
      state.voiceChannelId = "1366441630151737445";
      state.voiceGuildId = "1323944038117675038";
      if (inputChannelId) inputChannelId.value = state.voiceChannelId;
      if (inputGuildId) inputGuildId.value = state.voiceGuildId;
      refreshStateAndUI();
    });
  }
  const chkAutoRejoin = document.getElementById("chkAutoRejoin");
  const rangeRejoinDelay = document.getElementById("rangeRejoinDelay");
  if (chkAutoRejoin) {
    chkAutoRejoin.checked = state.autoRejoin;
    chkAutoRejoin.addEventListener("change", (e) => {
      state.autoRejoin = e.target.checked;
      refreshStateAndUI();
    });
  }
  if (rangeRejoinDelay) {
    rangeRejoinDelay.value = state.rejoinDelaySec;
    rangeRejoinDelay.addEventListener("input", (e) => {
      state.rejoinDelaySec = Number(e.target.value);
      const valLabel = document.getElementById("valRejoinDelay");
      if (valLabel) valLabel.textContent = `${state.rejoinDelaySec} Detik`;
      refreshStateAndUI();
    });
  }
  const rangeCpuPower = document.getElementById("rangeCpuPower");
  if (rangeCpuPower) {
    rangeCpuPower.value = state.cpuPower !== void 0 ? state.cpuPower : 195;
    rangeCpuPower.addEventListener("input", (e) => {
      state.cpuPower = Number(e.target.value);
      refreshStateAndUI();
    });
  }
  document.querySelectorAll("[data-cpu-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = Number(btn.getAttribute("data-cpu-preset"));
      state.cpuPower = p;
      refreshStateAndUI();
    });
  });
  setupButtonGroup("grpResolution", (val) => {
    state.videoMin = val;
    state.videoMax = val;
    refreshStateAndUI();
  });
  setupButtonGroup("grpFps", (val) => {
    state.videoFps = Number(val);
    refreshStateAndUI();
  });
  setupButtonGroup("grpPlaylist", (val) => {
    state.playlistMode = val;
    refreshStateAndUI();
  });
  setupButtonGroup("grpHardwareAccel", (val) => {
    state.hardwareAccel = val;
    refreshStateAndUI();
  });
  const rangeVideoBitrate = document.getElementById("rangeVideoBitrate");
  if (rangeVideoBitrate) {
    rangeVideoBitrate.value = state.videoBitrate;
    rangeVideoBitrate.addEventListener("input", (e) => {
      state.videoBitrate = Number(e.target.value);
      const valLabel = document.getElementById("valVideoBitrate");
      if (valLabel) valLabel.textContent = `${state.videoBitrate} kbps`;
      refreshStateAndUI();
    });
  }
  const rangeAudioGain = document.getElementById("rangeAudioGain");
  if (rangeAudioGain) {
    rangeAudioGain.value = state.audioBoost;
    rangeAudioGain.addEventListener("input", (e) => {
      state.audioBoost = parseFloat(e.target.value);
      const valLabel = document.getElementById("valAudioGain");
      const db = ((state.audioBoost - 1) * 7.08).toFixed(1);
      if (valLabel) valLabel.textContent = `${state.audioBoost.toFixed(2)}x (+${db}dB)`;
      refreshStateAndUI();
    });
  }
  const chkRtcpPli = document.getElementById("chkRtcpPli");
  if (chkRtcpPli) {
    chkRtcpPli.checked = state.rtcpPli;
    chkRtcpPli.addEventListener("change", (e) => {
      state.rtcpPli = e.target.checked;
      refreshStateAndUI();
    });
  }
  const chkDaveRatchet = document.getElementById("chkDaveRatchet");
  if (chkDaveRatchet) {
    chkDaveRatchet.checked = state.daveRatchet;
    chkDaveRatchet.addEventListener("change", (e) => {
      state.daveRatchet = e.target.checked;
      refreshStateAndUI();
    });
  }
  setupButtonGroup("grpRpcType", (val) => {
    state.rpcType = val;
    refreshStateAndUI();
  });
  setupButtonGroup("grpRpcStatus", (val) => {
    state.rpcStatus = val;
    refreshStateAndUI();
  });
  bindTextInput("inputRpcName", "rpcName");
  bindTextInput("inputRpcUrl", "rpcUrl");
  bindTextInput("inputRpcDetails", "rpcDetails");
  bindTextInput("inputRpcState", "rpcState");
  const chkDynamicTimeline = document.getElementById("chkDynamicTimeline");
  if (chkDynamicTimeline) {
    chkDynamicTimeline.checked = state.dynamicTimeline;
    chkDynamicTimeline.addEventListener("change", (e) => {
      state.dynamicTimeline = e.target.checked;
      refreshStateAndUI();
    });
  }
  const chkDynamicTrackSync = document.getElementById("chkDynamicTrackSync");
  if (chkDynamicTrackSync) {
    chkDynamicTrackSync.checked = state.dynamicTrackSync;
    chkDynamicTrackSync.addEventListener("change", (e) => {
      state.dynamicTrackSync = e.target.checked;
      refreshStateAndUI();
    });
  }
  bindTextInput("inputRpcLargeImage", "rpcLargeImage");
  bindTextInput("inputRpcLargeText", "rpcLargeText");
  bindTextInput("inputRpcSmallImage", "rpcSmallImage");
  bindTextInput("inputRpcSmallText", "rpcSmallText");
  bindTextInput("inputRpcAppId", "rpcAppId");
  const chkDualActivityEnabled = document.getElementById("chkDualActivityEnabled");
  if (chkDualActivityEnabled) {
    chkDualActivityEnabled.checked = state.dualActivityEnabled !== false;
    chkDualActivityEnabled.addEventListener("change", (e) => {
      state.dualActivityEnabled = e.target.checked;
      refreshStateAndUI();
    });
  }
  bindTextInput("inputDualActivityName", "dualActivityName");
  bindTextInput("inputDualActivityDetails", "dualActivityDetails");
  bindTextInput("inputDualActivityState", "dualActivityState");
  bindTextInput("inputDualActivityAppId", "dualActivityAppId");
  bindTextInput("inputDualActivityLargeImage", "dualActivityLargeImage");
  setupButtonGroup("grpDualActivityType", (val) => {
    state.dualActivityType = val;
    refreshStateAndUI();
  });
  const rangeDualActivityUptimeHours = document.getElementById("rangeDualActivityUptimeHours");
  if (rangeDualActivityUptimeHours) {
    rangeDualActivityUptimeHours.value = state.dualActivityUptimeHours || 1248;
    rangeDualActivityUptimeHours.addEventListener("input", (e) => {
      state.dualActivityUptimeHours = Number(e.target.value);
      refreshStateAndUI();
    });
  }
  document.querySelectorAll("[data-dual-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-dual-preset");
      document.querySelectorAll("[data-dual-preset]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (preset === "lol") {
        state.dualActivityName = "League of Legends";
        state.dualActivityType = "PLAYING";
        state.dualActivityAppId = "401518687463587841";
        state.dualActivityDetails = "In Champion Select";
        state.dualActivityState = "Ranked Solo/Duo";
        state.dualActivityLargeImage = "champ_yasuo";
        state.dualActivityLargeText = "Picking Yasuo (The Unforgiven)";
        state.dualActivitySmallImage = "rank_master";
        state.dualActivitySmallText = "Master - 240 LP";
        state.dualActivityUptimeHours = 1248;
        state.lolPhase = "champ_select";
        state.lolMode = "Ranked Solo/Duo";
        state.lolChampion = "Yasuo";
        state.lolChampionTitle = "The Unforgiven";
        state.lolRankTier = "Master";
        state.lolRankLp = "240 LP";
        state.lolKda = "8/1/6";
        state.lolChampionLevel = 14;
        state.lolCs = 185;
        state.lolPartyCurrent = 1;
        state.lolPartyMax = 5;
        state.lolAutoCycle = true;
      } else if (preset === "minecraft") {
        state.dualActivityName = "Minecraft";
        state.dualActivityType = "PLAYING";
        state.dualActivityDetails = "Survival Mode (24/7 Dedicated Server)";
        state.dualActivityState = "Hardcore Base - Mining Ancient Debris";
        state.dualActivityAppId = "432980957394370572";
        state.dualActivityLargeImage = "minecraft_logo";
        state.dualActivityLargeText = "Minecraft Java Edition 1.21.x";
        state.dualActivitySmallImage = "diamond_pickaxe";
        state.dualActivitySmallText = "100% Unbroken Uptime (1000+ Jam)";
        state.dualActivityUptimeHours = 1248;
      } else if (preset === "vscode") {
        state.dualActivityName = "Visual Studio Code";
        state.dualActivityType = "PLAYING";
        state.dualActivityDetails = "Workspace: fadhilbot-2026";
        state.dualActivityState = "Editing index.js (TypeScript/Node.js)";
        state.dualActivityAppId = "383226320970055681";
        state.dualActivityLargeImage = "vscode";
        state.dualActivityLargeText = "Visual Studio Code";
        state.dualActivitySmallImage = "node";
        state.dualActivitySmallText = "Node.js 22 LTS";
        state.dualActivityUptimeHours = 840;
      } else if (preset === "gta") {
        state.dualActivityName = "Grand Theft Auto V";
        state.dualActivityType = "PLAYING";
        state.dualActivityDetails = "GTA Online - Los Santos";
        state.dualActivityState = "Cayo Perico Heist Prep";
        state.dualActivityAppId = "382998638668972033";
        state.dualActivityLargeImage = "gtav";
        state.dualActivityLargeText = "Grand Theft Auto V";
        state.dualActivitySmallImage = "online";
        state.dualActivitySmallText = "Crew Session";
        state.dualActivityUptimeHours = 1520;
      } else if (preset === "cs2") {
        state.dualActivityName = "Counter-Strike 2";
        state.dualActivityType = "PLAYING";
        state.dualActivityDetails = "Premier Competitive Match";
        state.dualActivityState = "De_Mirage (Score 12-10)";
        state.dualActivityAppId = "733808418386444358";
        state.dualActivityLargeImage = "cs2";
        state.dualActivityLargeText = "Counter-Strike 2";
        state.dualActivitySmallImage = "global_elite";
        state.dualActivitySmallText = "Ranked S";
        state.dualActivityUptimeHours = 960;
      } else if (preset === "custom") {
        state.dualActivityName = "Custom App / Game";
        state.dualActivityType = "PLAYING";
        state.dualActivityDetails = "Running 24/7 Continuous Session";
        state.dualActivityState = "Uptime 1000+ Jam Valid";
        state.dualActivityAppId = "367827983903490050";
        state.dualActivityLargeImage = "live";
        state.dualActivityLargeText = "Custom Presence";
        state.dualActivitySmallImage = "live";
        state.dualActivitySmallText = "Active";
        state.dualActivityUptimeHours = 1e3;
      }
      refreshStateAndUI();
    });
  });
  const chkLolAutoCycle = document.getElementById("chkLolAutoCycle");
  if (chkLolAutoCycle) {
    chkLolAutoCycle.checked = state.lolAutoCycle !== false;
    chkLolAutoCycle.addEventListener("change", (e) => {
      state.lolAutoCycle = e.target.checked;
      refreshStateAndUI();
    });
  }
  document.querySelectorAll("#grpLolPhase [data-lol-phase]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const phase = btn.getAttribute("data-lol-phase");
      state.lolPhase = phase;
      document.querySelectorAll("#grpLolPhase [data-lol-phase]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const champClean = (state.lolChampion || "Yasuo").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (phase === "queue") {
        state.dualActivityDetails = "In Queue";
        state.dualActivityState = state.lolMode || "Ranked Solo/Duo";
        state.dualActivityLargeImage = "league_icon";
        state.dualActivityLargeText = "League of Legends";
      } else if (phase === "champ_select") {
        state.dualActivityDetails = "In Champion Select";
        state.dualActivityState = state.lolMode || "Ranked Solo/Duo";
        state.dualActivityLargeImage = `champ_${champClean}`;
        state.dualActivityLargeText = `Picking ${state.lolChampion} (${state.lolChampionTitle || "The Unforgiven"})`;
      } else if (phase === "in_game") {
        const mapName = (state.lolMode || "").includes("ARAM") ? "Howling Abyss" : "Summoner's Rift";
        state.dualActivityDetails = mapName;
        state.dualActivityState = `Playing ${state.lolChampion} (${state.lolKda}, Lv${state.lolChampionLevel})`;
        state.dualActivityLargeImage = `champ_${champClean}`;
        state.dualActivityLargeText = `${state.lolChampion} - ${state.lolCs} CS`;
      } else if (phase === "post_game") {
        state.dualActivityDetails = "Match Summary - Victory!";
        state.dualActivityState = `${state.lolMode || "Ranked Solo/Duo"} (+24 LP)`;
        state.dualActivityLargeImage = `champ_${champClean}`;
        state.dualActivityLargeText = `${state.lolChampion} - Victory`;
      } else {
        state.dualActivityDetails = "In Lobby";
        state.dualActivityState = state.lolMode || "Ranked Solo/Duo";
        state.dualActivityLargeImage = "league_icon";
        state.dualActivityLargeText = "League of Legends";
      }
      refreshStateAndUI();
    });
  });
  const selectLolMode = document.getElementById("selectLolMode");
  if (selectLolMode) {
    selectLolMode.value = state.lolMode;
    selectLolMode.addEventListener("change", (e) => {
      state.lolMode = e.target.value;
      if (state.lolPhase === "queue" || state.lolPhase === "champ_select" || state.lolPhase === "lobby") {
        state.dualActivityState = state.lolMode;
      }
      refreshStateAndUI();
    });
  }
  const selectLolRankTier = document.getElementById("selectLolRankTier");
  if (selectLolRankTier) {
    selectLolRankTier.value = state.lolRankTier;
    selectLolRankTier.addEventListener("change", (e) => {
      state.lolRankTier = e.target.value;
      state.dualActivitySmallImage = `rank_${state.lolRankTier.toLowerCase()}`;
      state.dualActivitySmallText = `${state.lolRankTier} - ${state.lolRankLp}`;
      refreshStateAndUI();
    });
  }
  const inputLolRankLp = document.getElementById("inputLolRankLp");
  if (inputLolRankLp) {
    inputLolRankLp.value = state.lolRankLp;
    inputLolRankLp.addEventListener("input", (e) => {
      state.lolRankLp = e.target.value;
      state.dualActivitySmallText = `${state.lolRankTier} - ${state.lolRankLp}`;
      refreshStateAndUI();
    });
  }
  document.querySelectorAll("#grpLolChampPresets [data-lol-champ]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const champ = btn.getAttribute("data-lol-champ");
      const title = btn.getAttribute("data-lol-title") || "";
      state.lolChampion = champ;
      state.lolChampionTitle = title;
      document.querySelectorAll("#grpLolChampPresets [data-lol-champ]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const inputChamp = document.getElementById("inputLolChampion");
      const inputTitle = document.getElementById("inputLolChampionTitle");
      if (inputChamp) inputChamp.value = champ;
      if (inputTitle) inputTitle.value = title;
      const champClean = champ.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (state.lolPhase === "champ_select") {
        state.dualActivityLargeImage = `champ_${champClean}`;
        state.dualActivityLargeText = `Picking ${champ} (${title})`;
      } else if (state.lolPhase === "in_game") {
        state.dualActivityLargeImage = `champ_${champClean}`;
        state.dualActivityLargeText = `${champ} - ${state.lolCs} CS`;
        state.dualActivityState = `Playing ${champ} (${state.lolKda}, Lv${state.lolChampionLevel})`;
      }
      refreshStateAndUI();
    });
  });
  const inputLolChampion = document.getElementById("inputLolChampion");
  if (inputLolChampion) {
    inputLolChampion.value = state.lolChampion;
    inputLolChampion.addEventListener("input", (e) => {
      state.lolChampion = e.target.value;
      refreshStateAndUI();
    });
  }
  const inputLolChampionTitle = document.getElementById("inputLolChampionTitle");
  if (inputLolChampionTitle) {
    inputLolChampionTitle.value = state.lolChampionTitle;
    inputLolChampionTitle.addEventListener("input", (e) => {
      state.lolChampionTitle = e.target.value;
      refreshStateAndUI();
    });
  }
  const inputLolKda = document.getElementById("inputLolKda");
  if (inputLolKda) {
    inputLolKda.value = state.lolKda;
    inputLolKda.addEventListener("input", (e) => {
      state.lolKda = e.target.value;
      if (state.lolPhase === "in_game") {
        state.dualActivityState = `Playing ${state.lolChampion} (${state.lolKda}, Lv${state.lolChampionLevel})`;
      }
      refreshStateAndUI();
    });
  }
  const inputLolLevel = document.getElementById("inputLolLevel");
  if (inputLolLevel) {
    inputLolLevel.value = state.lolChampionLevel;
    inputLolLevel.addEventListener("input", (e) => {
      state.lolChampionLevel = parseInt(e.target.value, 10) || 1;
      if (state.lolPhase === "in_game") {
        state.dualActivityState = `Playing ${state.lolChampion} (${state.lolKda}, Lv${state.lolChampionLevel})`;
      }
      refreshStateAndUI();
    });
  }
  const inputLolCs = document.getElementById("inputLolCs");
  if (inputLolCs) {
    inputLolCs.value = state.lolCs;
    inputLolCs.addEventListener("input", (e) => {
      state.lolCs = parseInt(e.target.value, 10) || 0;
      if (state.lolPhase === "in_game") {
        state.dualActivityLargeText = `${state.lolChampion} - ${state.lolCs} CS`;
      }
      refreshStateAndUI();
    });
  }
  const inputLolPartyCurrent = document.getElementById("inputLolPartyCurrent");
  if (inputLolPartyCurrent) {
    inputLolPartyCurrent.value = state.lolPartyCurrent;
    inputLolPartyCurrent.addEventListener("input", (e) => {
      state.lolPartyCurrent = parseInt(e.target.value, 10) || 1;
      refreshStateAndUI();
    });
  }
  const inputLolPartyMax = document.getElementById("inputLolPartyMax");
  if (inputLolPartyMax) {
    inputLolPartyMax.value = state.lolPartyMax;
    inputLolPartyMax.addEventListener("input", (e) => {
      state.lolPartyMax = parseInt(e.target.value, 10) || 5;
      refreshStateAndUI();
    });
  }
  const btnToggleAdvancedRpc = document.getElementById("btnToggleAdvancedRpc");
  const bodyAdvancedRpc = document.getElementById("bodyAdvancedRpc");
  const iconAdvancedRpc = document.getElementById("iconAdvancedRpc");
  if (btnToggleAdvancedRpc && bodyAdvancedRpc) {
    btnToggleAdvancedRpc.addEventListener("click", () => {
      const isOpen = bodyAdvancedRpc.classList.toggle("open");
      if (iconAdvancedRpc) iconAdvancedRpc.textContent = isOpen ? "\u25B2" : "\u25BC";
    });
  }
  const rpcViewButtons = document.querySelectorAll("#grpRpcViewMode [data-rpc-view]");
  const cardRpcActivity = document.getElementById("cardRpcActivity");
  const cardRpcPlaylist = document.getElementById("cardRpcPlaylist");
  const rpcViewHintText = document.getElementById("rpcViewHintText");
  const updateRpcViewMode = (mode) => {
    state.rpcViewMode = mode;
    rpcViewButtons.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-rpc-view") === mode);
    });
    if (mode === "status") {
      if (cardRpcActivity) {
        cardRpcActivity.style.display = "flex";
        cardRpcActivity.style.flexDirection = "column";
      }
      if (cardRpcPlaylist) cardRpcPlaylist.style.display = "none";
      if (rpcViewHintText) rpcViewHintText.textContent = "\u{1F4A1} Mode: Status & Profil Discord (Fokus, Luas, Tanpa Sesak)";
    } else if (mode === "playlist") {
      if (cardRpcActivity) cardRpcActivity.style.display = "none";
      if (cardRpcPlaylist) {
        cardRpcPlaylist.style.display = "flex";
        cardRpcPlaylist.style.flexDirection = "column";
      }
      if (rpcViewHintText) rpcViewHintText.textContent = "\u{1F4A1} Mode: Sumber Lagu & Media Playlist (Tampilan Penuh)";
    } else {
      if (cardRpcActivity) {
        cardRpcActivity.style.display = "flex";
        cardRpcActivity.style.flexDirection = "column";
      }
      if (cardRpcPlaylist) {
        cardRpcPlaylist.style.display = "flex";
        cardRpcPlaylist.style.flexDirection = "column";
      }
      if (rpcViewHintText) rpcViewHintText.textContent = "\u{1F4A1} Mode: Tampilan Bersanding Lengkap";
    }
  };
  rpcViewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-rpc-view");
      updateRpcViewMode(mode);
    });
  });
  const btnAddTrack = document.getElementById("btnAddTrack");
  if (btnAddTrack) {
    btnAddTrack.addEventListener("click", () => {
      const num = state.playlist.length + 1;
      state.playlist.push({
        id: `track_${num}`,
        title: `Lagu Baru #${num}`,
        durationSec: 210,
        videoFile: `assets/track_${num}.mp4`,
        audioFile: `assets/track_${num}.mp3`,
        imageFile: `assets/track_${num}.png`,
        imageAsset: "youtube",
        resolution: "480p"
      });
      state.activePreviewTrackIndex = state.playlist.length - 1;
      state.timebarElapsedSec = 0;
      renderPlaylistDOM();
      refreshStateAndUI();
    });
  }
  const btnQuickAddDemoTrack = document.getElementById("btnQuickAddDemoTrack");
  if (btnQuickAddDemoTrack) {
    btnQuickAddDemoTrack.addEventListener("click", () => {
      state.playlist.push({
        id: "newmusic",
        title: "New Music Hit 2026",
        durationSec: 215,
        videoFile: "assets/newmusic.mp4",
        audioFile: "assets/newmusic.mp3",
        imageFile: "assets/newmusic.png",
        imageAsset: "newmusic",
        resolution: "480p"
      });
      state.activePreviewTrackIndex = state.playlist.length - 1;
      state.timebarElapsedSec = 0;
      renderPlaylistDOM();
      refreshStateAndUI();
    });
  }
  const btnResetTimebarSim = document.getElementById("btnResetTimebarSim");
  if (btnResetTimebarSim) {
    btnResetTimebarSim.addEventListener("click", () => {
      state.timebarElapsedSec = 0;
      const currentTrack = state.playlist[state.activePreviewTrackIndex] || state.playlist[0] || { durationSec: 235 };
      updateTimebarDisplay(currentTrack.durationSec || 235);
    });
  }
  const btnToggleTimebarPlay = document.getElementById("btnToggleTimebarPlay");
  if (btnToggleTimebarPlay) {
    btnToggleTimebarPlay.addEventListener("click", () => {
      state.timebarPlaying = !state.timebarPlaying;
      btnToggleTimebarPlay.textContent = state.timebarPlaying ? "\u23F8\uFE0F Jeda" : "\u25B6\uFE0F Mulai";
      btnToggleTimebarPlay.style.color = state.timebarPlaying ? "#10b981" : "#f59e0b";
    });
  }
  document.addEventListener("click", () => {
    document.querySelectorAll(".track-menu-dropdown").forEach((m) => {
      m.style.display = "none";
    });
  });
  document.querySelectorAll("[data-malang-subtab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-malang-subtab");
      state.activeMalangSubTab = target;
      document.querySelectorAll("[data-malang-subtab]").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      document.querySelectorAll(".malang-subtab-panel").forEach((panel) => {
        panel.style.display = panel.id === `malangPanel_${target}` ? "block" : "none";
      });
    });
  });
  setupButtonGroup("grpRtcRegion", (val) => {
    state.malangRtcRegion = val;
    refreshStateAndUI();
  });
  setupButtonGroup("grpAudioBitrate", (val) => {
    state.audioBitrate = Number(val);
    refreshStateAndUI();
  });
  const chkAntiJamming = document.getElementById("chkAntiJamming");
  if (chkAntiJamming) {
    chkAntiJamming.checked = state.antiJamming;
    chkAntiJamming.addEventListener("change", (e) => {
      state.antiJamming = e.target.checked;
      refreshStateAndUI();
    });
  }
  const chkMalangPeering = document.getElementById("chkMalangPeering");
  if (chkMalangPeering) {
    chkMalangPeering.checked = state.malangPeering;
    chkMalangPeering.addEventListener("change", (e) => {
      state.malangPeering = e.target.checked;
      refreshStateAndUI();
    });
  }
  setupPromptCopyButtons();
  setupExportFileSelector();
  setupTerminalCopyButtons();
}
function setupTerminalCopyButtons() {
  document.querySelectorAll(".btn-copy-term").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-copy-cmd");
      if (!cmd) return;
      navigator.clipboard.writeText(cmd).then(() => {
        const oldText = btn.textContent;
        btn.textContent = "✓ Tersalin!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = oldText;
          btn.classList.remove("copied");
        }, 2000);
      }).catch(() => {});
    });
  });
}
function switchTab(tabKey) {
  state.activeTab = tabKey;
  document.querySelectorAll("[data-tab-target]").forEach((btn) => {
    const isTarget = btn.getAttribute("data-tab-target") === tabKey;
    btn.classList.toggle("active", isTarget);
  });
  document.querySelectorAll(".tab-content").forEach((panel) => {
    const isPanel = panel.id === `tabContent_${tabKey}`;
    panel.classList.toggle("active", isPanel);
  });
  if (tabKey === "export") {
    updateExportUI();
  }
}
function setupButtonGroup(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const buttons = container.querySelectorAll("[data-val]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active", "active-indigo"));
      btn.classList.add(btn.dataset.theme === "indigo" ? "active-indigo" : "active");
      const val = btn.getAttribute("data-val");
      onSelect(val);
    });
  });
}
function bindTextInput(elemId, stateKey) {
  const elem = document.getElementById(elemId);
  if (!elem) return;
  elem.value = state[stateKey];
  elem.addEventListener("input", (e) => {
    state[stateKey] = e.target.value;
    refreshStateAndUI();
  });
}
function updateCredentialsUI() {
  const analysis = analyzeDiscordToken(state.userToken);
  const badgeValid = document.getElementById("tokenValidationBadge");
  if (badgeValid) {
    if (analysis.isValid) {
      badgeValid.textContent = `\u2713 Format Valid (${analysis.createdAt || "Discord User"})`;
      badgeValid.className = "card-badge-success";
    } else {
      badgeValid.textContent = "Format Perlu Dicek";
      badgeValid.className = "card-badge-purple";
    }
  }
}
function updateStreamUI() {
  const strip = document.getElementById("streamSummaryStrip");
  if (strip) {
    strip.textContent = `Power CPU: ${state.cpuPower || 195}% | Resolusi: ${state.videoMin}-${state.videoMax} @ ${state.videoFps} FPS | Bitrate: ${state.videoBitrate}k | GPU: ${state.hardwareAccel.toUpperCase()} | BOOST: ${state.audioBoost.toFixed(2)}x`;
  }
  const cpuVal = Number(state.cpuPower !== void 0 ? state.cpuPower : 195);
  const audioAlloc = (cpuVal * (118.5 / 195)).toFixed(1);
  const videoAlloc = (cpuVal * (68 / 195)).toFixed(1);
  const webrtcAlloc = (cpuVal * (8.5 / 195)).toFixed(1);
  const headroom = (200 - cpuVal).toFixed(1);
  const threads = cpuVal >= 150 ? 4 : cpuVal >= 90 ? 3 : cpuVal >= 40 ? 2 : 1;
  const valCpuPowerDisplay = document.getElementById("valCpuPowerDisplay");
  if (valCpuPowerDisplay) valCpuPowerDisplay.textContent = `${cpuVal}%`;
  const rangeCpuPower = document.getElementById("rangeCpuPower");
  if (rangeCpuPower && Number(rangeCpuPower.value) !== cpuVal) rangeCpuPower.value = cpuVal;
  const valCpuPowerBadge = document.getElementById("valCpuPowerBadge");
  if (valCpuPowerBadge) {
    const profileTag = cpuVal >= 180 ? "MAX POWER / TURBO" : cpuVal >= 120 ? "HIGH EFFICIENCY" : cpuVal >= 70 ? "BALANCED" : "ECO DEFENSE";
    valCpuPowerBadge.textContent = `${cpuVal}% [${profileTag}]`;
  }
  const valMeterAudio = document.getElementById("valMeterAudio");
  if (valMeterAudio) valMeterAudio.textContent = `${audioAlloc}%`;
  const valMeterVideo = document.getElementById("valMeterVideo");
  if (valMeterVideo) valMeterVideo.textContent = `${videoAlloc}%`;
  const valMeterWebRtc = document.getElementById("valMeterWebRtc");
  if (valMeterWebRtc) valMeterWebRtc.textContent = `${webrtcAlloc}%`;
  const valMeterHeadroom = document.getElementById("valMeterHeadroom");
  if (valMeterHeadroom) valMeterHeadroom.textContent = `${headroom}%`;
  const valMeterThreads = document.getElementById("valMeterThreads");
  if (valMeterThreads) valMeterThreads.textContent = `${threads} Threads FFmpeg`;
  document.querySelectorAll("[data-cpu-preset]").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.getAttribute("data-cpu-preset")) === cpuVal);
  });
}
let timebarInterval = null;
function startTimebarSimulation() {
  if (timebarInterval) clearInterval(timebarInterval);
  timebarInterval = setInterval(() => {
    if (!state.timebarPlaying) return;
    const currentTrack = state.playlist[state.activePreviewTrackIndex] || state.playlist[0] || { durationSec: 235 };
    const maxSec = Math.max(10, currentTrack.durationSec || 235);
    state.timebarElapsedSec = (state.timebarElapsedSec + 1) % maxSec;
    updateTimebarDisplay(maxSec);
  }, 1e3);
}
function updateTimebarDisplay(durationSec) {
  const fill = document.getElementById("previewProgressFill");
  const elapsedElem = document.getElementById("previewTimeElapsed");
  const remainElem = document.getElementById("previewTimeRemaining");
  const durationDisplay = document.getElementById("previewDurationDisplay");
  const currentElapsed = state.timebarElapsedSec;
  const remaining = Math.max(0, durationSec - currentElapsed);
  const pct = Math.min(100, Math.max(0, currentElapsed / durationSec * 100));
  if (fill) fill.style.width = `${pct.toFixed(1)}%`;
  if (elapsedElem) elapsedElem.textContent = formatTime(currentElapsed);
  if (remainElem) remainElem.textContent = `-${formatTime(remaining)}`;
  if (durationDisplay) durationDisplay.textContent = `${durationSec} Detik (${formatTime(durationSec)})`;
}
function renderPlaylistDOM() {
  const container = document.getElementById("trackCardsList");
  const selector = document.getElementById("previewTrackSelector");
  const countInfo = document.getElementById("previewTrackCountInfo");
  const badgeCount = document.getElementById("rpcTrackCountBadge");
  if (countInfo) {
    countInfo.textContent = `${state.playlist.length} Lagu Aktif`;
  }
  if (badgeCount) {
    badgeCount.textContent = `${state.playlist.length} Lagu`;
  }
  if (selector) {
    selector.innerHTML = "";
    state.playlist.forEach((track, idx) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `preview-pill ${idx === state.activePreviewTrackIndex ? "active" : ""}`;
      pill.id = `previewPill_${idx}`;
      pill.innerHTML = `<span>#${idx + 1} ${escapeHtml(track.title.substring(0, 14))}${track.title.length > 14 ? "..." : ""}</span>`;
      pill.addEventListener("click", () => {
        state.activePreviewTrackIndex = idx;
        state.timebarElapsedSec = 0;
        updateRpcUI();
      });
      selector.appendChild(pill);
    });
  }
  if (!container) return;
  container.innerHTML = "";
  state.playlist.forEach((track, idx) => {
    const card = document.createElement("div");
    card.className = `track-card ${idx === state.activePreviewTrackIndex ? "active-preview" : ""}`;
    card.id = `trackCard_${idx}`;
    card.innerHTML = `
      <div class="track-card-head">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="track-badge-num">#${idx + 1}</span>
          <span class="track-title-label" style="font-size: 12px; font-weight: 800; color: #fff;">${escapeHtml(track.title)}</span>
          <span class="track-duration-label" style="font-size: 10px; color: #10b981; font-family: var(--font-mono); font-weight: 700;">\u23F1\uFE0F ${track.durationSec}s (${formatTime(track.durationSec)})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; position: relative;">
          <button type="button" class="btn-secondary btn-preview-track" style="padding: 3px 8px; font-size: 10px;" title="Uji di Live Preview Discord">
            ${idx === state.activePreviewTrackIndex ? "\u2713 Aktif Preview" : "\u{1F441}\uFE0F Uji Preview"}
          </button>
          <button type="button" class="btn-dots" title="Menu Opsi Lagu &amp; Cover">\u22EF</button>
          ${state.playlist.length > 1 ? `
          <button type="button" class="btn-secondary opt-quick-delete" style="padding: 3px 6px; font-size: 10px; color: #f87171;" title="Hapus lagu ini">
            \u{1F5D1}\uFE0F
          </button>` : ""}
          <div class="track-menu-dropdown" style="display: none;">
            <button type="button" class="track-menu-item opt-set-preview">
              <span>\u{1F441}\uFE0F</span><span>Pasang di Live Preview</span>
            </button>
            <button type="button" class="track-menu-item opt-pick-image">
              <span>\u{1F5BC}\uFE0F</span><span>Pilih Direktori Cover Lagu</span>
            </button>
            <button type="button" class="track-menu-item opt-move-top">
              <span>\u2B50</span><span>Set Sebagai Lagu Utama (#1)</span>
            </button>
            <button type="button" class="track-menu-item opt-duplicate">
              <span>\u{1F4CB}</span><span>Duplikasi Lagu Ini</span>
            </button>
            ${state.playlist.length > 1 ? `
            <button type="button" class="track-menu-item danger opt-delete">
              <span>\u{1F5D1}\uFE0F</span><span>Hapus Lagu Ini</span>
            </button>` : ""}
          </div>
        </div>
      </div>

      <!-- Baris 1: Judul & Durasi -->
      <div class="track-grid-row2">
        <div class="field-group">
          <label class="field-label">Judul Lagu / Aktivitas:</label>
          <input type="text" class="input-box track-input-title" value="${escapeHtml(track.title)}" placeholder="Contoh: KANA-BOON - \u3050\u3089\u3067\u30FC\u3057\u3087\u3093" />
        </div>
        <div class="field-group">
          <label class="field-label">Durasi Lagu (Detik - Timebar Akurat):</label>
          <input type="number" min="10" max="7200" class="input-box track-input-duration" value="${track.durationSec}" placeholder="235" />
        </div>
      </div>

      <!-- Baris 2: Video MP4 & Audio MP3 -->
      <div class="track-grid-row2">
        <div class="field-group">
          <label class="field-label">Jalur Berkas Video (MP4 / WebM):</label>
          <input type="text" class="input-box track-input-video" value="${escapeHtml(track.videoFile)}" placeholder="assets/video.mp4" />
        </div>
        <div class="field-group">
          <label class="field-label">Jalur Berkas Audio (MP3 / Opus / M4A):</label>
          <input type="text" class="input-box track-input-audio" value="${escapeHtml(track.audioFile)}" placeholder="assets/audio.mp3" />
        </div>
      </div>

      <!-- Baris 3: Cover Gambar & Info Status -->
      <div class="track-grid-row3">
        <div class="field-group">
          <label class="field-label">Direktori Cover / Gambar Lagu:</label>
          <div class="input-with-action">
            <input type="text" class="input-box track-input-image" value="${escapeHtml(track.imageFile || track.imageAsset || "")}" placeholder="assets/cover.png / youtube / aizo" />
            <button type="button" class="btn-dots btn-quick-image-menu" title="Pilih preset gambar lagu ini">\u22EF</button>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Resolusi &amp; Status:</label>
          <div style="height: 36px; background: rgba(3, 7, 18, 0.7); border: 1px solid rgba(51, 65, 85, 0.8); border-radius: 6px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">${track.resolution || "480p Adaptive"}</span>
            <span style="font-size: 9px; color: #10b981; font-weight: 700;">\u2713 SINKRON</span>
          </div>
        </div>
      </div>
    `;
    const inputTitle = card.querySelector(".track-input-title");
    const inputDuration = card.querySelector(".track-input-duration");
    const inputVideo = card.querySelector(".track-input-video");
    const inputAudio = card.querySelector(".track-input-audio");
    const inputImage = card.querySelector(".track-input-image");
    const titleLabel = card.querySelector(".track-title-label");
    const durationLabel = card.querySelector(".track-duration-label");
    const btnPreview = card.querySelector(".btn-preview-track");
    const btnDots = card.querySelector(".btn-dots");
    const menuDropdown = card.querySelector(".track-menu-dropdown");
    const btnQuickImg = card.querySelector(".btn-quick-image-menu");
    const btnQuickDelete = card.querySelector(".opt-quick-delete");
    inputTitle.addEventListener("input", (e) => {
      track.title = e.target.value;
      if (titleLabel) titleLabel.textContent = e.target.value || `Track #${idx + 1}`;
      const pill = document.getElementById(`previewPill_${idx}`);
      if (pill) {
        pill.innerHTML = `<span>#${idx + 1} ${escapeHtml((track.title || "").substring(0, 14))}${track.title.length > 14 ? "..." : ""}</span>`;
      }
      currentFiles = generateSynchronizedFiles(state);
      updateRpcUI();
      scheduleZipSizeUpdate(currentFiles);
      if (state.activeTab === "export") updateExportUI();
    });
    inputDuration.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      track.durationSec = !isNaN(val) && val > 0 ? val : 120;
      if (durationLabel) {
        durationLabel.textContent = `\u23F1\uFE0F ${track.durationSec}s (${formatTime(track.durationSec)})`;
      }
      currentFiles = generateSynchronizedFiles(state);
      updateRpcUI();
      scheduleZipSizeUpdate(currentFiles);
      if (state.activeTab === "export") updateExportUI();
    });
    inputVideo.addEventListener("input", (e) => {
      track.videoFile = e.target.value;
      currentFiles = generateSynchronizedFiles(state);
      scheduleZipSizeUpdate(currentFiles);
      if (state.activeTab === "export") updateExportUI();
    });
    inputAudio.addEventListener("input", (e) => {
      track.audioFile = e.target.value;
      currentFiles = generateSynchronizedFiles(state);
      scheduleZipSizeUpdate(currentFiles);
      if (state.activeTab === "export") updateExportUI();
    });
    inputImage.addEventListener("input", (e) => {
      track.imageFile = e.target.value;
      track.imageAsset = e.target.value;
      currentFiles = generateSynchronizedFiles(state);
      updateRpcUI();
      scheduleZipSizeUpdate(currentFiles);
      if (state.activeTab === "export") updateExportUI();
    });
    btnPreview.addEventListener("click", () => {
      state.activePreviewTrackIndex = idx;
      state.timebarElapsedSec = 0;
      updateRpcUI();
    });
    const toggleMenu = (e) => {
      e.stopPropagation();
      document.querySelectorAll(".track-menu-dropdown").forEach((m) => {
        if (m !== menuDropdown) m.style.display = "none";
      });
      menuDropdown.style.display = menuDropdown.style.display === "block" ? "none" : "block";
    };
    btnDots.addEventListener("click", toggleMenu);
    btnQuickImg.addEventListener("click", toggleMenu);
    const optSetPreview = card.querySelector(".opt-set-preview");
    if (optSetPreview) {
      optSetPreview.addEventListener("click", () => {
        state.activePreviewTrackIndex = idx;
        state.timebarElapsedSec = 0;
        menuDropdown.style.display = "none";
        updateRpcUI();
      });
    }
    const optPickImage = card.querySelector(".opt-pick-image");
    if (optPickImage) {
      optPickImage.addEventListener("click", () => {
        menuDropdown.style.display = "none";
        const cleanName = track.title.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 12);
        const choice = prompt(
          `Pilih atau ketik direktori gambar untuk "${track.title}":
1. assets/${cleanName}.png
2. youtube
3. aizo
Atau masukkan URL/path gambar kustom:`,
          track.imageFile || `assets/${cleanName}.png`
        );
        if (choice) {
          track.imageFile = choice.trim();
          track.imageAsset = choice.trim();
          inputImage.value = choice.trim();
          currentFiles = generateSynchronizedFiles(state);
          updateRpcUI();
          scheduleZipSizeUpdate(currentFiles);
          if (state.activeTab === "export") updateExportUI();
        }
      });
    }
    const optMoveTop = card.querySelector(".opt-move-top");
    if (optMoveTop) {
      optMoveTop.addEventListener("click", () => {
        menuDropdown.style.display = "none";
        if (idx > 0) {
          const [moved] = state.playlist.splice(idx, 1);
          state.playlist.unshift(moved);
          state.activePreviewTrackIndex = 0;
          state.timebarElapsedSec = 0;
          renderPlaylistDOM();
          refreshStateAndUI();
        }
      });
    }
    const optDuplicate = card.querySelector(".opt-duplicate");
    if (optDuplicate) {
      optDuplicate.addEventListener("click", () => {
        menuDropdown.style.display = "none";
        const copy = {
          ...track,
          id: `${track.id}_copy_${Date.now().toString().slice(-4)}`,
          title: `${track.title} (Salinan)`
        };
        state.playlist.splice(idx + 1, 0, copy);
        state.activePreviewTrackIndex = idx + 1;
        state.timebarElapsedSec = 0;
        renderPlaylistDOM();
        refreshStateAndUI();
      });
    }
    const deleteAction = () => {
      menuDropdown.style.display = "none";
      if (state.playlist.length > 1) {
        state.playlist.splice(idx, 1);
        if (state.activePreviewTrackIndex >= state.playlist.length) {
          state.activePreviewTrackIndex = state.playlist.length - 1;
        }
        state.timebarElapsedSec = 0;
        renderPlaylistDOM();
        refreshStateAndUI();
      }
    };
    const optDelete = card.querySelector(".opt-delete");
    if (optDelete) optDelete.addEventListener("click", deleteAction);
    if (btnQuickDelete) btnQuickDelete.addEventListener("click", deleteAction);
    container.appendChild(card);
  });
}
function updateRpcUI() {
  const currentTrack = state.playlist[state.activePreviewTrackIndex] || state.playlist[0] || {
    title: "KANA-BOON - \u3050\u3089\u3067\u30FC\u3057\u3087\u3093",
    durationSec: 235,
    imageAsset: "youtube"
  };
  document.querySelectorAll(".preview-pill").forEach((pill, pIdx) => {
    pill.classList.toggle("active", pIdx === state.activePreviewTrackIndex);
  });
  document.querySelectorAll(".track-card").forEach((c, cIdx) => {
    c.classList.toggle("active-preview", cIdx === state.activePreviewTrackIndex);
    const btn = c.querySelector(".btn-preview-track");
    if (btn) {
      btn.textContent = cIdx === state.activePreviewTrackIndex ? "\u2713 Aktif Preview" : "\u{1F441}\uFE0F Uji Preview";
    }
  });
  const previewTitle = document.getElementById("previewTrackTitle");
  const previewDetails = document.getElementById("previewTrackDetails");
  const previewState = document.getElementById("previewTrackState");
  const previewAvatarStatus = document.getElementById("previewAvatarStatus");
  const previewTypeBadge = document.getElementById("previewTypeBadge");
  const previewAlbumArtText = document.getElementById("previewAlbumArtText");
  const progressBarWrap = document.getElementById("previewProgressBarWrap");
  const grpRpcUrlContainer = document.getElementById("grpRpcUrlContainer");
  if (previewTitle) {
    let titleStr = state.rpcName || currentTrack.title;
    if (titleStr.includes("{title}") || titleStr.includes("{track}")) {
      titleStr = titleStr.replace(/\{title\}|\{track\}/gi, currentTrack.title);
    }
    previewTitle.textContent = titleStr;
  }
  if (previewDetails) {
    let detailsStr = state.rpcDetails || currentTrack.title;
    if (detailsStr.includes("{title}") || detailsStr.includes("{track}")) {
      detailsStr = detailsStr.replace(/\{title\}|\{track\}/gi, currentTrack.title);
    }
    previewDetails.textContent = detailsStr;
  }
  if (previewState) {
    let stateStr = state.rpcState || "Di Voice: #Music 24/7 (480p Boosted)";
    if (stateStr.includes("{channel}") || stateStr.includes("{voice}")) {
      stateStr = stateStr.replace(/\{channel\}|\{voice\}/gi, "Music 24/7");
    }
    previewState.textContent = stateStr;
  }
  if (previewAlbumArtText) {
    const rawUrl = state.rpcUrl || "";
    const isAizo = currentTrack.id === "aizo" || currentTrack.title && currentTrack.title.toUpperCase().includes("AIZO");
    const ytIdMatch = rawUrl.match(/(?:youtu\.be\/|v\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/);
    const ytId = ytIdMatch ? ytIdMatch[1] : isAizo ? "Gz3e_6Y58uA" : "L5rL0pBzmAE";
    const thumbUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    previewAlbumArtText.innerHTML = `<img src="${thumbUrl}" alt="Album Art" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none; font-size: 9px; font-weight: bold; color: #fff;">${escapeHtml((currentTrack.title || "MUSIC").substring(0, 6).toUpperCase())}</span>`;
  }
  if (grpRpcUrlContainer) {
    grpRpcUrlContainer.style.display = state.rpcType === "STREAMING" ? "block" : "none";
  }
  if (previewTypeBadge) {
    const typeLabelMap = {
      STREAMING: "SEDANG STREAMING",
      PLAYING: "SEDANG MEMAINKAN",
      LISTENING: "MENDENGARKAN",
      WATCHING: "MENONTON",
      COMPETING: "BERKOMPETISI"
    };
    previewTypeBadge.textContent = typeLabelMap[state.rpcType] || `SEDANG ${state.rpcType}`;
  }
  if (previewAvatarStatus) {
    if (state.rpcStatus === "online") previewAvatarStatus.style.background = "#23a55a";
    else if (state.rpcStatus === "idle") previewAvatarStatus.style.background = "#f0b232";
    else previewAvatarStatus.style.background = "#f23f43";
  }
  if (progressBarWrap) {
    progressBarWrap.style.display = state.dynamicTimeline ? "flex" : "none";
  }
  updateTimebarDisplay(currentTrack.durationSec || 235);
  const grpRpcType = document.getElementById("grpRpcType");
  if (grpRpcType) {
    grpRpcType.querySelectorAll("[data-val]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-val") === state.rpcType);
    });
  }
  const grpRpcStatus = document.getElementById("grpRpcStatus");
  if (grpRpcStatus) {
    grpRpcStatus.querySelectorAll("[data-val]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-val") === state.rpcStatus);
    });
  }
  const chkDualActivityEnabled = document.getElementById("chkDualActivityEnabled");
  if (chkDualActivityEnabled) chkDualActivityEnabled.checked = state.dualActivityEnabled !== false;
  const inputDualActivityName = document.getElementById("inputDualActivityName");
  if (inputDualActivityName && document.activeElement !== inputDualActivityName) {
    inputDualActivityName.value = state.dualActivityName || "Minecraft";
  }
  const inputDualActivityDetails = document.getElementById("inputDualActivityDetails");
  if (inputDualActivityDetails && document.activeElement !== inputDualActivityDetails) {
    inputDualActivityDetails.value = state.dualActivityDetails || "Survival Mode (24/7 Dedicated Server)";
  }
  const inputDualActivityState = document.getElementById("inputDualActivityState");
  if (inputDualActivityState && document.activeElement !== inputDualActivityState) {
    inputDualActivityState.value = state.dualActivityState || "Hardcore Base - Mining Ancient Debris";
  }
  const rangeDualActivityUptimeHours = document.getElementById("rangeDualActivityUptimeHours");
  if (rangeDualActivityUptimeHours && document.activeElement !== rangeDualActivityUptimeHours) {
    rangeDualActivityUptimeHours.value = state.dualActivityUptimeHours || 1248;
  }
  const valDualActivityUptimeHours = document.getElementById("valDualActivityUptimeHours");
  if (valDualActivityUptimeHours) {
    const hrs = Number(state.dualActivityUptimeHours || 1248);
    const days = Math.floor(hrs / 24);
    valDualActivityUptimeHours.textContent = `${hrs.toLocaleString()} Jam (${days} Hari Nonstop)`;
  }
  const inputDualActivityAppId = document.getElementById("inputDualActivityAppId");
  if (inputDualActivityAppId && document.activeElement !== inputDualActivityAppId) {
    inputDualActivityAppId.value = state.dualActivityAppId || "432980957394370572";
  }
  const inputDualActivityLargeImage = document.getElementById("inputDualActivityLargeImage");
  if (inputDualActivityLargeImage && document.activeElement !== inputDualActivityLargeImage) {
    inputDualActivityLargeImage.value = state.dualActivityLargeImage || "minecraft_logo";
  }
  const grpDualActivityType = document.getElementById("grpDualActivityType");
  if (grpDualActivityType) {
    grpDualActivityType.querySelectorAll("[data-val]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-val") === (state.dualActivityType || "PLAYING"));
    });
  }
  const isLol = (state.dualActivityName || "").toLowerCase().includes("league of legends") || (state.dualActivityName || "").toLowerCase() === "lol";
  const cardLoLSpecial = document.getElementById("cardLoLSpecial");
  if (cardLoLSpecial) {
    cardLoLSpecial.style.display = isLol ? "flex" : "none";
  }
  if (isLol) {
    const chkLolAuto = document.getElementById("chkLolAutoCycle");
    if (chkLolAuto) chkLolAuto.checked = state.lolAutoCycle !== false;
    const selLolMode = document.getElementById("selectLolMode");
    if (selLolMode && document.activeElement !== selLolMode) selLolMode.value = state.lolMode || "Ranked Solo/Duo";
    const selLolRank = document.getElementById("selectLolRankTier");
    if (selLolRank && document.activeElement !== selLolRank) selLolRank.value = state.lolRankTier || "Master";
    const inpLolLp = document.getElementById("inputLolRankLp");
    if (inpLolLp && document.activeElement !== inpLolLp) inpLolLp.value = state.lolRankLp || "240 LP";
    const inpLolChamp = document.getElementById("inputLolChampion");
    if (inpLolChamp && document.activeElement !== inpLolChamp) inpLolChamp.value = state.lolChampion || "Yasuo";
    const inpLolTitle = document.getElementById("inputLolChampionTitle");
    if (inpLolTitle && document.activeElement !== inpLolTitle) inpLolTitle.value = state.lolChampionTitle || "The Unforgiven";
    const inpLolKda = document.getElementById("inputLolKda");
    if (inpLolKda && document.activeElement !== inpLolKda) inpLolKda.value = state.lolKda || "8/1/6";
    const inpLolLevel = document.getElementById("inputLolLevel");
    if (inpLolLevel && document.activeElement !== inpLolLevel) inpLolLevel.value = state.lolChampionLevel || 14;
    const inpLolCs = document.getElementById("inputLolCs");
    if (inpLolCs && document.activeElement !== inpLolCs) inpLolCs.value = state.lolCs || 185;
    const inpLolPartyCur = document.getElementById("inputLolPartyCurrent");
    if (inpLolPartyCur && document.activeElement !== inpLolPartyCur) inpLolPartyCur.value = state.lolPartyCurrent || 1;
    const inpLolPartyMax = document.getElementById("inputLolPartyMax");
    if (inpLolPartyMax && document.activeElement !== inpLolPartyMax) inpLolPartyMax.value = state.lolPartyMax || 5;
    document.querySelectorAll("#grpLolPhase [data-lol-phase]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lol-phase") === state.lolPhase);
    });
    document.querySelectorAll("#grpLolChampPresets [data-lol-champ]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lol-champ") === state.lolChampion);
    });
  }
  const previewDualActivityBox = document.getElementById("previewDualActivityBox");
  if (previewDualActivityBox) {
    previewDualActivityBox.style.display = state.dualActivityEnabled !== false ? "flex" : "none";
  }
  const previewDualTitle = document.getElementById("previewDualTitle");
  const previewDualDetails = document.getElementById("previewDualDetails");
  const previewDualState = document.getElementById("previewDualState");
  const previewDualRankBadge = document.getElementById("previewDualRankBadge");
  const previewDualPartyBadge = document.getElementById("previewDualPartyBadge");
  const previewDualAlbumArt = document.getElementById("previewDualAlbumArt");
  const previewDualAlbumArtText = document.getElementById("previewDualAlbumArtText");
  const previewDualTypeBadge = document.getElementById("previewDualTypeBadge");
  if (isLol) {
    if (previewDualTitle) previewDualTitle.textContent = "League of Legends";
    if (previewDualTypeBadge) {
      previewDualTypeBadge.textContent = "SEDANG BERMAIN LEAGUE OF LEGENDS";
      previewDualTypeBadge.style.background = "rgba(234, 179, 8, 0.2)";
      previewDualTypeBadge.style.color = "#facc15";
      previewDualTypeBadge.style.border = "1px solid rgba(234, 179, 8, 0.4)";
    }
    if (state.lolPhase === "queue") {
      if (previewDualDetails) previewDualDetails.textContent = "In Queue";
      if (previewDualState) previewDualState.textContent = state.lolMode || "Ranked Solo/Duo";
    } else if (state.lolPhase === "champ_select") {
      if (previewDualDetails) previewDualDetails.textContent = "In Champion Select";
      if (previewDualState) previewDualState.textContent = `${state.lolMode || "Ranked Solo/Duo"} (Picking ${state.lolChampion})`;
    } else if (state.lolPhase === "in_game") {
      const mapName = (state.lolMode || "").includes("ARAM") ? "Howling Abyss" : "Summoner's Rift";
      if (previewDualDetails) previewDualDetails.textContent = mapName;
      if (previewDualState) previewDualState.textContent = `Playing ${state.lolChampion} (${state.lolKda}, Lv${state.lolChampionLevel})`;
    } else if (state.lolPhase === "post_game") {
      if (previewDualDetails) previewDualDetails.textContent = "Match Summary - Victory!";
      if (previewDualState) previewDualState.textContent = `${state.lolMode || "Ranked Solo/Duo"} (+24 LP)`;
    } else {
      if (previewDualDetails) previewDualDetails.textContent = "In Lobby";
      if (previewDualState) previewDualState.textContent = state.lolMode || "Ranked Solo/Duo";
    }
    if (previewDualRankBadge) {
      previewDualRankBadge.style.display = "inline-block";
      previewDualRankBadge.textContent = `${state.lolRankTier || "Master"} - ${state.lolRankLp || "240 LP"}`;
    }
    if (previewDualPartyBadge) {
      previewDualPartyBadge.style.display = "inline-block";
      previewDualPartyBadge.textContent = `(${state.lolPartyCurrent || 1} of ${state.lolPartyMax || 5})`;
    }
    if (previewDualAlbumArt) {
      previewDualAlbumArt.style.background = "linear-gradient(135deg, #1e3a8a, #0f172a)";
      previewDualAlbumArt.style.border = "1px solid rgba(234, 179, 8, 0.6)";
    }
    if (previewDualAlbumArtText) {
      const champ = state.lolChampion || "Yasuo";
      const cleanChampKey = champ.replace(/[^a-zA-Z0-9]/g, "");
      const champIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${cleanChampKey}.png`;
      previewDualAlbumArtText.innerHTML = `<img src="${champIconUrl}" alt="${escapeHtml(champ)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none; color: #facc15; font-size: 11px; font-weight: 900;">${escapeHtml(champ.substring(0, 4).toUpperCase())}</span>`;
    }
  } else {
    if (previewDualTitle) previewDualTitle.textContent = state.dualActivityName || "Minecraft";
    if (previewDualDetails) previewDualDetails.textContent = state.dualActivityDetails || "Survival Mode (24/7 Dedicated Server)";
    if (previewDualState) previewDualState.textContent = state.dualActivityState || "Hardcore Base - Mining Ancient Debris";
    if (previewDualTypeBadge) {
      const dualTypeMap = {
        PLAYING: "SEDANG BERMAIN",
        STREAMING: "SEDANG STREAMING",
        LISTENING: "MENDENGARKAN",
        WATCHING: "MENONTON",
        COMPETING: "BERKOMPETISI"
      };
      previewDualTypeBadge.textContent = dualTypeMap[state.dualActivityType] || `SEDANG ${state.dualActivityType}`;
      previewDualTypeBadge.style.background = "rgba(16, 185, 129, 0.2)";
      previewDualTypeBadge.style.color = "#10b981";
      previewDualTypeBadge.style.border = "1px solid rgba(16, 185, 129, 0.4)";
    }
    if (previewDualRankBadge) previewDualRankBadge.style.display = "none";
    if (previewDualPartyBadge) previewDualPartyBadge.style.display = "none";
    if (previewDualAlbumArt) {
      previewDualAlbumArt.style.background = "linear-gradient(135deg, #059669, #065f46)";
      previewDualAlbumArt.style.border = "1px solid rgba(16, 185, 129, 0.3)";
    }
    if (previewDualAlbumArtText) {
      const name = state.dualActivityName || "Minecraft";
      if (name.toLowerCase().includes("minecraft")) {
        previewDualAlbumArtText.innerHTML = `<img src="https://assets.stickpng.com/images/580b57fcd9996e24bc43c2f9.png" alt="Minecraft" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none; font-size: 10px; font-weight: bold; color: #fff;">MINE<br>CRAFT</span>`;
      } else {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          previewDualAlbumArtText.innerHTML = `${escapeHtml(parts[0].substring(0, 5))}<br>${escapeHtml(parts[1].substring(0, 5))}`;
        } else {
          previewDualAlbumArtText.textContent = name.substring(0, 6).toUpperCase();
        }
      }
    }
  }
  const previewDualUptimeText = document.getElementById("previewDualUptimeText");
  if (previewDualUptimeText) {
    const hrs = Number(state.dualActivityUptimeHours || 1248);
    const days = Math.floor(hrs / 24);
    previewDualUptimeText.textContent = `Bermain selama ${hrs.toLocaleString()} jam (${days} hari)`;
  }
}
function updateMalangUI() {
  const pingBadge = document.getElementById("malangPingBadge");
  if (pingBadge) {
    if (state.malangRtcRegion === "singapore") {
      pingBadge.textContent = "18\u201335 ms (Tercepat ke Malang)";
      pingBadge.style.color = "#10b981";
    } else if (state.malangRtcRegion === "hongkong") {
      pingBadge.textContent = "55\u201375 ms";
      pingBadge.style.color = "#f59e0b";
    } else {
      pingBadge.textContent = "180\u2013260 ms (Tinggi)";
      pingBadge.style.color = "#ef4444";
    }
  }
}
function updateExportUI() {
  const fileListContainer = document.getElementById("fileListContainer");
  const codeViewer = document.getElementById("codeViewerPre");
  const activeFileName = document.getElementById("activeFileName");
  const activeFileSize = document.getElementById("activeFileSize");
  const btnCopyFileContent = document.getElementById("btnCopyFileContent");
  if (!fileListContainer) return;
  fileListContainer.innerHTML = "";
  const activeFile = currentFiles.find((f) => f.name === state.selectedFile) || currentFiles[0];
  currentFiles.forEach((file) => {
    const itemBtn = document.createElement("button");
    itemBtn.className = `file-item-btn ${file.name === activeFile.name ? "active" : ""}`;
    itemBtn.innerHTML = `<span>${file.name}</span><span style="font-size: 9px; opacity: 0.7;">${file.size}</span>`;
    itemBtn.addEventListener("click", () => {
      state.selectedFile = file.name;
      updateExportUI();
    });
    fileListContainer.appendChild(itemBtn);
  });
  if (codeViewer) codeViewer.textContent = activeFile.content;
  if (activeFileName) activeFileName.textContent = activeFile.name;
  if (activeFileSize) activeFileSize.textContent = `(${activeFile.size})`;
  if (btnCopyFileContent) {
    btnCopyFileContent.onclick = () => {
      copyToClipboard(activeFile.content, btnCopyFileContent, "Tersalin!", "Salin Isi Berkas");
    };
  }

  const valMetricEntropy = document.getElementById("valMetricEntropy");
  if (valMetricEntropy && state.encryptionMetrics) {
    valMetricEntropy.textContent = state.encryptionMetrics.entropy ? `${state.encryptionMetrics.entropy} bits/byte` : "7.98 bits/byte";
  }
}
function setupExportFileSelector() {
  const btnCopyFileContent = document.getElementById("btnCopyFileContent");
  if (btnCopyFileContent) {
    btnCopyFileContent.addEventListener("click", () => {
      const activeFile = currentFiles.find((f) => f.name === state.selectedFile) || currentFiles[0];
      if (activeFile) {
        copyToClipboard(activeFile.content, btnCopyFileContent, "Tersalin!", "Salin Isi Berkas");
      }
    });
  }
}
function setupPromptCopyButtons() {
  document.querySelectorAll("[data-copy-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const promptId = btn.getAttribute("data-copy-prompt");
      const box = document.getElementById(`promptText_${promptId}`);
      if (box) {
        copyToClipboard(box.textContent, btn, "\u2713 Tersalin!", "Salin Prompt");
      }
    });
  });
}
function copyToClipboard(text, btnElement, successText, originalText) {
  navigator.clipboard.writeText(text);
  if (btnElement) {
    btnElement.textContent = successText;
    btnElement.style.color = "#10b981";
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.style.color = "";
    }, 2e3);
  }
}
let zipCalcTimeout = null;
export async function scheduleZipSizeUpdate(files) {
  clearTimeout(zipCalcTimeout);
  zipCalcTimeout = setTimeout(async () => {
    try {
      const bytes = await calculateExactZipSize(files);
      const sizeStr = formatFileSize(bytes);
      state.lastCalculatedZipSize = sizeStr;
      const btn1Text = document.getElementById("btnDownloadZipText");
      const btn2Text = document.getElementById("btnDownloadZipExportText");
      const valSize = document.getElementById("valZipCalculatedSize");
      const valCount = document.getElementById("valZipFileCount");
      if (btn1Text) btn1Text.textContent = `Unduh ZIP (${sizeStr})`;
      if (btn2Text) btn2Text.textContent = `Unduh ZIP (${sizeStr})`;
      if (valSize) valSize.textContent = `${sizeStr} (Terkemas Level 9)`;
      if (valCount) valCount.textContent = `${files.length} Berkas`;
    } catch (err) {
    }
  }, 60);
}
function updateZipButtonsState(isPackaging) {
  const btn1 = document.getElementById("btnDownloadZip");
  const btn2 = document.getElementById("btnDownloadZipExport");
  const btn1Text = document.getElementById("btnDownloadZipText");
  const btn2Text = document.getElementById("btnDownloadZipExportText");
  if (btn1) btn1.disabled = isPackaging;
  if (btn2) btn2.disabled = isPackaging;
  if (isPackaging) {
    if (btn1Text) btn1Text.textContent = "Mengemas ZIP...";
    if (btn2Text) btn2Text.textContent = "Mengemas ZIP...";
  } else {
    const text = `Unduh ZIP (${state.lastCalculatedZipSize || "24.8 KB"})`;
    if (btn1Text) btn1Text.textContent = text;
    if (btn2Text) btn2Text.textContent = text;
  }
}
