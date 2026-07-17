import type { Match } from "../components/molecules/MatchCard";
import type { Player } from "../services/db";

export const downloadMatchImage = (
  match: Match,
  players: Player[],
  action: "download" | "share" = "download",
  shareText?: string,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920; // 9:16 Instagram Status aspect ratio
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const ktLogo = new Image();
  const hutLogo = new Image();

  // 1. Draw Background Gradient
  const grad = ctx.createRadialGradient(540, 960, 100, 540, 960, 1000);
  grad.addColorStop(0, "#022c22"); // dark emerald-950
  grad.addColorStop(0.6, "#09090b"); // zinc-950
  grad.addColorStop(1, "#030712"); // slate-950
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Draw Futsal/Soccer Pitch lines as background decoration
  ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
  ctx.lineWidth = 4;
  // Border line
  ctx.strokeRect(60, 60, 960, 1800);

  // Center line
  ctx.beginPath();
  ctx.moveTo(60, 960);
  ctx.lineTo(1020, 960);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(540, 960, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.beginPath();
  ctx.arc(540, 960, 12, 0, Math.PI * 2);
  ctx.fill();

  // Penalty areas
  // Top
  ctx.beginPath();
  ctx.arc(540, 60, 200, 0, Math.PI);
  ctx.stroke();
  // Bottom
  ctx.beginPath();
  ctx.arc(540, 1860, 200, Math.PI, 0);
  ctx.stroke();

  // 3. Draw Header Text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Tournament Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 27px system-ui, -apple-system, sans-serif";
  ctx.fillText("TURNAMEN FUTSAL KARANG TARUNA RW 03", 540, 140);

  // Desa Padurenan Subtitle
  ctx.fillStyle = "#a1a1aa"; // zinc-400
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText("DESA PADURENAN", 540, 185);

  // Decorative Accent line below title
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(420, 220);
  ctx.lineTo(660, 220);
  ctx.stroke();

  // Round & Group Info
  ctx.fillStyle = "#10b981"; // emerald-500
  ctx.font = "900 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${match.round.toUpperCase()}  •  ${match.group_name.toUpperCase()}`,
    540,
    255,
  );

  // 4. Date & Time
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return (
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB"
    );
  };

  ctx.fillStyle = "#e4e4e7"; // zinc-200
  ctx.font = "600 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatDate(match.match_date), 540, 315);

  ctx.fillStyle = "#a1a1aa"; // zinc-400
  ctx.font = "500 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatTime(match.match_date), 540, 355);

  // Helper to draw a team logo or fallback to beautiful initials
  const drawTeamEmblem = (
    ctx: CanvasRenderingContext2D,
    name: string,
    logoUrl: string | undefined,
    x: number,
    y: number,
    callback: () => void,
  ) => {
    const radius = 110;

    const drawInitials = () => {
      // Circle background
      ctx.fillStyle = "#18181b"; // zinc-900
      ctx.strokeStyle = "#10b981"; // emerald-500
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Initials text
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      ctx.fillStyle = "#34d399"; // emerald-400
      ctx.font = "bold 80px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, x, y);
      callback();
    };

    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#18181b";
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

        // Draw emblem image inside the circle
        ctx.drawImage(
          img,
          x - radius + 15,
          y - radius + 15,
          radius * 2 - 30,
          radius * 2 - 30,
        );
        ctx.restore();

        // Draw border
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        callback();
      };
      img.onerror = () => {
        drawInitials();
      };
      img.src = logoUrl;
    } else {
      drawInitials();
    }
  };

  const drawRosterList = (
    ctx: CanvasRenderingContext2D,
    teamPlayers: Player[],
    startX: number,
    startY: number,
  ) => {
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const itemHeight = 38;
    const maxVisiblePlayers = 13;

    // Sort players: Goals scored first, then cards, then alphabetical
    const sortedPlayers = [...teamPlayers].sort((a, b) => {
      const aGoals = match.player_goals?.[String(a.id)] || 0;
      const bGoals = match.player_goals?.[String(b.id)] || 0;
      const aCards =
        (match.player_yellow_cards?.[String(a.id)] || 0) +
        (match.player_red_cards?.[String(a.id)] || 0);
      const bCards =
        (match.player_yellow_cards?.[String(b.id)] || 0) +
        (match.player_red_cards?.[String(b.id)] || 0);

      if (aGoals !== bGoals) return bGoals - aGoals;
      if (aCards !== bCards) return bCards - aCards;
      return a.name.localeCompare(b.name);
    });

    const displayList = sortedPlayers.slice(0, maxVisiblePlayers);

    displayList.forEach((player, index) => {
      const currentY = startY + index * itemHeight;

      // Draw small emerald dot as bullet point
      ctx.fillStyle = "#10b981"; // emerald-500
      ctx.beginPath();
      ctx.arc(startX, currentY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw player name
      ctx.fillStyle = "#e4e4e7"; // zinc-200
      const playerName = player.name;
      ctx.fillText(playerName, startX + 18, currentY);

      // Position for icons (goals & cards)
      const nameWidth = ctx.measureText(playerName).width;
      let iconX = startX + 18 + nameWidth + 12;

      // Goals scorer icon
      const goals = match.player_goals?.[String(player.id)] || 0;
      if (goals > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(goals > 1 ? `⚽ x${goals}` : "⚽", iconX, currentY);
        iconX += goals > 1 ? 60 : 35;
      }

      // Yellow card icon (🟨)
      const yellow = match.player_yellow_cards?.[String(player.id)] || 0;
      if (yellow > 0) {
        ctx.fillStyle = "#f59e0b"; // amber-500
        ctx.beginPath();
        const anyCtx = ctx as any;
        if (anyCtx.roundRect) {
          anyCtx.roundRect(iconX, currentY - 11, 11, 17, 2);
        } else {
          ctx.rect(iconX, currentY - 11, 11, 17);
        }
        ctx.fill();
        iconX += 18;
      }

      // Red card icon (🟥)
      const red = match.player_red_cards?.[String(player.id)] || 0;
      if (red > 0) {
        ctx.fillStyle = "#ef4444"; // red-500
        ctx.beginPath();
        const anyCtx = ctx as any;
        if (anyCtx.roundRect) {
          anyCtx.roundRect(iconX, currentY - 11, 11, 17, 2);
        } else {
          ctx.rect(iconX, currentY - 11, 11, 17);
        }
        ctx.fill();
      }
    });

    if (sortedPlayers.length > maxVisiblePlayers) {
      const currentY = startY + maxVisiblePlayers * itemHeight;
      ctx.fillStyle = "#71717a"; // zinc-500
      ctx.font = "italic 18px system-ui, sans-serif";
      ctx.fillText(
        `+ ${sortedPlayers.length - maxVisiblePlayers} pemain lainnya...`,
        startX,
        currentY,
      );
    }
  };

  const renderContent = () => {
    // Draw top left Karang Taruna logo (flanking title)
    try {
      if (ktLogo.complete && ktLogo.naturalWidth !== 0) {
        ctx.drawImage(ktLogo, 160 - 45, 160 - 45, 90, 90);
      }
    } catch (e) {
      console.error("Error drawing Karang Taruna logo", e);
    }

    // Draw top right HUT RI logo (flanking title)
    try {
      if (hutLogo.complete && hutLogo.naturalWidth !== 0) {
        ctx.drawImage(hutLogo, 920 - 45, 160 - 45, 90, 90);
      }
    } catch (e) {
      console.error("Error drawing HUT RI logo", e);
    }

    // 5. Draw VS / Scores
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const matchRowY = 560;

    if (match.status !== "scheduled") {
      // Home Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 160px system-ui, -apple-system, sans-serif";
      ctx.fillText(String(match.home_score ?? 0), 380, matchRowY);

      // Score divider ":"
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 100px system-ui, -apple-system, sans-serif";
      ctx.fillText(":", 540, matchRowY - 10);

      // Away Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 160px system-ui, -apple-system, sans-serif";
      ctx.fillText(String(match.away_score ?? 0), 700, matchRowY);
    } else {
      // VS Text
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.font = "900 180px system-ui, -apple-system, sans-serif";
      ctx.fillText("VS", 540, matchRowY);
    }

    // 6. Team Names (drawn below emblems)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
    ctx.fillText(match.teams_home.name, 220, 720);
    ctx.fillText(match.teams_away.name, 860, 720);

    // 7. Status Badge
    let statusText = "MENDATANG";
    let statusColor = "#f59e0b"; // amber-500
    if (match.status === "finished") {
      statusText = "SELESAI";
      statusColor = "#10b981"; // emerald-500
    } else if (match.status === "ongoing") {
      statusText = "LIVE / BERLANGSUNG";
      statusColor = "#ef4444"; // red-500
    }

    ctx.fillStyle = statusColor;
    const badgeWidth = 320;
    const badgeHeight = 64;
    const badgeX = 540 - badgeWidth / 2;
    const badgeY = 800;

    // Draw badge background
    ctx.beginPath();
    const anyCtx = ctx as any;
    if (anyCtx.roundRect) {
      anyCtx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
    } else {
      ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();

    // Draw status badge text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(statusText, 540, badgeY + badgeHeight / 2);

    // 8. Roster Section Card
    const boxX = 100;
    const boxY = 890;
    const boxWidth = 880;
    const boxHeight = 790;

    // Background panel for rosters
    ctx.fillStyle = "rgba(24, 24, 27, 0.55)";
    ctx.strokeStyle = "rgba(63, 63, 70, 0.6)"; // zinc-700
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (anyCtx.roundRect) {
      anyCtx.roundRect(boxX, boxY, boxWidth, boxHeight, 24);
    } else {
      ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Header Title for rosters
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 32px system-ui, -apple-system, sans-serif";
    ctx.fillText("DAFTAR SUSUNAN PEMAIN", 540, boxY + 50);

    // Divider line below roster title
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(380, boxY + 85);
    ctx.lineTo(700, boxY + 85);
    ctx.stroke();

    // Filter home and away team players
    const homePlayers = players.filter((p) => p.team_id === match.home_team_id);
    const awayPlayers = players.filter((p) => p.team_id === match.away_team_id);

    // Draw Column Headers
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#34d399"; // emerald-400
    ctx.textAlign = "left";
    ctx.fillText(match.teams_home.name, 130, boxY + 125);
    ctx.fillText(match.teams_away.name, 570, boxY + 125);

    // Draw lists of players
    drawRosterList(ctx, homePlayers, 130, boxY + 175);
    drawRosterList(ctx, awayPlayers, 570, boxY + 175);

    // 9. Footer Branding
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const footerText = "Info selengkapnya di: Bit.ly/jadwal-update-futsal-rw03";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    const textWidth = ctx.measureText(footerText).width;

    // Box dimensions
    const fBoxWidth = textWidth + 40;
    const fBoxHeight = 50;
    const fBoxX = 540 - fBoxWidth / 2;
    const fBoxY = 1750 - fBoxHeight / 2; // y=1750

    // Draw white rounded box
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    const anyCtx2 = ctx as any;
    if (anyCtx2.roundRect) {
      anyCtx2.roundRect(fBoxX, fBoxY, fBoxWidth, fBoxHeight, 12);
    } else {
      ctx.rect(fBoxX, fBoxY, fBoxWidth, fBoxHeight);
    }
    ctx.fill();

    // Draw black text inside the box
    ctx.fillStyle = "#09090b"; // black/dark zinc
    ctx.fillText(footerText, 540, 1750);

    // 10. Output trigger (Download or Share)
    const dateStr = new Date(match.match_date).toISOString().split("T")[0];
    const filename = `futsal-match-${match.teams_home.name.toLowerCase().replace(/\s+/g, "-")}-vs-${match.teams_away.name.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.png`;

    const fallbackShareText = (text: string) => {
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(whatsappUrl, "_blank");
    };

    if (action === "share" && shareText) {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          fallbackShareText(shareText);
          return;
        }

        const file = new File([blob], filename, { type: "image/png" });

        // If Web Share API supports file sharing, use it
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              text: shareText,
              title: "Info Pertandingan Futsal",
            });
          } catch (e) {
            console.error("Web share failed, falling back to WhatsApp link", e);
            fallbackShareText(shareText);
          }
        } else {
          // If not supported (e.g., desktop), download the image automatically
          // and then open WhatsApp link so they can easily upload/drag-and-drop the image
          try {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            link.click();
          } catch (err) {
            console.error("Auto-download failed during share fallback", err);
          }
          fallbackShareText(shareText);
        }
      }, "image/png");
    } else {
      // Normal download trigger
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.error("Error creating poster download link", e);
      }
    }
  };

  const loadTopLogos = (callback: () => void) => {
    let loadedCount = 0;
    const totalLogos = 2;
    const onLogoLoaded = () => {
      loadedCount++;
      if (loadedCount === totalLogos) {
        callback();
      }
    };

    ktLogo.onload = onLogoLoaded;
    ktLogo.onerror = onLogoLoaded; // proceed even on error
    ktLogo.src = "/android-chrome-512x512.png";

    hutLogo.onload = onLogoLoaded;
    hutLogo.onerror = onLogoLoaded; // proceed even on error
    hutLogo.src = "/hutri.png";
  };

  // Chain loading of emblems and top logos
  drawTeamEmblem(
    ctx,
    match.teams_home.name,
    match.teams_home.logo_url,
    220,
    560,
    () => {
      drawTeamEmblem(
        ctx,
        match.teams_away.name,
        match.teams_away.logo_url,
        860,
        560,
        () => {
          loadTopLogos(() => {
            renderContent();
          });
        },
      );
    },
  );
};
