import type { Match } from "../components/molecules/MatchCard";

export const downloadMatchImage = (
  match: Match,
  action: "download" | "share" = "download",
  shareText?: string,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const ktLogo = new Image();
  const hutLogo = new Image();

  // 1. Draw Background Gradient
  const grad = ctx.createRadialGradient(540, 540, 100, 540, 540, 800);
  grad.addColorStop(0, "#022c22"); // dark emerald-950
  grad.addColorStop(0.6, "#09090b"); // zinc-950
  grad.addColorStop(1, "#030712"); // gray-950
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // 2. Draw Futsal/Soccer Pitch lines as background decoration
  ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
  ctx.lineWidth = 4;
  // Border line
  ctx.strokeRect(60, 60, 960, 960);

  // Center line
  ctx.beginPath();
  ctx.moveTo(60, 540);
  ctx.lineTo(1020, 540);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(540, 540, 160, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.beginPath();
  ctx.arc(540, 540, 12, 0, Math.PI * 2);
  ctx.fill();

  // Penalty areas
  // Top
  ctx.beginPath();
  ctx.arc(540, 60, 180, 0, Math.PI);
  ctx.stroke();
  // Bottom
  ctx.beginPath();
  ctx.arc(540, 1020, 180, Math.PI, 0);
  ctx.stroke();

  // 3. Draw Header Text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Tournament Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 25px system-ui, -apple-system, sans-serif";
  ctx.fillText("TURNAMEN FUTSAL KARANG TARUNA RW 03", 540, 130);

  // Desa Padurenan Subtitle
  ctx.fillStyle = "#a1a1aa"; // zinc-400
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText("DESA PADURENAN", 540, 175);

  // Decorative Accent line below title
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(420, 210);
  ctx.lineTo(660, 210);
  ctx.stroke();

  // Round & Group Info
  ctx.fillStyle = "#10b981"; // emerald-500
  ctx.font = "900 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${match.round.toUpperCase()}  •  ${match.group_name.toUpperCase()}`,
    540,
    245,
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
  ctx.fillText(formatDate(match.match_date), 540, 305);

  ctx.fillStyle = "#a1a1aa"; // zinc-400
  ctx.font = "500 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(formatTime(match.match_date), 540, 345);

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

  const renderContent = () => {
    // Draw top left Karang Taruna logo (flanking title)
    try {
      if (ktLogo.complete && ktLogo.naturalWidth !== 0) {
        ctx.drawImage(ktLogo, 160 - 45, 150 - 45, 90, 90);
      }
    } catch (e) {
      console.error("Error drawing Karang Taruna logo", e);
    }

    // Draw top right HUT RI logo (flanking title)
    try {
      if (hutLogo.complete && hutLogo.naturalWidth !== 0) {
        ctx.drawImage(hutLogo, 920 - 45, 150 - 45, 90, 90);
      }
    } catch (e) {
      console.error("Error drawing HUT RI logo", e);
    }

    // 5. Draw VS / Scores
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (match.status !== "scheduled") {
      // Home Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 160px system-ui, -apple-system, sans-serif";
      ctx.fillText(String(match.home_score ?? 0), 380, 540);

      // Score divider ":"
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 100px system-ui, -apple-system, sans-serif";
      ctx.fillText(":", 540, 530);

      // Away Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 160px system-ui, -apple-system, sans-serif";
      ctx.fillText(String(match.away_score ?? 0), 700, 540);
    } else {
      // VS Text
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.font = "900 180px system-ui, -apple-system, sans-serif";
      ctx.fillText("VS", 540, 540);
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
    const badgeY = 810;

    // Draw badge background
    ctx.beginPath();
    const anyCtx = ctx as any;
    if (anyCtx.roundRect) {
      anyCtx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
    } else {
      anyCtx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();

    // Draw status badge text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(statusText, 540, badgeY + badgeHeight / 2);

    // 8. Footer Branding
    const footerText = "Info selengkapnya di: Bit.ly/jadwal-update-futsal-rw03";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    const textWidth = ctx.measureText(footerText).width;
    
    // Box dimensions
    const boxWidth = textWidth + 40;
    const boxHeight = 50;
    const boxX = 540 - boxWidth / 2;
    const boxY = 960 - boxHeight / 2;
    
    // Draw white rounded box
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    const anyCtx2 = ctx as any;
    if (anyCtx2.roundRect) {
      anyCtx2.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
    } else {
      anyCtx2.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();

    // Draw black text inside the box
    ctx.fillStyle = "#09090b"; // black/dark zinc
    ctx.fillText(footerText, 540, 960);

    ctx.font = "500 18px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#3f3f46";

    // 9. Output trigger (Download or Share)
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
    540,
    () => {
      drawTeamEmblem(
        ctx,
        match.teams_away.name,
        match.teams_away.logo_url,
        860,
        540,
        () => {
          loadTopLogos(() => {
            renderContent();
          });
        },
      );
    },
  );
};
