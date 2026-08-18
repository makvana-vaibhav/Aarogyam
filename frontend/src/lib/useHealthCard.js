import { useEffect, useRef, useState } from "react";
import { PatientAPI } from "./patientApi.js";
import { downloadBlob, joinName, toTitleCase } from "./format.js";

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

    // Small circular profile photo, drawn above the QR in the same right-hand
    // column — loaded the same way the QR blob is (authenticated fetch -> object
    // URL -> Image element). If there's no photo, or loading it fails, the card
    // renders exactly as it always has.
    let photoImg = null;
    if (profile.profilePicturePath) {
      try {
        const picture = await PatientAPI.profilePicture();
        const photoObjectUrl = URL.createObjectURL(picture.blob);
        photoImg = await loadImageElement(photoObjectUrl);
        URL.revokeObjectURL(photoObjectUrl);
      } catch (err) {
        photoImg = null;
      }
    }

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
    label("Mobile number", leftX, 336);
    value(p.phoneNumber || "Not added", leftX, 358, 17);

    const rightColCenterX = width - 130; // center of the right-hand region (width-260 to width)
    let qrSize = 220;
    let qrX = width - qrSize - 40;
    let qrY = (height - qrSize) / 2;

    if (photoImg) {
      const photoSize = 64;
      const photoTop = 34;
      const photoCenterY = photoTop + photoSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(rightColCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(photoImg, rightColCenterX - photoSize / 2, photoTop, photoSize, photoSize);
      ctx.restore();
      ctx.strokeStyle = "#1b4332";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rightColCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      qrSize = 200;
      qrX = rightColCenterX - qrSize / 2;
      const qrAreaTop = photoTop + photoSize + 16;
      const qrAreaBottom = height - 40;
      qrY = qrAreaTop + (qrAreaBottom - qrAreaTop - qrSize) / 2;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    canvas.toBlob((blob) => {
      downloadBlob(blob, "aarogyam-health-card-" + p.aarogyamId + ".png");
    }, "image/png");
  }

  return { qrUrl, qrError, downloadCard, joinName };
}
