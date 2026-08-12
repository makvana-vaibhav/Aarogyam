import { useRef, useState } from "react";
import jsQR from "jsqr";
import { extractAarogyamId } from "./doctorApi.js";
import { useToast } from "../context/ToastContext.jsx";

// Ported from doctor/portal.js's global QR scanner (startGlobalQrScanner/stopGlobalCamera) —
// shared by the top nav "Scan QR" button and the in-page ones on Overview/My Patients/Create Visit.
export function useQrScanner() {
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Initializing camera…");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const onResultRef = useRef(null);

  function stopScan() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    setOpen(false);
    document.body.style.overflow = "";
  }

  async function startScan(onResult) {
    onResultRef.current = onResult;
    setOpen(true);
    setStatus("Requesting camera access…");
    document.body.style.overflow = "hidden";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera access is not supported on this browser/device.");
      return;
    }

    const constraintsList = [
      { video: { facingMode: { exact: "environment" } } },
      { video: { facingMode: "environment" } },
      { video: true }
    ];

    let stream = null;
    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (e) {}
    }

    if (!stream) {
      setStatus("Could not access camera. Please check camera permissions in browser settings.");
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;

    try {
      await video.play();
    } catch (e) {}

    setStatus("Scanning for QR Code… Point camera at Health Card.");

    let barcodeDetector = null;
    let isBarcodeDetectorSupported = "BarcodeDetector" in window;
    if (isBarcodeDetectorSupported) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch (e) {
        isBarcodeDetectorSupported = false;
      }
    }

    intervalRef.current = setInterval(async () => {
      if (!video || video.readyState < 2) return;

      let scannedText = null;

      if (isBarcodeDetectorSupported && barcodeDetector) {
        try {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) scannedText = barcodes[0].rawValue;
        } catch (e) {}
      }

      if (!scannedText) {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
          if (code && code.data) scannedText = code.data;
        } catch (e) {}
      }

      if (scannedText) {
        setStatus("QR Code Detected!");
        if (navigator.vibrate) {
          try {
            navigator.vibrate(100);
          } catch (e) {}
        }
        showToast("QR Code Scanned!");
        const scannedId = extractAarogyamId(scannedText);
        stopScan();
        if (onResultRef.current) onResultRef.current(scannedId);
      }
    }, 250);
  }

  return { open, status, videoRef, canvasRef, startScan, stopScan };
}
