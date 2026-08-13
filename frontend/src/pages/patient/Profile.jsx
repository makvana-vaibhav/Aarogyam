import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { PatientAPI } from "../../lib/patientApi.js";
import { formatDate } from "../../lib/format.js";
import { useLocationCascade } from "../../lib/useLocationCascade.js";
import PasswordField from "../../components/PasswordField.jsx";
import { useHealthCard } from "../../lib/useHealthCard.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Profile() {
  useDocumentTitle("Profile · Aarogyam Patient");
  const { refreshProfile } = useOutletContext();
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const location = useLocationCascade(PatientAPI, profile);
  const { qrUrl, downloadCard, joinName } = useHealthCard(profile);

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
          <div>
            <div className="card-title">Personal information</div>
            <div className="card-sub">Aarogyam ID <span className="mono" id="aarogyamIdValue">{profile ? profile.aarogyamId : "—"}</span></div>
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
                <div className="full"><div className="dl">Address</div><div className="dv">{profile.address || "Not added"}</div></div>
                <div><div className="dl">Emergency contact</div><div className="dv">{profile.emergencyContact || "Not added"}</div></div>
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
                <select id="countryId" required value={location.countryId} onChange={(e) => location.setCountryId(e.target.value)}>
                  <option value="">{location.countriesFailed ? "Failed to load" : "Select country"}</option>
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
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="cityId">City<span className="req">*</span></label>
                <select id="cityId" required value={location.cityId} onChange={(e) => location.setCityId(e.target.value)}>
                  <option value="">{location.citiesLoading ? "Loading…" : "Select city"}</option>
                  {location.cities.map((c) => (
                    <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
                  ))}
                </select>
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
    </div>
  );
}
