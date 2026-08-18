import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { PatientAPI } from "../../lib/patientApi.js";
import { formatDate, fileSize, downloadBlob } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";

function assignVisitNumbers(visits) {
  const sorted = [...visits].sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
  const numberByVisitId = {};
  sorted.forEach((visit, index) => {
    numberByVisitId[visit.visitId] = index + 1;
  });
  return numberByVisitId;
}

export default function Reports() {
  useDocumentTitle("Reports · Aarogyam Patient");
  const showToast = useToast();

  const [reports, setReports] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadAlert, setUploadAlert] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [visitId, setVisitId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const numberByVisitId = useMemo(() => assignVisitNumbers(visits), [visits]);

  const filteredReports = useMemo(() => {
    const term = search.toLowerCase();
    return reports.filter((report) => {
      const matchesTerm =
        !term ||
        (report.title || "").toLowerCase().includes(term) ||
        (report.reportType || "").toLowerCase().includes(term);
      if (!matchesTerm) return false;

      if (!fromDate && !toDate) return true;
      const raw = report.reportDate || report.createdAt;
      const dateStr = raw ? String(raw).slice(0, 10) : null;
      if (!dateStr) return false;
      if (fromDate && dateStr < fromDate) return false;
      if (toDate && dateStr > toDate) return false;
      return true;
    });
  }, [reports, search, fromDate, toDate]);

  function loadReports() {
    return PatientAPI.reports().then((rows) => setReports(rows || []));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([PatientAPI.visits(), PatientAPI.reports()])
      .then(([visitRows, reportRows]) => {
        setVisits(visitRows || []);
        setReports(reportRows || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openUpload() {
    setUploadAlert(null);
    setUploadOpen(true);
  }

  function closeUpload() {
    setUploadOpen(false);
    document.body.style.overflow = "";
  }

  function resetUploadForm() {
    setTitle("");
    setReportType("");
    setReportDate("");
    setVisitId("");
    setSelectedFile(null);
  }

  async function handleUploadSubmit(e) {
    e.preventDefault();
    setUploadAlert(null);
    if (!title.trim() || !reportType.trim() || !selectedFile) {
      setUploadAlert("Please enter report details and choose a file.");
      return;
    }
    const formData = new FormData();
    formData.append("Title", title.trim());
    formData.append("ReportType", reportType.trim());
    formData.append("File", selectedFile);
    if (reportDate) formData.append("ReportDate", reportDate);
    if (visitId) formData.append("VisitId", visitId);

    setUploading(true);
    try {
      await PatientAPI.uploadReport(formData);
      resetUploadForm();
      closeUpload();
      showToast("Report uploaded successfully.");
      await loadReports();
    } catch (err) {
      setUploadAlert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(reportId) {
    try {
      const file = await PatientAPI.downloadReport(reportId);
      downloadBlob(file.blob, file.fileName || "report-" + reportId);
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleDelete(reportId) {
    setDeleteConfirmId(null);
    try {
      await PatientAPI.deleteReport(reportId);
      await loadReports();
      showToast("Report deleted.");
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files.length) return;
    setSelectedFile(e.dataTransfer.files[0]);
  }

  if (error) {
    return (
      <div className="pt-content">
        <table className="data-table"><tbody><tr><td className="table-empty">{error}</td></tr></tbody></table>
      </div>
    );
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>Medical reports</h2>
          <p>All lab reports, scans and documents linked to your record.</p>
        </div>
        <button className="btn btn-solid btn-sm" id="openUploadBtn" type="button" onClick={openUpload}>Upload report</button>
      </div>
      <div className="toolbar">
        <input
          id="reportsSearch"
          type="search"
          placeholder="Search reports by title or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label htmlFor="reportsFromDate" className="toolbar-date-label">From</label>
        <input id="reportsFromDate" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
        <label htmlFor="reportsToDate" className="toolbar-date-label">To</label>
        <input id="reportsToDate" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Report</th><th>Date</th><th>Visit</th><th>Size</th><th>Uploaded by</th><th></th></tr>
          </thead>
          <tbody id="reportsBody">
            {loading ? (
              <tr><td colSpan={6} className="table-loading">Loading reports…</td></tr>
            ) : !filteredReports.length ? (
              <tr><td colSpan={6} className="table-empty">{reports.length ? "No reports match your filters." : "No reports uploaded yet."}</td></tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.reportId}>
                  <td><div className="row-title">{report.title}</div><div className="row-sub">{report.reportType}</div></td>
                  <td>{formatDate(report.reportDate || report.createdAt)}</td>
                  <td>{report.visitId ? "#" + (numberByVisitId[report.visitId] || report.visitId) : "—"}</td>
                  <td className="mono">{fileSize(report.fileSize)}</td>
                  <td className="mono">{report.doctorId ? "Doctor" : "Self"}</td>
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleDownload(report.reportId)}>Download</button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => setDeleteConfirmId(report.reportId)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-overlay" id="uploadModal" hidden={!uploadOpen}>
        <div className="modal">
          <div className="modal-head">
            <h3>Upload medical report</h3>
            <button className="modal-close" type="button" aria-label="Close" onClick={closeUpload}>×</button>
          </div>
          <div className="modal-body">
            {uploadAlert ? <div className="form-alert error">{uploadAlert}</div> : null}
            <form id="uploadForm" noValidate onSubmit={handleUploadSubmit}>
              <div className="form-row">
                <label htmlFor="reportTitle">Title<span className="req">*</span></label>
                <input id="reportTitle" type="text" maxLength={200} required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-row-2col">
                <div className="form-row">
                  <label htmlFor="reportType">Report type<span className="req">*</span></label>
                  <select id="reportType" required value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="">Select report type</option>
                    <option value="Blood Test / Pathology">Blood Test / Pathology</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="MRI / CT Scan">MRI / CT Scan</option>
                    <option value="Ultrasound / Sonography">Ultrasound / Sonography</option>
                    <option value="ECG / Cardiology">ECG / Cardiology</option>
                    <option value="Prescription / Pharmacy">Prescription / Pharmacy</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Clinical / Consultation Note">Clinical / Consultation Note</option>
                    <option value="Biopsy / Histopathology">Biopsy / Histopathology</option>
                    <option value="Urine / Stool Routine">Urine / Stool Routine</option>
                    <option value="Immunization / Vaccine Record">Immunization / Vaccine Record</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="reportDate">Report date</label>
                  <input id="reportDate" type="date" max={new Date().toISOString().split("T")[0]} value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="reportVisitId">Link to visit</label>
                <select id="reportVisitId" value={visitId} onChange={(e) => setVisitId(e.target.value)}>
                  <option value="">None</option>
                  {visits.map((visit) => (
                    <option key={visit.visitId} value={visit.visitId}>
                      Visit {numberByVisitId[visit.visitId]} • {formatDate(visit.visitDate)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>File<span className="req">*</span></label>
                <label
                  className={"dropzone" + (dragOver ? " drag-over" : "")}
                  id="reportDropzone"
                  onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={onDrop}
                >
                  <input
                    id="reportFile"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                  <span>Drop a file here or click to browse.</span>
                  <div className="filename" id="reportFilename">{selectedFile ? selectedFile.name : "No file selected"}</div>
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" type="button" onClick={closeUpload}>Cancel</button>
                <button className="btn btn-solid" id="uploadSubmitBtn" type="submit" disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteConfirmId != null}
        title="Delete report"
        message="Delete this report from your dashboard? This cannot be undone."
        confirmText="Delete"
        onConfirm={() => handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
