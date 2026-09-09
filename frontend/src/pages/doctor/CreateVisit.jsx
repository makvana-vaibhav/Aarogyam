import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI, extractAarogyamId } from "../../lib/doctorApi.js";
import { initials } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import SearchableSelect from "../../components/SearchableSelect.jsx";

function joinName(row) {
  if (!row) return "";
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

export default function CreateVisit() {
  useDocumentTitle("Create Visit · Aarogyam Doctor");
  const showToast = useToast();
  const navigate = useNavigate();
  const { requestScan } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [diagnosisTypes, setDiagnosisTypes] = useState([]);
  const [flowAlert, setFlowAlert] = useState(null);

  // Live Patient Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [foundPatient, setFoundPatient] = useState(null);
  const searchDebounceRef = useRef(null);

  const [visitDate, setVisitDate] = useState(() => toLocalDatetimeValue(new Date()));
  const [visitNotes, setVisitNotes] = useState("");
  const [diagnosisOpen, setDiagnosisOpen] = useState(true);
  const [diagnosisTypeId, setDiagnosisTypeId] = useState("");
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [diagnosisDescription, setDiagnosisDescription] = useState("");

  const [prescriptionOpen, setPrescriptionOpen] = useState(true);
  const [prescriptionText, setPrescriptionText] = useState("");

  const [reportOpen, setReportOpen] = useState(true);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportFileError, setReportFileError] = useState(null);
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

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setReportFileError(null);
    setInvalid((v) => ({ ...v, rowReportFile: false }));
    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];
      if (!allowed.includes(ext)) {
        setReportFileError("Please select correct file format and size (PDF, PNG, JPG, JPEG, DOC, DOCX).");
        setInvalid((v) => ({ ...v, rowReportFile: true }));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setReportFileError("Please select correct file format and size (Max file size 20 MB).");
        setInvalid((v) => ({ ...v, rowReportFile: true }));
        return;
      }
    }
  }

  function selectPatient(patient) {
    if (!patient) return;
    setFoundPatient(patient);
    setSearchQuery(patient.aarogyamId);
    setSearchResults([]);
    setSearchError(null);
    setInvalid((v) => ({ ...v, rowSearch: false }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function executeSearch(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const cleanId = extractAarogyamId(trimmed) || trimmed;
      const rows = await DoctorAPI.searchPatients(cleanId, cleanId);

      let results = rows || [];
      // If no results and query is numeric, attempt numeric ID lookup
      if (results.length === 0 && /^\d+$/.test(cleanId)) {
        try {
          const single = await DoctorAPI.getPatient(Number(cleanId));
          if (single) results = [single];
        } catch (e) {}
      }

      setSearchResults(results);
      if (results.length === 0) {
        setSearchError("No patient found matching \"" + trimmed + "\".");
      }
    } catch (err) {
      setSearchError(err.message || "Failed to search patient.");
    } finally {
      setSearchLoading(false);
    }
  }

  // Live debounced search on input change
  function handleQueryChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setInvalid((v) => ({ ...v, rowSearch: false }));
    setSearchError(null);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      executeSearch(val);
    }, 200);
  }

  // Trigger search on button click or Enter key
  async function handleFindClick() {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setInvalid((v) => ({ ...v, rowSearch: true }));
      setSearchError("Please enter a patient name or Aarogyam ID.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const cleanId = extractAarogyamId(trimmed) || trimmed;
      const rows = await DoctorAPI.searchPatients(cleanId, cleanId);
      let results = rows || [];

      if (results.length === 0 && /^\d+$/.test(cleanId)) {
        try {
          const single = await DoctorAPI.getPatient(Number(cleanId));
          if (single) results = [single];
        } catch (e) {}
      }

      setSearchResults(results);
      if (results.length === 1) {
        // Single direct match: select and continue immediately
        selectPatient(results[0]);
      } else if (results.length === 0) {
        setSearchError("No patient found matching \"" + trimmed + "\".");
      }
    } catch (err) {
      setSearchError(err.message || "Failed to search patient.");
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    const patientIdParam = searchParams.get("patientId");
    const aarogyamIdParam = searchParams.get("aarogyamId");
    if (patientIdParam) {
      DoctorAPI.getPatient(patientIdParam)
        .then((patient) => {
          if (patient) selectPatient(patient);
        })
        .catch((err) => setFlowAlert(err.message));
    } else if (aarogyamIdParam) {
      const clean = extractAarogyamId(aarogyamIdParam) || aarogyamIdParam;
      DoctorAPI.searchPatients(clean, clean)
        .then((rows) => {
          if (rows && rows.length > 0) {
            selectPatient(rows[0]);
          }
        })
        .catch((err) => setFlowAlert(err.message));
    }
  }, [searchParams]);

  function goToStep(nextStep) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScan() {
    requestScan((scannedId) => {
      const cleanId = extractAarogyamId(scannedId) || scannedId;
      setSearchQuery(cleanId);
      DoctorAPI.searchPatients(cleanId, cleanId)
        .then((rows) => {
          if (rows && rows.length > 0) {
            selectPatient(rows[0]);
          } else {
            setSearchError("No patient found for scanned code: " + cleanId);
          }
        })
        .catch((err) => setSearchError(err.message));
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFlowAlert(null);
    setReportFileError(null);

    if (!foundPatient) {
      setFlowAlert("Please find and choose a patient first.");
      goToStep(1);
      return;
    }

    const reportFile = reportFileRef.current?.files[0];
    const visitDateValid = !!visitDate;

    // Diagnosis validation: if user enters diagnosis info or leaves fields partially filled
    const hasDiagnosisInput = !!diagnosisTypeId || !!diagnosisTitle.trim() || !!diagnosisDescription.trim();
    const shouldSaveDiagnosis = diagnosisOpen && (hasDiagnosisInput || !!diagnosisTypeId || !!diagnosisTitle.trim());
    let diagnosisTypeValid = true;
    let diagnosisTitleValid = true;
    if (shouldSaveDiagnosis) {
      diagnosisTypeValid = !!diagnosisTypeId;
      diagnosisTitleValid = !!diagnosisTitle.trim();
    }

    // Prescription validation
    const hasPrescriptionInput = !!prescriptionText.trim();
    const shouldSavePrescription = prescriptionOpen && hasPrescriptionInput;
    let prescriptionValid = true;

    // Report validation: if title, type, or file is selected
    const hasReportInput = !!reportTitle.trim() || !!reportType.trim() || !!reportFile;
    const shouldSaveReport = reportOpen && (hasReportInput || !!reportTitle.trim() || !!reportFile);
    let reportTitleValid = true;
    let reportFileValid = true;
    let reportFileSizeValid = true;

    if (shouldSaveReport) {
      reportTitleValid = !!reportTitle.trim();
      reportFileValid = !!reportFile;

      if (reportFile) {
        const ext = reportFile.name.slice(reportFile.name.lastIndexOf(".")).toLowerCase();
        const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];
        if (!allowed.includes(ext) || reportFile.size > 20 * 1024 * 1024) {
          reportFileSizeValid = false;
          setReportFileError("Please select correct file format and size (Max 20 MB).");
        }
      }
    }

    const isAllValid =
      visitDateValid &&
      diagnosisTypeValid &&
      diagnosisTitleValid &&
      prescriptionValid &&
      reportTitleValid &&
      reportFileValid &&
      reportFileSizeValid;

    setInvalid({
      rowVisitDate: !visitDateValid,
      rowDiagnosisType: !diagnosisTypeValid,
      rowDiagnosisTitle: !diagnosisTitleValid,
      rowPrescriptionText: !prescriptionValid,
      rowReportTitle: !reportTitleValid,
      rowReportFile: !reportFileValid || !reportFileSizeValid
    });

    if (!isAllValid) {
      if (!diagnosisTypeValid || !diagnosisTitleValid) setDiagnosisOpen(true);
      if (!prescriptionValid) setPrescriptionOpen(true);
      if (!reportTitleValid || !reportFileValid || !reportFileSizeValid) setReportOpen(true);

      if (!reportFileSizeValid) {
        setFlowAlert("Please select correct file format and size (Max 20 MB).");
      } else {
        setFlowAlert("Please fill in all required fields and correct the highlighted errors before saving.");
      }
      return;
    }

    submitVisit(reportFile, shouldSaveDiagnosis, shouldSavePrescription, shouldSaveReport);
  }

  async function submitVisit(reportFile, shouldSaveDiagnosis, shouldSavePrescription, shouldSaveReport) {
    const patientIdVal = foundPatient.patientId;
    const visitDateOnly = visitDate.split("T")[0];
    setSubmitting(true);

    let visit = null;
    try {
      visit = await DoctorAPI.createVisit({
        patientId: patientIdVal,
        visitDate,
        notes: visitNotes.trim()
      });

      let diagnosisId = null;
      if (shouldSaveDiagnosis && diagnosisTypeId && diagnosisTitle.trim()) {
        const diagnosis = await DoctorAPI.createDiagnosis({
          visitId: visit.visitId,
          diagnosisTypeId: Number(diagnosisTypeId),
          diagnosisTitle: diagnosisTitle.trim(),
          description: diagnosisDescription.trim(),
          diagnosisDate: visitDateOnly
        });
        diagnosisId = diagnosis.diagnosisId;
      }

      if (shouldSavePrescription && prescriptionText.trim()) {
        await DoctorAPI.createPrescription({
          visitId: visit.visitId,
          diagnosisId,
          prescriptionText: prescriptionText.trim(),
          prescriptionDate: visitDateOnly
        });
      }

      if (shouldSaveReport && reportTitle.trim() && reportFile) {
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

      try {
        await DoctorAPI.notifyVisitPatient(visit.visitId);
      } catch (notifyErr) {
        // Best-effort: the visit (and any diagnosis/prescription/report) is
        // already saved, so a notification hiccup shouldn't block the flow.
      }

      showToast("Visit created successfully.");
      setTimeout(() => {
        navigate("/doctor/patient?patientId=" + patientIdVal);
      }, 900);
    } catch (err) {
      // The visit record (and any diagnosis/prescription already attached to it)
      // was created before this step failed - roll it back so the doctor doesn't
      // end up with a half-saved visit that looks successful but is missing
      // whatever failed (most commonly the report upload).
      if (visit?.visitId) {
        try {
          await DoctorAPI.deleteVisit(visit.visitId);
          setFlowAlert("Visit was not saved: " + err.message);
        } catch (rollbackErr) {
          setFlowAlert(
            "Visit was not fully saved (" + err.message + "), and we couldn't automatically clean it up. " +
            "Please check this patient's visit history before trying again."
          );
        }
      } else {
        setFlowAlert(err.message);
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>New visit</h2>
          <p>Search the patient by name or Aarogyam ID, then record the visit details.</p>
        </div>
      </div>

      <div className="wizard-steps">
        <div className={"wizard-step-pill" + (step === 1 ? " active" : " done")} id="stepPill1"><span className="num">1</span>Find patient</div>
        <div className="wizard-connector"></div>
        <div className={"wizard-step-pill" + (step === 2 ? " active" : "")} id="stepPill2"><span className="num">2</span>Visit details</div>
      </div>

      {flowAlert ? <div ref={flowAlertRef} id="flowAlert" className="form-alert error" tabIndex={-1} style={{ outline: "none" }}>{flowAlert}</div> : null}

      {step === 1 ? (
        <section className="wizard-panel" id="step1Panel">
          <div className="card">
            <div className="card-title">Find patient</div>
            <div className="card-sub">Type the patient's name, full or partial Aarogyam ID, or scan their Health Card QR Code. Click any matching patient to continue.</div>

            <div className={"form-row" + (invalid.rowSearch ? " invalid" : "")} id="rowSearch">
              <label htmlFor="searchQuery">Search patient<span className="req">*</span></label>
              <div className="search-input-wrap">
                <input
                  id="searchQuery"
                  type="text"
                  placeholder="e.g. Vaibhav Makvana or ARG-2026-000001"
                  value={searchQuery}
                  onChange={handleQueryChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFindClick();
                    }
                  }}
                />
                <button className="btn btn-solid" id="findPatientBtn" type="button" onClick={handleFindClick}>
                  Find patient
                </button>
              </div>
              <div className="field-error">Please enter a patient name or Aarogyam ID.</div>
            </div>

            <div id="lookupResult">
              {searchLoading ? (
                <div className="table-loading" style={{ margin: "14px 0" }}>Searching patients…</div>
              ) : searchError ? (
                <div className="form-alert error" style={{ marginTop: "14px" }}>{searchError}</div>
              ) : null}

              {searchResults.length > 0 ? (
                <div className="patient-search-results">
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>
                    Select a matching patient ({searchResults.length}):
                  </div>
                  {searchResults.map((p) => (
                    <button
                      key={p.patientId}
                      type="button"
                      className="patient-search-card"
                      onClick={() => selectPatient(p)}
                    >
                      <div className="avatar-circle small">{initials(p.firstName, p.lastName)}</div>
                      <div className="pf-main">
                        <div className="pf-name">{joinName(p)}</div>
                        <div className="pf-meta">
                          <span className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>{p.aarogyamId}</span>
                          <span>•</span>
                          <span>{p.gender || "Gender unrecorded"}</span>
                          <span>•</span>
                          <span>Blood: {p.bloodGroup || "Not set"}</span>
                          {p.email ? (
                            <>
                              <span>•</span>
                              <span>{p.email}</span>
                            </>
                          ) : null}
                          {p.emergencyContact ? (
                            <>
                              <span>•</span>
                              <span>Emergency: {p.emergencyContact}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="pf-action">
                        Select &amp; continue →
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {foundPatient && searchResults.length === 0 && !searchLoading ? (
                <div className="patient-found-card">
                  <div className="avatar-circle small">{initials(foundPatient.firstName, foundPatient.lastName)}</div>
                  <div className="pf-main">
                    <div className="row-title" style={{ fontSize: "15px", fontWeight: 600 }}>{joinName(foundPatient)} (Selected)</div>
                    <div className="row-sub mono" style={{ fontSize: "13px", marginTop: "2px" }}>
                      {foundPatient.aarogyamId} • {foundPatient.gender} • {foundPatient.bloodGroup || "Blood group not set"}{foundPatient.email ? " • " + foundPatient.email : ""}
                    </div>
                  </div>
                  <button
                    className="btn btn-solid btn-sm"
                    type="button"
                    onClick={() => goToStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <form id="visitFlowForm" className="wizard-panel" onSubmit={handleSubmit}>
          {foundPatient ? (
            <div className="patient-found-card" style={{ marginBottom: "20px" }}>
              <div className="avatar-circle small">{initials(foundPatient.firstName, foundPatient.lastName)}</div>
              <div className="pf-main">
                <div className="row-title" style={{ fontSize: "15px", fontWeight: 600 }}>{joinName(foundPatient)}</div>
                <div className="row-sub mono">{foundPatient.aarogyamId} • {foundPatient.gender} • {foundPatient.bloodGroup || "Blood group not set"}{foundPatient.email ? " • " + foundPatient.email : ""}</div>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => goToStep(1)}>Change patient</button>
            </div>
          ) : null}

          <div className="card">
            <div className="card-title">Consultation details</div>
            <div className="form-row-2col">
              <div className={"form-row" + (invalid.rowVisitDate ? " invalid" : "")} id="rowVisitDate">
                <label htmlFor="visitDate">Visit date &amp; time<span className="req">*</span></label>
                <input id="visitDate" type="datetime-local" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                <div className="field-error">Please choose a valid visit date.</div>
              </div>
            </div>
            <div className="form-row" id="rowVisitNotes">
              <label htmlFor="visitNotes">Doctor notes</label>
              <textarea id="visitNotes" rows="3" placeholder="Chief complaints, symptoms, observations…" value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)}></textarea>
            </div>
          </div>

          {/* Optional Diagnosis */}
          <div className={"card optional-section" + (diagnosisOpen ? " open" : "")} id="diagnosisSection">
            <div className="optional-toggle" onClick={() => setDiagnosisOpen((v) => !v)}>
              <div>
                <div className="card-title">Add diagnosis <span className="tag-opt">Optional</span></div>
                <div className="card-sub">Link a formal diagnosis code and title to this visit.</div>
              </div>
              <span className="chev">▼</span>
            </div>
            <div className="optional-body">
              <div className="form-row-2col">
                <div className={"form-row" + (invalid.rowDiagnosisType ? " invalid" : "")} id="rowDiagnosisType">
                  <label htmlFor="diagnosisTypeId">Diagnosis type<span className="req">*</span></label>
                  <SearchableSelect
                    id="diagnosisTypeId"
                    value={diagnosisTypeId}
                    onChange={setDiagnosisTypeId}
                    options={diagnosisTypes.map((t) => ({ value: t.diagnosisTypeId, label: t.diagnosisTypeName }))}
                    placeholder="Select type"
                  />
                  <div className="field-error">Choose a diagnosis type.</div>
                </div>
                <div className={"form-row" + (invalid.rowDiagnosisTitle ? " invalid" : "")} id="rowDiagnosisTitle">
                  <label htmlFor="diagnosisTitle">Diagnosis title<span className="req">*</span></label>
                  <input id="diagnosisTitle" placeholder="e.g. Acute Bronchitis" value={diagnosisTitle} onChange={(e) => setDiagnosisTitle(e.target.value)} />
                  <div className="field-error">Enter a diagnosis title.</div>
                </div>
              </div>
              <div className="form-row" id="rowDiagnosisDesc">
                <label htmlFor="diagnosisDescription">Description</label>
                <textarea id="diagnosisDescription" rows="2" placeholder="Clinical findings, severity, etc." value={diagnosisDescription} onChange={(e) => setDiagnosisDescription(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          {/* Optional Prescription */}
          <div className={"card optional-section" + (prescriptionOpen ? " open" : "")} id="prescriptionSection">
            <div className="optional-toggle" onClick={() => setPrescriptionOpen((v) => !v)}>
              <div>
                <div className="card-title">Add prescription <span className="tag-opt">Optional</span></div>
                <div className="card-sub">Prescribe medicines, dosage instructions and dietary advice.</div>
              </div>
              <span className="chev">▼</span>
            </div>
            <div className="optional-body">
              <div className={"form-row" + (invalid.rowPrescriptionText ? " invalid" : "")} id="rowPrescriptionText">
                <label htmlFor="prescriptionText">Prescription details<span className="req">*</span></label>
                <textarea id="prescriptionText" rows="4" placeholder="e.g. 1. Tab Paracetamol 650mg — 1-0-1 after food (3 days)&#10;2. Syp Ambrolite 5ml — 1-1-1 (5 days)" value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)}></textarea>
                <div className="field-error">Prescription text is required if you enabled this section.</div>
              </div>
            </div>
          </div>

          {/* Optional Report */}
          <div className={"card optional-section" + (reportOpen ? " open" : "")} id="reportSection">
            <div className="optional-toggle" onClick={() => setReportOpen((v) => !v)}>
              <div>
                <div className="card-title">Upload lab report / scan <span className="tag-opt">Optional</span></div>
                <div className="card-sub">Attach a PDF or image report to this visit.</div>
              </div>
              <span className="chev">▼</span>
            </div>
            <div className="optional-body">
              <div className="form-row-2col">
                <div className={"form-row" + (invalid.rowReportTitle ? " invalid" : "")} id="rowReportTitle">
                  <label htmlFor="reportTitle">Report title<span className="req">*</span></label>
                  <input id="reportTitle" placeholder="e.g. Complete Blood Count" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
                  <div className="field-error">Enter a report title.</div>
                </div>
                <div className="form-row" id="rowReportType">
                  <label htmlFor="reportType">Report type</label>
                  <input id="reportType" placeholder="e.g. Pathology, Radiology" value={reportType} onChange={(e) => setReportType(e.target.value)} />
                </div>
              </div>
              <div className={"form-row" + (invalid.rowReportFile ? " invalid" : "")} id="rowReportFile">
                <label htmlFor="reportFile">Report file (PDF, image, or Word doc)<span className="req">*</span></label>
                <input ref={reportFileRef} id="reportFile" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />
                <div className="field-hint" style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginTop: "4px" }}>
                  Max file size limit: <strong>20 MB</strong>. Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX.
                </div>
                <div className="field-error">{reportFileError || "Select a report file to upload."}</div>
              </div>
            </div>
          </div>

          <div className="wizard-nav">
            <button className="btn btn-ghost" type="button" id="backToStep1" onClick={() => goToStep(1)}>← Back to patient</button>
            <div className="spacer"></div>
            <button className="btn btn-solid btn-lg" id="saveVisitBtn" type="submit" disabled={submitting}>
              {submitting ? "Saving visit…" : "Save and finish visit"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
