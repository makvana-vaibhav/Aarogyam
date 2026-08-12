import { useEffect, useRef, useState } from "react";
import { PatientAPI } from "./patientApi.js";
import { downloadBlob } from "./format.js";

function joinName(profile) {
  return [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ");
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Ported from patient/portal.js's loadQrImage/downloadFullHealthCard — shared by Overview & Profile.
export function useHealthCard(profile) {
  const [qrUrl, setQrUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const qrUrlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    PatientAPI.healthCardQr()
      .then((qr) => {
        if (cancelled) return;
        const url = URL.createObjectURL(qr.blob);
        qrUrlRef.current = url;
        setQrUrl(url);
      })
      .catch((err) => {
        if (!cancelled) setQrError(err.message);
      });
    return () => {
      cancelled = true;
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
    };
  }, []);

  async function downloadCard() {
    if (!profile || !qrUrl) return;
    const qrImg = await loadImageElement(qrUrl);
    const scale = 2;
    const width = 900, height = 380;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    ctx.fillStyle = "#fffbf3";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#1b4332";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    ctx.fillStyle = "#16301f";
    ctx.font = "700 22px Arial";
    ctx.fillText("AAROGYAM · HEALTH IDENTITY", 36, 58);
    ctx.strokeStyle = "rgba(19, 42, 30, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 76);
    ctx.lineTo(width - 36, 76);
    ctx.stroke();

    function label(text, x, y) {
      ctx.fillStyle = "#829a8b";
      ctx.font = "600 12px Arial";
      ctx.fillText(text.toUpperCase(), x, y);
    }
    function value(text, x, y, size) {
      ctx.fillStyle = "#16301f";
      ctx.font = (size || 18) + "px Arial";
      ctx.fillText(text, x, y);
    }

    const p = profile;
    const fullName = joinName(p);
    const leftX = 36;
    label("Patient", leftX, 112);
    value(fullName, leftX, 138, 22);
    label("Aarogyam ID", leftX, 176);
    value(p.aarogyamId, leftX, 200, 17);
    label("Blood group", leftX, 238);
    value(p.bloodGroup || "Not set", leftX, 262, 19);
    label("Emergency contact", leftX, 300);
    value(p.emergencyContact || "Not added", leftX, 324, 19);

    const qrSize = 220;
    const qrX = width - qrSize - 40;
    const qrY = (height - qrSize) / 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    canvas.toBlob((blob) => {
      downloadBlob(blob, "aarogyam-health-card-" + p.aarogyamId + ".png");
    }, "image/png");
  }

  return { qrUrl, qrError, downloadCard, joinName };
}
