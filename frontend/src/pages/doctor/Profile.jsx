import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI } from "../../lib/doctorApi.js";
import { useLocationCascade } from "../../lib/useLocationCascade.js";
import PasswordField from "../../components/PasswordField.jsx";
import SearchableSelect from "../../components/SearchableSelect.jsx";
import { useProfilePicture } from "../../lib/useProfilePicture.js";
import { initials as formatInitials } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";
const PHOTO_EXT_RE = /\.(jpe?g|png|webp)$/i;

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

function nameById(list, idField, nameField, id) {
  const item = list.find((row) => row[idField] === id);
  return item ? item[nameField] : "—";
}

export default function Profile() {
  useDocumentTitle("Profile · Aarogyam Doctor");
  const { refreshProfile, confirmLogout } = useOutletContext();
  const showToast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const location = useLocationCascade(DoctorAPI, doctor);
  const pictureUrl = useProfilePicture(DoctorAPI.profilePicture, doctor);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoAlert, setPhotoAlert] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

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
    clearPhotoSelection();
  }

  function clearPhotoSelection() {
    setPhotoFile(null);
    setPhotoAlert(null);
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setPhotoAlert(null);
    if (!PHOTO_EXT_RE.test(file.name)) {
      setPhotoAlert("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoAlert("Image must be under 3MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  async function handlePhotoUpload() {
    if (!photoFile) return;
    setPhotoAlert(null);
    setSavingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("File", photoFile);
      await DoctorAPI.updateProfilePicture(formData);
      const updated = await DoctorAPI.profile();
      setDoctor(updated);
      refreshProfile();
      clearPhotoSelection();
      showToast("Profile photo updated.");
    } catch (err) {
      setPhotoAlert(err.message);
    } finally {
      setSavingPhoto(false);
    }
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
    if (newPassword === currentPassword) {
      setPasswordAlert("New password must be different from your current password.");
      return;
    }
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {pictureUrl ? (
              <img className="avatar-circle" src={pictureUrl} alt="" />
            ) : (
              <span className="avatar-circle">{doctor ? formatInitials(doctor.firstName, doctor.lastName) : "D"}</span>
            )}
            <div>
              <div className="card-title">Practice information</div>
              <div className="card-sub">License <span className="mono" id="licenseValue">{doctor ? doctor.licenseNumber : "—"}</span></div>
            </div>
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
            <div className="form-row" id="rowProfilePhoto">
              <label htmlFor="profilePhotoInput">Profile photo</label>
              {photoAlert ? <div className="form-alert error">{photoAlert}</div> : null}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {photoPreview ? (
                  <img className="avatar-circle" src={photoPreview} alt="" />
                ) : pictureUrl ? (
                  <img className="avatar-circle" src={pictureUrl} alt="" />
                ) : (
                  <span className="avatar-circle">{doctor ? formatInitials(doctor.firstName, doctor.lastName) : "D"}</span>
                )}
                <input id="profilePhotoInput" type="file" accept={PHOTO_ACCEPT} onChange={handlePhotoSelect} />
                {photoFile ? (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={savingPhoto} onClick={handlePhotoUpload}>
                    {savingPhoto ? "Uploading…" : "Change photo"}
                  </button>
                ) : null}
              </div>
              <span className="hint">JPG, PNG or WEBP, up to 3MB.</span>
            </div>
            <div className="form-row-2col">
              <div className="form-row"><label htmlFor="firstName">First name<span className="req">*</span></label><input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div className="form-row"><label htmlFor="middleName">Middle name (optional)</label><input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} /></div>
            </div>
            <div className="form-row"><label htmlFor="lastName">Last name<span className="req">*</span></label><input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="hospitalId">Hospital<span className="req">*</span></label>
                <SearchableSelect
                  id="hospitalId"
                  value={hospitalId}
                  onChange={setHospitalId}
                  options={hospitals.map((item) => ({ value: item.hospitalId, label: item.hospitalName }))}
                  placeholder={hospitals.length ? "Select hospital" : "Loading…"}
                  clearable={false}
                />
              </div>
              <div className="form-row">
                <label htmlFor="specializationId">Specialization<span className="req">*</span></label>
                <SearchableSelect
                  id="specializationId"
                  value={specializationId}
                  onChange={setSpecializationId}
                  options={specializations.map((item) => ({ value: item.specializationId, label: item.specializationName }))}
                  placeholder={specializations.length ? "Select specialization" : "Loading…"}
                  clearable={false}
                />
              </div>
            </div>
            <div className="form-row"><label htmlFor="address">Address<span className="req">*</span></label><textarea id="address" required value={address} onChange={(e) => setAddress(e.target.value)}></textarea></div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="countryId">Country<span className="req">*</span></label>
                <SearchableSelect
                  id="countryId"
                  value={location.countryId}
                  onChange={location.setCountryId}
                  options={location.countries.map((c) => ({ value: c.countryId, label: c.countryName }))}
                  placeholder={location.countries.length ? "Select country" : "Loading…"}
                  clearable={false}
                />
              </div>
              <div className="form-row">
                <label htmlFor="stateId">State<span className="req">*</span></label>
                <SearchableSelect
                  id="stateId"
                  value={location.stateId}
                  onChange={location.setStateId}
                  options={location.states.map((s) => ({ value: s.stateId, label: s.stateName }))}
                  placeholder={location.statesLoading ? "Loading…" : "Select state"}
                />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="cityId">City<span className="req">*</span></label>
              <SearchableSelect
                id="cityId"
                value={location.cityId}
                onChange={location.setCityId}
                options={location.cities.map((c) => ({ value: c.cityId, label: c.cityName }))}
                placeholder={location.citiesLoading ? "Loading…" : "Select city"}
              />
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

      <div className="card section-space">
        <div className="card-title">Account</div>
        <div className="card-sub">Sign out of Aarogyam on this device.</div>
        <div className="qa-row"><button className="btn btn-danger btn-sm" type="button" onClick={confirmLogout}>Log out</button></div>
      </div>
    </div>
  );
}
