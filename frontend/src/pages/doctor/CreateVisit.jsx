import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI, extractAarogyamId } from "../../lib/doctorApi.js";
import { initials } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

export default function CreateVisit() {
  useDocumentTitle("Create Visit — Aarogyam Doctor");
  const showToast = useToast();
  const navigate = useNavigate();
  const { requestScan } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [diagnosisTypes, setDiagnosisTypes] = useState([]);
  const [flowAlert, setFlowAlert] = useState(null);

  const [lookupAarogyamId, setLookupAarogyamId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [foundPatient, setFoundPatient] = useState(null);

  const [visitDate, setVisitDate] = useState(() => toLocalDatetimeValue(new Date()));
  const [visitNotes, setVisitNotes] = useState("");

  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [diagnosisTypeId, setDiagnosisTypeId] = useState("");
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [diagnosisDescription, setDiagnosisDescription] = useState("");

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const reportFileRef = useRef(null);

  const [invalid, setInvalid] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const flowAlertRef = useRef(null);

  useEffect(() => {
    if (flowAlert) {
      setTimeout(() => {
        if (flowAlertRef.current) {
          flowAlertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          flowAlertRef.current.focus?.();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  }, [flowAlert]);

  useEffect(() => {
    DoctorAPI.diagnosisTypes().then(setDiagnosisTypes).catch(() => {});
  }, []);

  async function runLookup(rawId, autoAdvance) {
    const aarogyamId = extractAarogyamId(rawId);
    setLookupAarogyamId(aarogyamId);
    setFlowAlert(null);
    setLookupLoading(true);
    setLookupError(null);
    try {
      const rows = await DoctorAPI.searchPatients(aarogyamId, null);
      if (!rows.length) {
        setLookupError("No patient found with Aarogyam ID: " + aarogyamId);
        setFoundPatient(null);
        return;
      }
      setFoundPatient(rows[0]);
      if (autoAdvance) goToStep(2, rows[0]);
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  }

  useEffect(() => {
    const patientIdParam = searchParams.get("patientId");
    const aarogyamIdParam = searchParams.get("aarogyamId");
    if (patientIdParam) {
      DoctorAPI.getPatient(patientIdParam)
        .then((patient) => {
          setFoundPatient(patient);
          goToStep(2);
        })
        .catch((err) => setFlowAlert(err.message));
    } else if (aarogyamIdParam) {
      runLookup(aarogyamIdParam, true);
    }
  }, [searchParams]);

  function goToStep(nextStep) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScan() {
    requestScan((scannedId) => runLookup(scannedId, true));
  }

  function handleLookupClick() {
    const value = lookupAarogyamId.trim();
    setInvalid((v) => ({ ...v, rowAarogyamId: !value }));
    if (!value) return;
    runLookup(value, false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFlowAlert(null);

    if (!foundPatient) {
      setFlowAlert("Please find and choose a patient first.");
      goToStep(1);
      return;
    }

    const reportFile = reportFileRef.current?.files[0];
    const visitDateValid = !!visitDate;
    const diagnosisTypeValid = !diagnosisOpen || !!diagnosisTypeId;
    const diagnosisTitleValid = !diagnosisOpen || !!diagnosisTitle.trim();
    const prescriptionValid = !prescriptionOpen || !!prescriptionText.trim();
    const reportTitleValid = !reportOpen || !!reportTitle.trim();
    const reportFileValid = !reportOpen || !!reportFile;

    setInvalid({
      rowVisitDate: !visitDateValid,
      rowDiagnosisType: !diagnosisTypeValid,
      rowDiagnosisTitle: !diagnosisTitleValid,
      rowPrescriptionText: !prescriptionValid,
      rowReportTitle: !reportTitleValid,
      rowReportFile: !reportFileValid
    });

    if (!visitDateValid || !diagnosisTypeValid || !diagnosisTitleValid || !prescriptionValid || !reportTitleValid || !reportFileValid) {
      setFlowAlert("Please fix the highlighted fields.");
      return;
    }

    submitVisit(reportFile);
  }

  async function submitVisit(reportFile) {
    const patientIdVal = foundPatient.patientId;
    const visitDateOnly = visitDate.split("T")[0];
    setSubmitting(true);

    try {
      const visit = await DoctorAPI.createVisit({
        patientId: patientIdVal,
        visitDate,
        notes: visitNotes.trim()
      });

      let diagnosisId = null;
      if (diagnosisOpen) {
        const diagnosis = await DoctorAPI.createDiagnosis({
          visitId: visit.visitId,
          diagnosisTypeId: Number(diagnosisTypeId),
          diagnosisTitle: diagnosisTitle.trim(),
          description: diagnosisDescription.trim(),
          diagnosisDate: visitDateOnly
        });
        diagnosisId = diagnosis.diagnosisId;
      }

      if (prescriptionOpen) {
        await DoctorAPI.createPrescription({
          visitId: visit.visitId,
          diagnosisId,
          prescriptionText: prescriptionText.trim(),
          prescriptionDate: visitDateOnly
        });
      }

      if (reportOpen) {
        const formData = new FormData();
        formData.append("PatientId", patientIdVal);
        formData.append("VisitId", visit.visitId);
        if (diagnosisId) formData.append("DiagnosisId", diagnosisId);
        formData.append("Title", reportTitle.trim());
        formData.append("ReportType", reportType.trim() || "Clinical");
        formData.append("ReportDate", visitDateOnly);
        formData.append("File", reportFile);
        await DoctorAPI.uploadReport(formData);
      }

      showToast("Visit created successfully.");
      setTimeout(() => {
        navigate("/doctor/patient?patientId=" + patientIdVal);
      }, 900);
    } catch (err) {
      setFlowAlert(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>New visit</h2>
          <p>Find the patient by their Aarogyam ID, then record the visit — diagnosis, prescription and a report are optional add-ons.</p>
        </div>
      </div>

      <div className="wizard-steps">
        <div className={"wizard-step-pill" + (step === 1 ? " active" : " done")} id="stepPill1"><span className="num">1</span>Find patient</div>
        <div className="wizard-connector"></div>
        <div className={"wizard-step-pill" + (step === 2 ? " active" : "")} id="stepPill2"><span className="num">2</span>Visit details</div>
      </div>

      {flowAlert ? <div ref={flowAlertRef} id="flowAlert" className="form-alert error" tabIndex={-1} style={{ outline: "none" }}>{flowAlert}</div> : null}

      {step === 1 ? (
        <section className="wizard-panel card" id="panelStep1">
          <div className="card-title">Find patient</div>
          <div className="card-sub">Enter the patient's Aarogyam ID or scan their Health Card QR Code — their details will load automatically.</div>
          <div className={"form-row" + (invalid.rowAarogyamId ? " invalid" : "")} id="rowAarogyamId">
            <label htmlFor="lookupAarogyamId">Aarogyam ID<span className="req">*</span></label>
            <div className="lookup-row">
              <input
                id="lookupAarogyamId"
                placeholder="e.g. AAR-2026-000123"
                autoComplete="off"
                value={lookupAarogyamId}
                onChange={(e) => setLookupAarogyamId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLookupClick();
                  }
                }}
              />
              <button className="btn btn-solid" id="lookupBtn" type="button" onClick={handleLookupClick}>Find patient</button>
              <button className="btn btn-ghost mobile-only-inline" id="scanQrBtn" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={handleScan}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3z" /><path d="M17 17h4v4h-4z" /></svg>
                Scan QR
              </button>
            </div>
            <div className="field-error">Enter the patient's Aarogyam ID first.</div>
          </div>
          <div id="lookupResult">
            {lookupLoading ? (
              <div className="table-loading">Searching…</div>
            ) : lookupError ? (
              <div className="form-alert error">{lookupError}</div>
            ) : foundPatient ? (
              <div className="patient-found-card">
                <div className="avatar-circle small">{initials(foundPatient.firstName, foundPatient.lastName)}</div>
                <div className="pf-main">
                  <div className="row-title">{joinName(foundPatient)}</div>
                  <div className="row-sub mono">{foundPatient.aarogyamId} • {foundPatient.gender} • {foundPatient.bloodGroup || "Blood group not set"}</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-solid" id="continueToStep2" type="button" disabled={!foundPatient} onClick={() => goToStep(2)}>Continue</button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <form id="visitFlowForm" className="wizard-panel" onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-title">Patient</div>
            <div className="patient-found-card">
              <div className="avatar-circle small" id="pfInitials">{foundPatient ? initials(foundPatient.firstName, foundPatient.lastName) : "P"}</div>
              <div className="pf-main">
                <div className="row-title" id="pfName">{foundPatient ? joinName(foundPatient) : "—"}</div>
                <div className="row-sub mono" id="pfMeta">{foundPatient ? `${foundPatient.aarogyamId} • ${foundPatient.gender} • ${foundPatient.bloodGroup || "Blood group not set"}` : "—"}</div>
              </div>
              <button className="btn btn-ghost btn-sm" id="changePatientBtn" type="button" onClick={() => goToStep(1)}>Change</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Visit details</div>
            <div className="card-sub">This date is reused for the diagnosis and prescription below — no need to enter it again.</div>
            <div className={"form-row" + (invalid.rowVisitDate ? " invalid" : "")} id="rowVisitDate">
              <label htmlFor="visitDate">Visit date &amp; time<span className="req">*</span></label>
              <input id="visitDate" type="datetime-local" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              <div className="field-error">Visit date &amp; time is required.</div>
            </div>
            <div className="form-row">
              <label htmlFor="visitNotes">Consultation notes</label>
              <textarea id="visitNotes" placeholder="Symptoms, observations, advice given…" value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)}></textarea>
            </div>
          </div>

          <div className={"card optional-section" + (diagnosisOpen ? " open" : "")} id="sectionDiagnosis">
            <div className="optional-toggle" onClick={() => setDiagnosisOpen((v) => !v)}>
              <div><div className="card-title" style={{ marginBottom: 0 }}>+ Add diagnosis</div><div className="card-sub" style={{ marginBottom: 0 }}>Optional — useful for patient history and prescription context.</div></div>
              <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <div className="optional-body">
              <div className="form-row-2col">
                <div className={"form-row" + (invalid.rowDiagnosisType ? " invalid" : "")} id="rowDiagnosisType">
                  <label htmlFor="diagnosisTypeId">Diagnosis type<span className="req">*</span></label>
                  <select id="diagnosisTypeId" value={diagnosisTypeId} onChange={(e) => setDiagnosisTypeId(e.target.value)}>
                    <option value="">Select diagnosis type</option>
                    {diagnosisTypes.map((row) => (
                      <option key={row.diagnosisTypeId} value={row.diagnosisTypeId}>{row.diagnosisTypeName}</option>
                    ))}
                  </select>
                  <div className="field-error">Choose a diagnosis type.</div>
                </div>
                <div className={"form-row" + (invalid.rowDiagnosisTitle ? " invalid" : "")} id="rowDiagnosisTitle">
                  <label htmlFor="diagnosisTitle">Diagnosis title<span className="req">*</span></label>
                  <input id="diagnosisTitle" placeholder="e.g. Seasonal flu" value={diagnosisTitle} onChange={(e) => setDiagnosisTitle(e.target.value)} />
                  <div className="field-error">Diagnosis title is required.</div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="diagnosisDescription">Description</label>
                <textarea id="diagnosisDescription" placeholder="Clinical findings, notes" value={diagnosisDescription} onChange={(e) => setDiagnosisDescription(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className={"card optional-section" + (prescriptionOpen ? " open" : "")} id="sectionPrescription">
            <div className="optional-toggle" onClick={() => setPrescriptionOpen((v) => !v)}>
              <div><div className="card-title" style={{ marginBottom: 0 }}>+ Add prescription</div><div className="card-sub" style={{ marginBottom: 0 }}>Optional free-text prescription for the patient record.</div></div>
              <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <div className="optional-body">
              <div className={"form-row" + (invalid.rowPrescriptionText ? " invalid" : "")} id="rowPrescriptionText">
                <label htmlFor="prescriptionText">Medicines &amp; instructions<span className="req">*</span></label>
                <textarea id="prescriptionText" placeholder="Medicines, dosage, frequency, instructions" value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)}></textarea>
                <div className="field-error">Add the prescription text, or collapse this section.</div>
              </div>
            </div>
          </div>

          <div className={"card optional-section" + (reportOpen ? " open" : "")} id="sectionReport">
            <div className="optional-toggle" onClick={() => setReportOpen((v) => !v)}>
              <div><div className="card-title" style={{ marginBottom: 0 }}>+ Attach report</div><div className="card-sub" style={{ marginBottom: 0 }}>Optional doctor-uploaded report for this visit.</div></div>
              <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <div className="optional-body">
              <div className="form-row-2col">
                <div className={"form-row" + (invalid.rowReportTitle ? " invalid" : "")} id="rowReportTitle">
                  <label htmlFor="reportTitle">Report title<span className="req">*</span></label>
                  <input id="reportTitle" placeholder="e.g. Blood test" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
                  <div className="field-error">Report title is required.</div>
                </div>
                <div className="form-row">
                  <label htmlFor="reportType">Report type</label>
                  <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
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
              </div>
              <div className={"form-row" + (invalid.rowReportFile ? " invalid" : "")} id="rowReportFile">
                <label htmlFor="reportFile">File<span className="req">*</span></label>
                <input id="reportFile" type="file" ref={reportFileRef} />
                <div className="field-error">Choose a file to attach, or collapse this section.</div>
              </div>
            </div>
          </div>

          <div className="wizard-nav">
            <button className="btn btn-ghost" id="backToStep1" type="button" onClick={() => goToStep(1)}>Back</button>
            <span className="spacer"></span>
            <button className="btn btn-solid" type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create visit"}</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
