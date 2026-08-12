import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI, statusBadgeClass } from "../../lib/adminApi.js";
import { formatDate, formatDateTime } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" }
];

function fullName(d) {
  return [d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ");
}

function buildLookup(rows, idField, nameField) {
  const map = {};
  rows.forEach((r) => (map[r[idField]] = r[nameField]));
  return map;
}

export default function Doctors() {
  useDocumentTitle("Doctors — Aarogyam Admin");
  const showToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get("status") || "";

  const [lookups, setLookups] = useState({ hospitals: {}, degrees: {}, specializations: {}, countries: {}, states: {}, cities: {} });
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [activeDoctorId, setActiveDoctorId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionAlert, setActionAlert] = useState(null);

  function loadLookups() {
    return Promise.all([
      AdminAPI.master("hospitals").list(),
      AdminAPI.master("degrees").list(),
      AdminAPI.master("specializations").list(),
      AdminAPI.master("countries").list(),
      AdminAPI.master("states").list(),
      AdminAPI.master("cities").list()
    ])
      .then(([hospitals, degrees, specializations, countries, states, cities]) => {
        setLookups({
          hospitals: buildLookup(hospitals, "hospitalId", "hospitalName"),
          degrees: buildLookup(degrees, "degreeId", "degreeName"),
          specializations: buildLookup(specializations, "specializationId", "specializationName"),
          countries: buildLookup(countries, "countryId", "countryName"),
          states: buildLookup(states, "stateId", "stateName"),
          cities: buildLookup(cities, "cityId", "cityName")
        });
      })
      .catch(() => {});
  }

  function loadDoctors() {
    setLoading(true);
    setLoadError(null);
    return AdminAPI.listDoctors(currentStatus || undefined)
      .then((rows) => setAllDoctors(rows))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLookups().then(loadDoctors).then(() => {
      const deepLinkId = searchParams.get("doctorId");
      if (deepLinkId) openDoctor(Number(deepLinkId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus]);

  function selectStatus(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("status", value); else next.delete("status");
    setSearchParams(next, { replace: true });
  }

  function matchesSearch(d, term) {
    if (!term) return true;
    const lower = term.toLowerCase();
    return fullName(d).toLowerCase().includes(lower) || String(d.licenseNumber || "").toLowerCase().includes(lower);
  }

  const visibleDoctors = allDoctors.filter((d) => matchesSearch(d, search.trim()));

  async function openDoctor(doctorId) {
    setActiveDoctorId(doctorId);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setDetail(null);
    setRejecting(false);
    setRejectReason("");
    setActionAlert(null);
    try {
      const d = await AdminAPI.getDoctor(doctorId);
      setDetail(d);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setRejectReason("");
    setActionAlert(null);
    setRejecting(false);
  }

  async function handleApprove() {
    setActionAlert(null);
    try {
      await AdminAPI.approveDoctor(activeDoctorId);
      showToast("Doctor approved.");
      closeModal();
      loadDoctors();
    } catch (err) {
      setActionAlert(err.message);
    }
  }

  async function handleReject() {
    const reason = rejectReason.trim();
    if (!reason) {
      setActionAlert("Please provide a rejection reason.");
      return;
    }
    setActionAlert(null);
    try {
      await AdminAPI.rejectDoctor(activeDoctorId, reason);
      showToast("Doctor application rejected.");
      closeModal();
      loadDoctors();
    } catch (err) {
      setActionAlert(err.message);
    }
  }

  const addressLine = detail
    ? [detail.address, lookups.cities[detail.cityId], lookups.states[detail.stateId], lookups.countries[detail.countryId]].filter(Boolean).join(", ")
    : "";

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>Doctor verification</h2>
          <p>Review licence and degree details, then approve or reject each application.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs" id="statusTabs">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} className={currentStatus === tab.value ? "active" : ""} onClick={() => selectStatus(tab.value)}>{tab.label}</button>
          ))}
        </div>
        <div className="spacer"></div>
        <input type="search" id="doctorSearch" placeholder="Search by name or licence…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Doctor</th><th>Licence</th><th>Hospital</th><th>Specialization</th><th>Status</th><th>Applied</th><th></th></tr></thead>
          <tbody id="doctorsBody">
            {loading ? (
              <tr><td colSpan={7} className="table-loading">Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={7} className="table-empty">{loadError}</td></tr>
            ) : !visibleDoctors.length ? (
              <tr><td colSpan={7} className="table-empty">No doctors match this view.</td></tr>
            ) : (
              visibleDoctors.map((d) => (
                <tr key={d.doctorId}>
                  <td><div className="row-title">{fullName(d)}</div></td>
                  <td className="mono">{d.licenseNumber}</td>
                  <td>{lookups.hospitals[d.hospitalId] || "#" + d.hospitalId}</td>
                  <td>{lookups.specializations[d.specializationId] || "#" + d.specializationId}</td>
                  <td><span className={"badge " + statusBadgeClass(d.approvalStatus)}>{d.approvalStatus}</span></td>
                  <td>{formatDate(d.createdAt)}</td>
                  <td className="actions"><button className="btn btn-ghost btn-sm" onClick={() => openDoctor(d.doctorId)}>Review</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-overlay" id="doctorModal" hidden={!modalOpen} onClick={(e) => { if (e.target.id === "doctorModal") closeModal(); }}>
        <div className="modal">
          <div className="modal-head">
            <h3 id="dmName">{modalLoading ? "Loading…" : modalError ? "Error" : detail ? fullName(detail) : "Doctor"}</h3>
            <button className="modal-close" id="dmClose" aria-label="Close" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body">
            <div className="detail-grid" id="dmGrid">
              {detail ? (
                <>
                  <div><div className="dl">Status</div><div className="dv"><span className={"badge " + statusBadgeClass(detail.approvalStatus)}>{detail.approvalStatus}</span></div></div>
                  <div><div className="dl">Licence number</div><div className="dv">{detail.licenseNumber}</div></div>
                  <div><div className="dl">Hospital</div><div className="dv">{lookups.hospitals[detail.hospitalId] || "#" + detail.hospitalId}</div></div>
                  <div><div className="dl">Degree</div><div className="dv">{lookups.degrees[detail.degreeId] || "#" + detail.degreeId}</div></div>
                  <div><div className="dl">Specialization</div><div className="dv">{lookups.specializations[detail.specializationId] || "#" + detail.specializationId}</div></div>
                  <div><div className="dl">Applied</div><div className="dv">{formatDate(detail.createdAt)}</div></div>
                  <div className="full"><div className="dl">Address</div><div className="dv">{addressLine}</div></div>
                  <div className="full"><div className="dl">Licence document</div><div className="dv"><span className="mono">{detail.licenseDocumentPath || "—"}</span></div></div>
                  <div className="full"><div className="dl">Degree document</div><div className="dv"><span className="mono">{detail.degreeDocumentPath || "—"}</span></div></div>
                  {String(detail.approvalStatus).toLowerCase() === "rejected" && detail.rejectionReason ? (
                    <div className="full"><div className="dl">Rejection reason</div><div className="dv">{detail.rejectionReason}</div></div>
                  ) : null}
                  {detail.approvedAt ? (
                    <div><div className="dl">Decided at</div><div className="dv">{formatDateTime(detail.approvedAt)}</div></div>
                  ) : null}
                </>
              ) : null}
            </div>
            {rejecting ? (
              <div id="dmRejectBox" style={{ marginTop: "16px" }}>
                <div className="form-row">
                  <label htmlFor="dmRejectReason">Rejection reason<span className="req">*</span></label>
                  <textarea id="dmRejectReason" maxLength={200} placeholder="Explain why this application is being rejected…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}></textarea>
                </div>
              </div>
            ) : null}
            {modalError ? <div id="dmAlert" className="form-alert error" style={{ marginTop: "16px" }}>{modalError}</div> : null}
            {actionAlert ? <div id="dmAlert" className="form-alert error" style={{ marginTop: "16px" }}>{actionAlert}</div> : null}
          </div>
          <div className="modal-actions" id="dmActions">
            {detail && String(detail.approvalStatus).toLowerCase() === "pending" ? (
              rejecting ? (
                <>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setRejecting(false); setActionAlert(null); }}>Cancel</button>
                  <button className="btn btn-danger btn-sm" type="button" onClick={handleReject}>Confirm rejection</button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setRejecting(true)}>Reject</button>
                  <button className="btn btn-solid btn-sm" type="button" onClick={handleApprove}>Approve</button>
                </>
              )
            ) : (
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Close</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
