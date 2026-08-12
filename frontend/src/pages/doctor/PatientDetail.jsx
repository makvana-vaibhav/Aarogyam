import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI } from "../../lib/doctorApi.js";
import { formatDate, formatDateTime, initials, downloadBlob } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

export default function PatientDetail() {
  useDocumentTitle("Patient Record — Aarogyam Doctor");
  const showToast = useToast();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState(null);

  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [openVisit, setOpenVisit] = useState(null);

  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState(null);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      DoctorAPI.getPatient(patientId),
      DoctorAPI.getPatientVisits(patientId),
      DoctorAPI.getPatientDiagnoses(patientId),
      DoctorAPI.getPatientReports(patientId),
      DoctorAPI.getPatientPrescriptions(patientId)
    ])
      .then(([patientData, visitRows, diagnosisRows, reportRows, prescriptionRows]) => {
        setPatient(patientData);
        const sortedVisits = (visitRows || []).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate) || (b.visitId || 0) - (a.visitId || 0));
        setVisits(sortedVisits);
        setDiagnoses(diagnosisRows || []);
        setReports(reportRows || []);
        setPrescriptions(prescriptionRows || []);
      })
      .catch((err) => setError(err.message));
  }, [patientId]);

  async function handleReportDownload(reportId) {
    try {
      const file = await DoctorAPI.downloadReport(reportId);
      downloadBlob(file.blob, file.fileName || "report-" + reportId);
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handlePrescriptionDownload(prescriptionId) {
    try {
      const file = await DoctorAPI.downloadPrescription(prescriptionId);
      downloadBlob(file.blob, file.fileName || "prescription-" + prescriptionId + ".pdf");
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function openVisitModal(visitId) {
    const visit = visits.find((v) => String(v.visitId) === String(visitId));
    if (!visit) return;
    setOpenVisit(visit);
    setVisitModalOpen(true);
    document.body.style.overflow = "hidden";
  }

  function closeVisitModal() {
    setVisitModalOpen(false);
    document.body.style.overflow = "";
  }

  async function openPrescriptionModal(prescriptionId) {
    setCurrentPrescriptionId(prescriptionId);
    setPrescriptionModalOpen(true);
    setPrescriptionLoading(true);
    setPrescriptionError(null);
    setPrescriptionDetail(null);
    document.body.style.overflow = "hidden";
    try {
      const detail = await DoctorAPI.getPrescriptionDetails(prescriptionId);
      setPrescriptionDetail(detail);
    } catch (err) {
      setPrescriptionError(err.message);
    } finally {
      setPrescriptionLoading(false);
    }
  }

  function closePrescriptionModal() {
    setPrescriptionModalOpen(false);
    document.body.style.overflow = "";
  }

  if (!patientId) {
    return (
      <div className="pt-content">
        <div className="form-alert error">Missing patientId in the URL.</div>
      </div>
    );
  }

  const visitDiagnosesForModal = openVisit ? diagnoses.filter((d) => String(d.visitId) === String(openVisit.visitId)) : [];

  const diagnosisByVisit = {};
  diagnoses.forEach((item) => {
    (diagnosisByVisit[item.visitId] = diagnosisByVisit[item.visitId] || []).push(item);
  });

  return (
    <div className="pt-content">
      <div className="card hero-card">
        <div className="hero-head">
          <div className="avatar-circle" id="patientInitials">{patient ? initials(patient.firstName, patient.lastName) : "P"}</div>
          <div>
            <div className="card-title" id="patientName">{patient ? joinName(patient) : "Loading patient…"}</div>
            <div className="card-sub" id="patientMeta">
              {patient ? `${patient.aarogyamId} • ${patient.gender} • ${patient.bloodGroup || "Blood group not set"}` : "Preparing summary…"}
            </div>
          </div>
          <div className="qa-row" style={{ marginLeft: "auto" }}>
            <Link className="btn btn-solid btn-sm" id="openCreateVisit" to={"/doctor/create-visit?patientId=" + patientId}>Add visit</Link>
          </div>
        </div>
      </div>

      <div id="patientContent" className="stack-list section-space">
        {error ? (
          <div className="form-alert error">{error}</div>
        ) : !patient ? (
          <div className="table-loading">Loading patient record…</div>
        ) : (
          <>
            <div className="card">
              <div className="card-title">History</div>
              <div className="timeline">
                {!visits.length ? (
                  <div className="empty-state">No visits recorded yet.</div>
                ) : (
                  visits.map((visit) => {
                    const items = diagnosisByVisit[visit.visitId] || [];
                    return (
                      <div className="timeline-item clickable" key={visit.visitId} onClick={() => openVisitModal(visit.visitId)}>
                        <div className="timeline-body-card">
                          <div className="timeline-head"><b>Visit #{visit.visitId}</b><span className="timeline-date">{formatDate(visit.visitDate)}</span></div>
                          <div className="timeline-body">{(visit.notes || "No notes added.").slice(0, 160)}</div>
                          {items.length ? (
                            <div className="timeline-tags">
                              {items.map((d) => (
                                <span className="badge ok" key={d.diagnosisId}>{d.diagnosisTitle}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Reports</div>
              {!reports.length ? (
                <div className="empty-state">No reports uploaded yet.</div>
              ) : (
                <div className="stack-list">
                  {reports.map((row) => (
                    <article className="list-item" key={row.reportId}>
                      <div className="list-item-main">
                        <div className="row-title">{row.title}</div>
                        <div className="row-sub">{row.reportType} • {formatDate(row.reportDate || row.createdAt)}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleReportDownload(row.reportId)}>Download</button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Prescriptions</div>
              {!prescriptions.length ? (
                <div className="empty-state">No prescriptions issued yet.</div>
              ) : (
                <div className="stack-list">
                  {prescriptions.map((row) => (
                    <article className="list-item clickable" key={row.prescriptionId} onClick={() => openPrescriptionModal(row.prescriptionId)}>
                      <div className="list-item-main">
                        <div className="row-title">Prescription #{row.prescriptionId}</div>
                        <div className="row-sub">{(row.prescriptionText || "").slice(0, 140)}</div>
                        <div className="list-meta">{formatDate(row.prescriptionDate)}</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrescriptionDownload(row.prescriptionId);
                        }}
                      >
                        Download
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="modal-overlay" id="prescriptionModal" hidden={!prescriptionModalOpen}>
        <div className="modal">
          <div className="modal-head">
            <h3>Prescription details</h3>
            <button className="modal-close" type="button" aria-label="Close" onClick={closePrescriptionModal}>×</button>
          </div>
          <div className="modal-body">
            <div id="prescriptionDetailContent">
              {prescriptionLoading ? (
                <div className="table-loading">Loading prescription…</div>
              ) : prescriptionError ? (
                <div className="form-alert error">{prescriptionError}</div>
              ) : prescriptionDetail ? (
                <div className="detail-grid">
                  <div><div className="dl">Patient</div><div className="dv">{prescriptionDetail.patientName}</div></div>
                  <div><div className="dl">Date</div><div className="dv">{formatDate(prescriptionDetail.prescriptionDate)}</div></div>
                  <div><div className="dl">Visit</div><div className="dv">#{prescriptionDetail.visitId}</div></div>
                  <div><div className="dl">Diagnosis</div><div className="dv">{prescriptionDetail.diagnosisTitle || "Not linked"}</div></div>
                  <div className="full"><div className="dl">Prescription</div><div className="dv">{prescriptionDetail.prescriptionText || "No prescription text."}</div></div>
                </div>
              ) : null}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={closePrescriptionModal}>Close</button>
              <button
                className="btn btn-solid"
                id="downloadPrescriptionBtn"
                type="button"
                onClick={() => currentPrescriptionId && handlePrescriptionDownload(currentPrescriptionId)}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="visitModal" hidden={!visitModalOpen}>
        <div className="modal">
          <div className="modal-head">
            <h3>Visit details</h3>
            <button className="modal-close" type="button" aria-label="Close" onClick={closeVisitModal}>×</button>
          </div>
          <div className="modal-body">
            <div id="visitDetailContent">
              {openVisit ? (
                <>
                  <div className="detail-grid">
                    <div><div className="dl">Visit</div><div className="dv">#{openVisit.visitId}</div></div>
                    <div><div className="dl">Date</div><div className="dv">{formatDateTime(openVisit.visitDate)}</div></div>
                    <div className="full"><div className="dl">Notes</div><div className="dv">{openVisit.notes || "No notes added."}</div></div>
                  </div>
                  {visitDiagnosesForModal.length ? (
                    <div className="section-space">
                      <div className="card-title">Diagnoses on this visit</div>
                      {visitDiagnosesForModal.map((d) => (
                        <div className="timeline-body-card" key={d.diagnosisId}>
                          <b>{d.diagnosisTitle}</b>
                          <div className="row-sub">{d.description || "No description added."}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={closeVisitModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
