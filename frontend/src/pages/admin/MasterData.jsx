import { useEffect, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI } from "../../lib/adminApi.js";
import { formatDate } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

const ENTITIES = AdminAPI.masterEntities;

function entityByKey(key) {
  return ENTITIES.find((e) => e.key === key);
}

function cellValue(cache, row, col) {
  const raw = row[col.field];
  if (col.type === "date") return formatDate(raw);
  if (col.type === "bool") return raw ? <span className="badge ok">Yes</span> : <span className="badge bad">No</span>;
  if (col.type === "lookup") {
    const refRows = cache[col.lookup] || [];
    const match = refRows.find((r) => r[col.lookupId] === raw);
    return match ? match[col.lookupName] : "#" + raw;
  }
  return raw === null || raw === undefined ? "—" : String(raw);
}

function buildInitialValues(entity, existingRow) {
  const values = {};
  entity.fields.forEach((f) => {
    if (f.type === "checkbox") {
      values[f.name] = existingRow ? !!existingRow[f.name] : true;
    } else if (f.type === "select") {
      values[f.name] = existingRow && existingRow[f.name] != null ? String(existingRow[f.name]) : "";
    } else {
      values[f.name] = existingRow && existingRow[f.name] != null ? existingRow[f.name] : "";
    }
  });
  return values;
}

