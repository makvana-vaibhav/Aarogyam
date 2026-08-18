import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { PatientAPI } from "../../lib/patientApi.js";
import { formatDate } from "../../lib/format.js";
import { useLocationCascade } from "../../lib/useLocationCascade.js";
import PasswordField from "../../components/PasswordField.jsx";
import SearchableSelect from "../../components/SearchableSelect.jsx";
import { useHealthCard } from "../../lib/useHealthCard.js";
import { useProfilePicture } from "../../lib/useProfilePicture.js";
import { initials as formatInitials } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";
const PHOTO_EXT_RE = /\.(jpe?g|png|webp)$/i;

export default function Profile() {
  useDocumentTitle("Profile · Aarogyam Patient");
  const { refreshProfile, confirmLogout } = useOutletContext();
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const location = useLocationCascade(PatientAPI, profile);
  const { qrUrl, downloadCard, joinName } = useHealthCard(profile);
  const pictureUrl = useProfilePicture(PatientAPI.profilePicture, profile);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoAlert, setPhotoAlert] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
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
    setDateOfBirth(data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "");
    setGender(data.gender || "");
    setBloodGroup(data.bloodGroup || "");
    setAddress(data.address || "");
    setEmergencyContact(data.emergencyContact || "");
  }

  useEffect(() => {
    PatientAPI.profile()
      .then((data) => {
        setProfile(data);
        populateForm(data);
      })
      .catch((err) => setError(err.message));
  }, []);


  function handleCancelEdit() {
    if (profile) populateForm(profile);
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
      await PatientAPI.updateProfilePicture(formData);
      const updated = await PatientAPI.profile();
      setProfile(updated);
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

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateOfBirth > todayStr) {
      setProfileAlert("Date of birth cannot be in the future.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || null,
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      bloodGroup: bloodGroup.trim() || null,
      address: address.trim(),
      countryId: Number(location.countryId),
      stateId: Number(location.stateId),
      cityId: Number(location.cityId),
      emergencyContact: emergencyContact.trim() || null
    };
    setSavingProfile(true);
    try {
      await PatientAPI.updateProfile(payload);
      showToast("Profile updated successfully.");
      const updated = await PatientAPI.profile();
      setProfile(updated);
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
      await PatientAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password updated successfully.");
    } catch (err) {
      setPasswordAlert(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDownloadCard() {
    try {
      await downloadCard();
    } catch (err) {
      showToast("Could not generate the health card image.", true);
    }
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>Profile &amp; settings</h2>
          <p>Your details, Aarogyam health card and account security.</p>
        </div>
      </div>
      {error ? <div className="form-alert error">{error}</div> : null}

      <div className="card">
        <div className="page-head-row section-head">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {pictureUrl ? (
              <img className="avatar-circle" src={pictureUrl} alt="" />
            ) : (
              <span className="avatar-circle">{profile ? formatInitials(profile.firstName, profile.lastName) : "P"}</span>
            )}
            <div>
              <div className="card-title">Personal information</div>
              <div className="card-sub">Aarogyam ID <span className="mono" id="aarogyamIdValue">{profile ? profile.aarogyamId : "—"}</span></div>
            </div>
          </div>
          {!editing ? (
            <button className="btn btn-ghost btn-sm" id="editProfileBtn" type="button" onClick={() => setEditing(true)}>Edit details</button>
          ) : null}
        </div>

        {!editing ? (
          <div id="profileView" className="detail-grid compact-top">
            {!profile ? (
              <div className="table-loading">Loading profile…</div>
            ) : (
              <>
                <div><div className="dl">Name</div><div className="dv">{joinName(profile)}</div></div>
                <div><div className="dl">Date of birth</div><div className="dv">{formatDate(profile.dateOfBirth)}</div></div>
                <div><div className="dl">Gender</div><div className="dv">{profile.gender || "Not set"}</div></div>
                <div><div className="dl">Blood group</div><div className="dv">{profile.bloodGroup || "Not set"}</div></div>
                <div><div className="dl">Phone number</div><div className="dv">{profile.phoneNumber || "Not added"}</div></div>
                <div className="full"><div className="dl">Address</div><div className="dv">{profile.address || "Not added"}</div></div>
                <div><div className="dl">Emergency contact</div><div className="dv">{profile.emergencyContact || "Not added"}</div></div>
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
                  <span className="avatar-circle">{profile ? formatInitials(profile.firstName, profile.lastName) : "P"}</span>
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
            <div className="form-row-2col">
              <div className="form-row"><label htmlFor="lastName">Last name<span className="req">*</span></label><input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
              <div className="form-row"><label htmlFor="dateOfBirth">Date of birth<span className="req">*</span></label><input id="dateOfBirth" type="date" required max={new Date().toISOString().split("T")[0]} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="gender">Gender<span className="req">*</span></label>
                <select id="gender" required value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-row"><label htmlFor="bloodGroup">Blood group</label><input id="bloodGroup" placeholder="O+" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} /></div>
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
                  placeholder={location.countriesFailed ? "Failed to load" : "Select country"}
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
            <div className="form-row-2col">
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
              <div className="form-row"><label htmlFor="emergencyContact">Emergency contact</label><input id="emergencyContact" placeholder="+91..." value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} /></div>
            </div>
            <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
              <button className="btn btn-solid" type="submit" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save changes"}</button>
              <button className="btn btn-ghost" id="cancelEditBtn" type="button" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="grid-2 grid-2-equal section-space">
        <div className="card">
          <div className="card-title">Aarogyam health card</div>
          <div className="card-sub">Show this QR at any registered facility.</div>
          <div className="health-card health-card-wide">
            <div className="hc-head"><b>AAROGYAM · HEALTH IDENTITY</b></div>
            <div className="hc-body">
              <div className="hc-info" id="healthCardInfo">
                {profile ? (
                  <>
                    <div className="cap">Patient</div>
                    <div className="card-title">{joinName(profile)}</div>
                    <div className="card-sub">Aarogyam ID {profile.aarogyamId}</div>
                    <div className="cap card-cap-spaced">Blood group</div>
                    <div>{profile.bloodGroup || "Not set"}</div>
                    <div className="cap card-cap-spaced">Mobile number</div>
                    <div>{profile.phoneNumber || "Not added"}</div>
                    <div className="cap card-cap-spaced">Emergency contact</div>
                    <div>{profile.emergencyContact || "Not added"}</div>
                  </>
                ) : null}
              </div>
              <div className="hc-qr"><img id="healthCardQr" alt="Patient health card QR code" src={qrUrl || undefined} /></div>
            </div>
          </div>
          <div className="qa-row"><button className="btn btn-ghost btn-sm" id="downloadCardBtn" type="button" onClick={handleDownloadCard}>Download full card</button></div>
        </div>
        <div className="card">
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

      <div className="card section-space">
        <div className="card-title">Account</div>
        <div className="card-sub">Sign out of Aarogyam on this device.</div>
        <div className="qa-row"><button className="btn btn-danger btn-sm" type="button" onClick={confirmLogout}>Log out</button></div>
      </div>
    </div>
  );
}
