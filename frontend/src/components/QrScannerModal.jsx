export default function QrScannerModal({ open, status, videoRef, canvasRef, onClose }) {
  return (
    <div className="modal-overlay" id="qrScannerModal" hidden={!open}>
      <div className="modal" style={{ maxWidth: "440px", textAlign: "center" }}>
        <div className="modal-head">
          <h3>Scan Patient QR Code</h3>
          <button className="modal-close" type="button" id="closeQrScannerBtn" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", marginBottom: "14px" }}>
            Point your camera at the patient's Aarogyam Health Card QR Code.
          </p>
          <div style={{ position: "relative", width: "100%", borderRadius: "12px", overflow: "hidden", background: "#000", display: "grid", placeItems: "center", minHeight: "250px" }}>
            <video ref={videoRef} playsInline style={{ width: "100%", height: "auto", maxHeight: "280px", objectFit: "cover" }}></video>
            <canvas ref={canvasRef} hidden></canvas>
            <div style={{ position: "absolute", width: "180px", height: "180px", border: "2px dashed #52b788", borderRadius: "12px", pointerEvents: "none" }}></div>
          </div>
          <div id="qrScanStatus" style={{ fontSize: "13px", color: "var(--accent)", marginTop: "12px", fontWeight: 500 }}>
            {status}
          </div>
        </div>
        <div className="modal-actions" style={{ justifyContent: "center", marginTop: "16px" }}>
          <button className="btn btn-ghost" type="button" id="cancelQrScannerBtn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
