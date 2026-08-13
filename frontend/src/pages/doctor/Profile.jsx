import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI } from "../../lib/doctorApi.js";
import { useLocationCascade } from "../../lib/useLocationCascade.js";
import PasswordField from "../../components/PasswordField.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

function nameById(list, idField, nameField, id) {
  const item = list.find((row) => row[idField] === id);
  return item ? item[nameField] : "—";
}

export default function Profile() {
  useDocumentTitle("Profile · Aarogyam Doctor");
  const { refreshProfile } = useOutletContext();
  const showToast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const location = useLocationCascade(DoctorAPI, doctor);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [address, setAddress] = useState("");
  const [profileAlert, setProfileAlert] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  function populateForm(data) {
    setFirstName(data.firstName || "");
    setMiddleName(data.middleName || "");
    setLastName(data.lastName || "");
    setHospitalId(data.hospitalId != null ? String(data.hospitalId) : "");
    setSpecializationId(data.specializationId != null ? String(data.specializationId) : "");
    setAddress(data.address || "");
  }

  useEffect(() => {
    DoctorAPI.profile()
      .then((doctorData) => {
        setDoctor(doctorData);
        populateForm(doctorData);
        return Promise.all([
          DoctorAPI.hospitals(),
          doctorData?.degreeId ? DoctorAPI.specializations(doctorData.degreeId) : DoctorAPI.specializations()
        ]);
      })
      .then(([hospitalRows, specializationRows]) => {
        setHospitals(hospitalRows || []);
        setSpecializations(specializationRows || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  function handleCancelEdit() {
    if (doctor) populateForm(doctor);
    location.resetToInitial();
    setEditing(false);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileAlert(null);
    const payload = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || null,
      lastName: lastName.trim(),
      hospitalId: Number(hospitalId),
      specializationId: Number(specializationId),
      address: address.trim(),
      countryId: Number(location.countryId),
      stateId: Number(location.stateId),
      cityId: Number(location.cityId)
    };
    setSavingProfile(true);
    try {
      await DoctorAPI.updateProfile(payload);
      showToast("Profile updated successfully.");
      const updated = await DoctorAPI.profile();
      setDoctor(updated);
      setEditing(false);
      refreshProfile();
    } catch (err) {
      setProfileAlert(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordAlert(null);
    setSavingPassword(true);
    try {
      await DoctorAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password updated successfully.");
    } catch (err) {
      setPasswordAlert(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>Profile &amp; settings</h2>
          <p>Your practice details and account security.</p>
        </div>
      </div>
      {error ? <div className="form-alert error">{error}</div> : null}

      <div className="card">
        <div className="page-head-row section-head">
          <div>
            <div className="card-title">Practice information</div>
            <div className="card-sub">License <span className="mono" id="licenseValue">{doctor ? doctor.licenseNumber : "—"}</span></div>
          </div>
          {!editing ? (
            <button className="btn btn-ghost btn-sm" id="editProfileBtn" type="button" onClick={() => setEditing(true)}>Edit details</button>
          ) : null}
        </div>

        {!editing ? (
          <div id="profileView" className="detail-grid compact-top">
            {!doctor ? (
              <div className="table-loading">Loading profile…</div>
            ) : (
              <>
                <div><div className="dl">Name</div><div className="dv">{"Dr. " + joinName(doctor)}</div></div>
                <div><div className="dl">Hospital</div><div className="dv">{nameById(hospitals, "hospitalId", "hospitalName", doctor.hospitalId)}</div></div>
                <div><div className="dl">Specialization</div><div className="dv">{nameById(specializations, "specializationId", "specializationName", doctor.specializationId)}</div></div>
                <div><div className="dl">Approval status</div><div className="dv">{doctor.approvalStatus}</div></div>
                <div className="full"><div className="dl">Address</div><div className="dv">{doctor.address}</div></div>
              </>
            )}
          </div>
        ) : (
          <form id="profileForm" className="section-space" noValidate onSubmit={handleProfileSubmit}>
            {profileAlert ? <div className="form-alert error">{profileAlert}</div> : null}
            <div className="form-row-2col">
              <div className="form-row"><label htmlFor="firstName">First name<span className="req">*</span></label><input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div className="form-row"><label htmlFor="middleName">Middle name</label><input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} /></div>
            </div>
            <div className="form-row"><label htmlFor="lastName">Last name<span className="req">*</span></label><input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="hospitalId">Hospital<span className="req">*</span></label>
                <select id="hospitalId" required value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
                  {hospitals.map((item) => (
                    <option key={item.hospitalId} value={item.hospitalId}>{item.hospitalName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="specializationId">Specialization<span className="req">*</span></label>
                <select id="specializationId" required value={specializationId} onChange={(e) => setSpecializationId(e.target.value)}>
                  {specializations.map((item) => (
                    <option key={item.specializationId} value={item.specializationId}>{item.specializationName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row"><label htmlFor="address">Address<span className="req">*</span></label><textarea id="address" required value={address} onChange={(e) => setAddress(e.target.value)}></textarea></div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="countryId">Country<span className="req">*</span></label>
                <select id="countryId" required value={location.countryId} onChange={(e) => location.setCountryId(e.target.value)}>
                  {location.countries.map((c) => (
                    <option key={c.countryId} value={c.countryId}>{c.countryName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="stateId">State<span className="req">*</span></label>
                <select id="stateId" required value={location.stateId} onChange={(e) => location.setStateId(e.target.value)}>
                  <option value="">{location.statesLoading ? "Loading…" : "Select state"}</option>
                  {location.states.map((s) => (
                    <option key={s.stateId} value={s.stateId}>{s.stateName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="cityId">City<span className="req">*</span></label>
              <select id="cityId" required value={location.cityId} onChange={(e) => location.setCityId(e.target.value)}>
                <option value="">{location.citiesLoading ? "Loading…" : "Select city"}</option>
                {location.cities.map((c) => (
                  <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
              <button className="btn btn-solid" type="submit" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save changes"}</button>
              <button className="btn btn-ghost" id="cancelEditBtn" type="button" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card section-space">
        <div className="card-title">Change password</div>
        <div className="card-sub">Update your password securely.</div>
        {passwordAlert ? <div className="form-alert error">{passwordAlert}</div> : null}
        <form id="passwordForm" noValidate onSubmit={handlePasswordSubmit}>
          <div className="form-row"><label htmlFor="currentPassword">Current password<span className="req">*</span></label><PasswordField id="currentPassword" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div className="form-row"><label htmlFor="newPassword">New password<span className="req">*</span></label><PasswordField id="newPassword" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <button className="btn btn-solid" type="submit" disabled={savingPassword}>{savingPassword ? "Updating…" : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}