export default function MasterData() {
  useDocumentTitle("Master data · Aarogyam Admin");
  const showToast = useToast();

  const [activeKey, setActiveKey] = useState(ENTITIES[0].key);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formAlert, setFormAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const activeEntity = entityByKey(activeKey);

  function loadAllCaches() {
    return Promise.all(ENTITIES.map((e) => AdminAPI.master(e.key).list())).then((results) => {
      const next = {};
      ENTITIES.forEach((e, i) => (next[e.key] = results[i]));
      setCache(next);
    });
  }

  useEffect(() => {
    setLoading(true);
    loadAllCaches()
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function selectEntity(key) {
    setActiveKey(key);
    setFilterValue("");
    setSearch("");
  }

  const rows = (cache[activeKey] || []).filter((r) => {
    if (activeEntity.filterBy && filterValue) {
      if (String(r[activeEntity.filterBy.param]) !== String(filterValue)) return false;
    }
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return activeEntity.columns.some((c) => String(r[c.field] || "").toLowerCase().includes(term));
  });

  function openForm(id) {
    const existingRow = id ? (cache[activeKey] || []).find((r) => r[activeEntity.idField] === id) : null;
    setEditingId(id || null);
    setFormValues(buildInitialValues(activeEntity, existingRow));
    setFormAlert(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  function setFieldValue(name, value) {
    setFormValues((v) => ({ ...v, [name]: value }));
  }

  async function saveForm() {
    const missing = activeEntity.fields.filter((f) => f.required && !formValues[f.name]);
    if (missing.length) {
      setFormAlert("Please fill in: " + missing.map((f) => f.label).join(", "));
      return;
    }

    const payload = {};
    activeEntity.fields.forEach((f) => {
      if (f.type === "checkbox") {
        payload[f.name] = !!formValues[f.name];
      } else if (f.type === "select") {
        payload[f.name] = formValues[f.name] ? Number(formValues[f.name]) : null;
      } else {
        payload[f.name] = String(formValues[f.name] || "").trim();
      }
    });

    const client = AdminAPI.master(activeEntity.key);
    const label = activeEntity.label.replace(/s$/, "");
    setSaving(true);
    setFormAlert(null);
    try {
      if (editingId) await client.update(editingId, payload);
      else await client.create(payload);
      showToast(label + (editingId ? " updated." : " created."));
      closeForm();
      await loadAllCaches();
    } catch (err) {
      setFormAlert((err.data && err.data.message) || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id) {
    const label = activeEntity.label.replace(/s$/, "");
    if (!window.confirm("Delete this " + label.toLowerCase() + "? This cannot be undone.")) return;
    try {
      await AdminAPI.master(activeEntity.key).remove(id);
      showToast(label + " deleted.");
      await loadAllCaches();
    } catch (err) {
      showToast((err.data && err.data.message) || err.message, true);
    }
  }

  function renderFieldControl(field) {
    const value = formValues[field.name];
    const reqMark = field.required ? <span className="req">*</span> : null;

    if (field.type === "checkbox") {
      return (
        <div className="form-row check" key={field.name}>
          <input type="checkbox" id={"f_" + field.name} checked={!!value} onChange={(e) => setFieldValue(field.name, e.target.checked)} />
          <label htmlFor={"f_" + field.name}>{field.label}{reqMark}</label>
        </div>
      );
    }

    if (field.type === "select") {
      const options = cache[field.entity] || [];
      return (
        <div className="form-row" key={field.name}>
          <label htmlFor={"f_" + field.name}>{field.label}{reqMark}</label>
          <select id={"f_" + field.name} value={value || ""} onChange={(e) => setFieldValue(field.name, e.target.value)}>
            <option value="">Select…</option>
            {options.map((r) => (
              <option key={r[field.idField]} value={r[field.idField]}>{r[field.nameField]}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="form-row" key={field.name}>
        <label htmlFor={"f_" + field.name}>{field.label}{reqMark}</label>
        <input
          type="text"
          id={"f_" + field.name}
          value={value || ""}
          maxLength={field.maxLength || undefined}
          onChange={(e) => setFieldValue(field.name, e.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>Reference data</h2>
          <p>Lookup tables used across registration, addresses and clinical records.</p>
        </div>
      </div>

      <div className="entity-tabs" id="entityTabs">
        {ENTITIES.map((e) => (
          <button key={e.key} className={e.key === activeKey ? "active" : ""} onClick={() => selectEntity(e.key)}>{e.label}</button>
        ))}
      </div>

      <div className="toolbar">
        {activeEntity.filterBy ? (
          <select id="filterBySelect" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
            <option value="">All {activeEntity.filterBy.label.toLowerCase()}s</option>
            {(cache[activeEntity.filterBy.entity] || []).map((r) => (
              <option key={r[activeEntity.filterBy.idField]} value={r[activeEntity.filterBy.idField]}>{r[activeEntity.filterBy.nameField]}</option>
            ))}
          </select>
        ) : null}
        <input type="search" id="rowSearch" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="spacer"></div>
        <button className="btn btn-solid btn-sm" id="addBtn" type="button" onClick={() => openForm(null)}>Add new</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead id="tableHead">
            <tr>
              {activeEntity.columns.map((c) => (
                <th key={c.field}>{c.label}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {loading ? (
              <tr><td colSpan={activeEntity.columns.length + 1} className="table-loading">Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={activeEntity.columns.length + 1} className="table-empty">{loadError}</td></tr>
            ) : !rows.length ? (
              <tr><td colSpan={activeEntity.columns.length + 1} className="table-empty">No records.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row[activeEntity.idField]}>
                  {activeEntity.columns.map((c) => (
                    <td key={c.field}>{cellValue(cache, row, c)}</td>
                  ))}
                  <td className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openForm(row[activeEntity.idField])}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteRow(row[activeEntity.idField])}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-overlay" id="formModal" hidden={!formOpen} onClick={(e) => { if (e.target.id === "formModal") closeForm(); }}>
        <div className="modal">
          <div className="modal-head">
            <h3 id="formTitle">{(editingId ? "Edit " : "Add ") + activeEntity.label.replace(/s$/, "")}</h3>
            <button className="modal-close" id="formClose" aria-label="Close" onClick={closeForm}>✕</button>
          </div>
          {formAlert ? <div id="formAlert" className="form-alert error">{formAlert}</div> : null}
          <form id="entityForm" onSubmit={(e) => e.preventDefault()}>
            {activeEntity.fields.map((f) => renderFieldControl(f))}
          </form>
          <div className="modal-actions">
            <button className="btn btn-ghost btn-sm" id="formCancel" type="button" onClick={closeForm}>Cancel</button>
            <button className="btn btn-solid btn-sm" id="formSave" type="button" disabled={saving} onClick={saveForm}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
