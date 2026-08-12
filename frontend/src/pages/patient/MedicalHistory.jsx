import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { PatientAPI } from "../../lib/patientApi.js";
import { formatDate, downloadBlob } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

function assignVisitNumbers(visits) {
  const sorted = [...visits].sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
  const numberByVisitId = {};
  sorted.forEach((visit, index) => {
    numberByVisitId[visit.visitId] = index + 1;
  });
  return numberByVisitId;
}

export default function MedicalHistory() {
  useDocumentTitle("Medical History — Aarogyam Patient");
  const showToast = useToast();

  const [visits, setVisits] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnosisTypes, setDiagnosisTypes] = useState([]);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterTypeId, setFilterTypeId] = useState("");
  const [openVisitIds, setOpenVisitIds] = useState(() => new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalDetail, setModalDetail] = useState(null);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);

  useEffect(() => {
    Promise.all([PatientAPI.visits(), PatientAPI.diagnoses(), PatientAPI.prescriptions(), PatientAPI.diagnosisTypes()])
      .then(([visitRows, diagnosisRows, prescriptionRows, typeRows]) => {
        setVisits(visitRows || []);
        setDiagnoses(diagnosisRows || []);
        setPrescriptions(prescriptionRows || []);
        setDiagnosisTypes(typeRows || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const numberByVisitId = useMemo(() => assignVisitNumbers(visits), [visits]);

  const filteredVisits = useMemo(() => {
    const term = search.toLowerCase();
    const typeId = filterTypeId ? Number(filterTypeId) : null;

    const filteredDiagnoses = diagnoses.filter((item) => {
      const matchesType = !typeId || item.diagnosisTypeId === typeId;
      const matchesTerm =
        !term ||
        item.diagnosisTitle.toLowerCase().includes(term) ||
        (item.description || "").toLowerCase().includes(term);
      return matchesType && matchesTerm;
    });
    const allowedVisitIds = {};
    filteredDiagnoses.forEach((item) => (allowedVisitIds[item.visitId] = true));

    const matchingPrescriptionVisitIds = {};
    if (term) {
      prescriptions.forEach((p) => {
        if ((p.prescriptionText || "").toLowerCase().includes(term)) matchingPrescriptionVisitIds[p.visitId] = true;
      });
    }

    const result =
      term || typeId
        ? visits.filter(
            (visit) =>
              allowedVisitIds[visit.visitId] ||
              matchingPrescriptionVisitIds[visit.visitId] ||
              (!typeId && (visit.notes || "").toLowerCase().includes(term))
          )
        : visits;

    return [...result].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  }, [visits, diagnoses, prescriptions, search, filterTypeId]);

  const diagnosisByVisit = useMemo(() => {
    const map = {};
    diagnoses.forEach((d) => (map[d.visitId] = map[d.visitId] || []).push(d));
    return map;
  }, [diagnoses]);

  const prescriptionByVisit = useMemo(() => {
    const map = {};
    prescriptions.forEach((p) => (map[p.visitId] = map[p.visitId] || []).push(p));
    return map;
  }, [prescriptions]);

  function toggleVisit(visitId) {
    setOpenVisitIds((current) => {
      const next = new Set(current);
      if (next.has(visitId)) next.delete(visitId);
      else next.add(visitId);
      return next;
    });
  }

  async function handleDownloadPrescription(id) {
    try {
      const file = await PatientAPI.downloadPrescription(id);
      downloadBlob(file.blob, file.fileName || "prescription-" + id + ".pdf");
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function openPrescription(id) {
    setCurrentPrescriptionId(id);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalDetail(null);
    document.body.style.overflow = "hidden";
    try {
      const detail = await PatientAPI.prescriptionDetails(id);
      setModalDetail(detail);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    document.body.style.overflow = "";
  }

  if (error) {
    return (
      <div className="pt-content">
        <div className="empty-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>Medical history</h2>
          <p>Every visit, diagnosis and prescription — click a visit to see the full details.</p>
        </div>
      </div>
      <div className="toolbar">
        <input
          id="historySearch"
          type="search"
          placeholder="Search visits, diagnoses or prescriptions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select id="historyFilter" value={filterTypeId} onChange={(e) => setFilterTypeId(e.target.value)}>
          <option value="">All diagnosis types</option>
          {diagnosisTypes.map((item) => (
            <option key={item.diagnosisTypeId} value={item.diagnosisTypeId}>{item.diagnosisTypeName}</option>
          ))}
        </select>
      </div>
      <div id="historyList">
        {!visits.length && !error ? (
          <div className="table-loading">Loading history…</div>
        ) : !filteredVisits.length ? (
          <div className="empty-state">No visits recorded yet.</div>
        ) : (
          filteredVisits.map((visit) => {
            const vDiagnoses = diagnosisByVisit[visit.visitId] || [];
            const vPrescriptions = prescriptionByVisit[visit.visitId] || [];
            const title = vDiagnoses.length ? vDiagnoses.map((d) => d.diagnosisTitle).join(", ") : "Consultation";
            const isOpen = openVisitIds.has(visit.visitId);
            return (
              <div className={"visit-card" + (isOpen ? " open" : "")} key={visit.visitId}>
                <div className="visit-card-head" onClick={() => toggleVisit(visit.visitId)}>
                  <div className="visit-card-num">{numberByVisitId[visit.visitId]}</div>
                  <div className="visit-card-main">
                    <div className="visit-card-date">{formatDate(visit.visitDate)}</div>
                    <div className="visit-card-title">{title}</div>
                    {vDiagnoses.length ? (
                      <div className="visit-card-tags">
                        {vDiagnoses.map((d) => (
                          <span className="badge ok" key={d.diagnosisId}>{d.diagnosisTitle}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <svg className="visit-card-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" /></svg>
                </div>
                <div className="visit-card-body">
                  <div className="visit-sub-block">
                    <div className="visit-sub-label">Notes</div>
                    <div className="row-sub">{visit.notes || "No notes added."}</div>
                  </div>
                  {vDiagnoses.length ? (
                    <div className="visit-sub-block">
                      <div className="visit-sub-label">Diagnoses</div>
                      {vDiagnoses.map((d) => (
                        <div className="timeline-body-card" key={d.diagnosisId}>
                          <b>{d.diagnosisTitle}</b>
                          <div className="row-sub">{d.description || "No description added."}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {vPrescriptions.length ? (
                    <div className="visit-sub-block">
                      <div className="visit-sub-label">Prescriptions</div>
                      <div className="stack-list">
                        {vPrescriptions.map((p) => (
                          <article className="list-item clickable" key={p.prescriptionId} onClick={() => openPrescription(p.prescriptionId)}>
                            <div className="list-item-main">
                              <div className="row-title">{formatDate(p.prescriptionDate)}</div>
                              <div className="row-sub">{(p.prescriptionText || "").slice(0, 140)}</div>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPrescription(p.prescriptionId);
                              }}
                            >
                              Download
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="modal-overlay" id="prescriptionModal" hidden={!modalOpen}>
        <div className="modal">
          <div className="modal-head">
            <h3>Prescription details</h3>
            <button className="modal-close" type="button" aria-label="Close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            <div id="prescriptionDetailContent">
              {modalLoading ? (
                <div className="table-loading">Loading prescription…</div>
              ) : modalError ? (
                <div className="form-alert error">{modalError}</div>
              ) : modalDetail ? (
                <div className="detail-grid">
                  <div>
                    <div className="dl">Doctor</div>
                    <div className="dv">{modalDetail.doctorName}</div>
                  </div>
                  <div>
                    <div className="dl">Date</div>
                    <div className="dv">{formatDate(modalDetail.prescriptionDate)}</div>
                  </div>
                  <div>
                    <div className="dl">Diagnosis</div>
                    <div className="dv">{modalDetail.diagnosisTitle || "Not linked"}</div>
                  </div>
                  <div className="full">
                    <div className="dl">Prescription</div>
                    <div className="dv">{modalDetail.prescriptionText || "No prescription text."}</div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={closeModal}>Close</button>
              <button
                className="btn btn-solid"
                id="downloadPrescriptionBtn"
                type="button"
                onClick={() => currentPrescriptionId && handleDownloadPrescription(currentPrescriptionId)}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
