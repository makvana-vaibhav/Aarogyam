import { useEffect, useRef, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI } from "../../lib/adminApi.js";
import { formatDate } from "../../lib/format.js";

function buildLookup(rows, idField, nameField) {
  const map = {};
  rows.forEach((r) => (map[r[idField]] = r[nameField]));
  return map;
}

function fullName(p) {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
}

export default function Patients() {
  useDocumentTitle("Patients · Aarogyam Admin");

  const [lookups, setLookups] = useState({ countries: {}, states: {}, cities: {} });
  const [patients, setPatients] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const searchTimerRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [detail, setDetail] = useState(null);

  function loadPatients(searchName) {
    setLoadError(null);
    AdminAPI.listPatients(searchName)
      .then((rows) => setPatients(rows))
      .catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    Promise.all([AdminAPI.master("countries").list(), AdminAPI.master("states").list(), AdminAPI.master("cities").list()])
      .then(([countries, states, cities]) => {
        setLookups({
          countries: buildLookup(countries, "countryId", "countryName"),
          states: buildLookup(states, "stateId", "stateName"),
          cities: buildLookup(cities, "cityId", "cityName")
        });
      })
      .catch(() => {});
    loadPatients();
  }, []);

  function handleSearchChange(value) {
    setSearch(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => loadPatients(value.trim()), 300);
  }

  async function openPatient(patientId) {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setDetail(null);
    try {
      const p = await AdminAPI.getPatient(patientId);
      setDetail(p);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  const addressLine = detail
    ? [detail.address, lookups.cities[detail.cityId], lookups.states[detail.stateId], lookups.countries[detail.countryId]].filter(Boolean).join(", ")
    : "";

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>Patient directory</h2>
          <p>Read-only view of registered patients and their Aarogyam ID.</p>
        </div>
      </div>

      <div className="toolbar">
        <input type="search" id="patientSearch" placeholder="Search by name…" style={{ minWidth: "280px" }} value={search} onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Aarogyam ID</th><th>Name</th><th>DOB</th><th>Gender</th><th>Blood group</th><th>Registered</th><th></th></tr></thead>
          <tbody id="patientsBody">
            {loadError ? (
              <tr><td colSpan={7} className="table-empty">{loadError}</td></tr>
            ) : !patients ? (
              <tr><td colSpan={7} className="table-loading">Loading…</td></tr>
            ) : !patients.length ? (
              <tr><td colSpan={7} className="table-empty">No patients found.</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p.patientId}>
                  <td className="mono">{p.aarogyamId}</td>
                  <td><div className="row-title">{fullName(p)}</div></td>
                  <td>{formatDate(p.dateOfBirth)}</td>
                  <td>{p.gender}</td>
                  <td>{p.bloodGroup || "—"}</td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td className="actions"><button className="btn btn-ghost btn-sm" onClick={() => openPatient(p.patientId)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-overlay" id="patientModal" hidden={!modalOpen} onClick={(e) => { if (e.target.id === "patientModal") closeModal(); }}>
        <div className="modal">
          <div className="modal-head">
            <h3 id="pmName">{modalLoading ? "Loading…" : modalError ? "Error" : detail ? fullName(detail) : "Patient"}</h3>
            <button className="modal-close" id="pmClose" aria-label="Close" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body">
            <div className="detail-grid" id="pmGrid">
              {modalError ? (
                <div className="full"><div className="dv">{modalError}</div></div>
              ) : detail ? (
                <>
                  <div><div className="dl">Aarogyam ID</div><div className="dv"><span className="mono">{detail.aarogyamId}</span></div></div>
                  <div><div className="dl">Date of birth</div><div className="dv">{formatDate(detail.dateOfBirth)}</div></div>
                  <div><div className="dl">Gender</div><div className="dv">{detail.gender}</div></div>
                  <div><div className="dl">Blood group</div><div className="dv">{detail.bloodGroup || "—"}</div></div>
                  <div><div className="dl">Emergency contact</div><div className="dv">{detail.emergencyContact || "—"}</div></div>
                  <div><div className="dl">Registered</div><div className="dv">{formatDate(detail.createdAt)}</div></div>
                  <div className="full"><div className="dl">Address</div><div className="dv">{addressLine || "—"}</div></div>
                </>
              ) : null}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost btn-sm" id="pmCloseBtn" type="button" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}
