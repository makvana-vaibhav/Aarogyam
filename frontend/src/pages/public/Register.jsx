import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AarogyamAuth, isLoggedIn, getDashboardHref } from "../../lib/publicAuth.js";
import { useLocationCascade } from "../../lib/useLocationCascade.js";

function LocationFields({ idPrefix, cascade }) {
  return (
    <>
      <div className="form-row-2col">
        <div className="form-row">
          <label htmlFor={idPrefix + "-country"}>Country<span className="req">*</span></label>
          <select
            id={idPrefix + "-country"}
            required
            value={cascade.countryId}
            onChange={(e) => cascade.setCountryId(e.target.value)}
          >
            <option value="">{cascade.countriesFailed ? "Failed to load — refresh the page" : "Select country"}</option>
            {cascade.countries.map((c) => (
              <option key={c.countryId} value={c.countryId}>{c.countryName}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor={idPrefix + "-state"}>State<span className="req">*</span></label>
          <select
            id={idPrefix + "-state"}
            required
            disabled={!cascade.countryId}
            value={cascade.stateId}
            onChange={(e) => cascade.setStateId(e.target.value)}
          >
            <option value="">
              {!cascade.countryId ? "Select country first" : cascade.statesLoading ? "Loading…" : cascade.statesFailed ? "Failed to load" : "Select state"}
            </option>
            {cascade.states.map((s) => (
              <option key={s.stateId} value={s.stateId}>{s.stateName}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label htmlFor={idPrefix + "-city"}>City<span className="req">*</span></label>
        <select
          id={idPrefix + "-city"}
          required
          disabled={!cascade.stateId}
          value={cascade.cityId}
          onChange={(e) => cascade.setCityId(e.target.value)}
        >
          <option value="">
            {!cascade.stateId ? "Select state first" : cascade.citiesLoading ? "Loading…" : cascade.citiesFailed ? "Failed to load" : "Select city"}
          </option>
          {cascade.cities.map((c) => (
            <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export default function Register() {
  useDocumentTitle("Register — Aarogyam");

  const [role, setRole] = useState("patient");
  const [alert, setAlert] = useState(null);

  const patientLocation = useLocationCascade(AarogyamAuth);
  const doctorLocation = useLocationCascade(AarogyamAuth);

  const [hospitals, setHospitals] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (isLoggedIn()) {
      window.location.href = getDashboardHref();
    }
  }, []);

  useEffect(() => {
    AarogyamAuth.hospitals().then(setHospitals).catch(() => setHospitals(null));
    AarogyamAuth.degrees().then(setDegrees).catch(() => setDegrees(null));
    AarogyamAuth.specializations().then(setSpecializations).catch(() => setSpecializations(null));
  }, []);

  // ---- patient form state ----
  const [pFirstName, setPFirstName] = useState("");
  const [pLastName, setPLastName] = useState("");
  const [pMiddleName, setPMiddleName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [pDob, setPDob] = useState("");
  const [pGender, setPGender] = useState("");
  const [pBloodGroup, setPBloodGroup] = useState("");
  const [pAddress, setPAddress] = useState("");
  const [pEmergency, setPEmergency] = useState("");
  const [patientSubmitting, setPatientSubmitting] = useState(false);

  // ---- doctor form state ----
  const [dFirstName, setDFirstName] = useState("");
  const [dLastName, setDLastName] = useState("");
  const [dMiddleName, setDMiddleName] = useState("");
  const [dEmail, setDEmail] = useState("");
  const [dPhone, setDPhone] = useState("");
  const [dPassword, setDPassword] = useState("");
  const [dLicense, setDLicense] = useState("");
  const [dHospital, setDHospital] = useState("");
  const [dDegree, setDDegree] = useState("");
  const [dSpecialization, setDSpecialization] = useState("");
  const [dLicenseDoc, setDLicenseDoc] = useState("");
  const [dDegreeDoc, setDDegreeDoc] = useState("");
  const [dAddress, setDAddress] = useState("");
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);

  function selectTab(nextRole) {
    setRole(nextRole);
    setAlert(null);
  }

  function goToVerify(userId, email) {
    window.location.href = "/verify-otp?userId=" + userId + "&email=" + encodeURIComponent(email);
  }

  async function handlePatientSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setPatientSubmitting(true);
    const email = pEmail.trim();
    const payload = {
      email,
      phoneNumber: pPhone.trim(),
      password: pPassword.trim(),
      firstName: pFirstName.trim(),
      middleName: pMiddleName.trim() || null,
      lastName: pLastName.trim(),
      dateOfBirth: pDob,
      gender: pGender,
      bloodGroup: pBloodGroup || null,
      address: pAddress.trim(),
      countryId: Number(patientLocation.countryId),
      stateId: Number(patientLocation.stateId),
      cityId: Number(patientLocation.cityId),
      emergencyContact: pEmergency.trim() || null
    };
    try {
      const result = await AarogyamAuth.registerPatient(payload);
      goToVerify(result.userId, email);
    } catch (err) {
      setAlert(err.message);
    } finally {
      setPatientSubmitting(false);
    }
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setDoctorSubmitting(true);
    const email = dEmail.trim();
    const payload = {
      email,
      phoneNumber: dPhone.trim(),
      password: dPassword.trim(),
      firstName: dFirstName.trim(),
      middleName: dMiddleName.trim(),
      lastName: dLastName.trim(),
      licenseNumber: dLicense.trim(),
      hospitalId: Number(dHospital),
      degreeId: Number(dDegree),
      specializationId: Number(dSpecialization),
      licenseDocumentPath: dLicenseDoc.trim(),
      degreeDocumentPath: dDegreeDoc.trim(),
      address: dAddress.trim(),
      countryId: Number(doctorLocation.countryId),
      stateId: Number(doctorLocation.stateId),
      cityId: Number(doctorLocation.cityId)
    };
    try {
      const result = await AarogyamAuth.registerDoctor(payload);
      goToVerify(result.userId, email);
    } catch (err) {
      setAlert(err.message);
    } finally {
      setDoctorSubmitting(false);
    }
  }

  return (
    <section className="auth-section wide">
      <div className="wrap">
        <div className="auth-head">
          <span className="eyebrow">Get started</span>
          <h1>Create your Aarogyam account</h1>
          <p className="lede">Registration takes about two minutes. An OTP is emailed to you to confirm it's really you.</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button type="button" className={"tab-btn" + (role === "patient" ? " active" : "")} data-role="patient" role="tab" aria-selected={role === "patient"} onClick={() => selectTab("patient")}>Patient</button>
            <button type="button" className={"tab-btn" + (role === "doctor" ? " active" : "")} data-role="doctor" role="tab" aria-selected={role === "doctor"} onClick={() => selectTab("doctor")}>Doctor</button>
          </div>

          {alert ? <div className="form-alert error">{alert}</div> : null}

          {/* ============ PATIENT FORM ============ */}
          <form id="patientForm" noValidate hidden={role !== "patient"} onSubmit={handlePatientSubmit}>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="p-firstName">First name<span className="req">*</span></label>
                <input id="p-firstName" required maxLength={50} value={pFirstName} onChange={(e) => setPFirstName(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="p-lastName">Last name<span className="req">*</span></label>
                <input id="p-lastName" required maxLength={50} value={pLastName} onChange={(e) => setPLastName(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="p-middleName">Middle name (optional)</label>
              <input id="p-middleName" maxLength={50} value={pMiddleName} onChange={(e) => setPMiddleName(e.target.value)} />
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="p-email">Email<span className="req">*</span></label>
                <input id="p-email" type="email" required maxLength={100} value={pEmail} onChange={(e) => setPEmail(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="p-phone">Phone number<span className="req">*</span></label>
                <input id="p-phone" required maxLength={20} value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="p-password">Password<span className="req">*</span></label>
              <input id="p-password" type="password" required minLength={6} maxLength={200} value={pPassword} onChange={(e) => setPPassword(e.target.value)} />
              <span className="hint">At least 6 characters.</span>
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="p-dob">Date of birth<span className="req">*</span></label>
                <input id="p-dob" type="date" required value={pDob} onChange={(e) => setPDob(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="p-gender">Gender<span className="req">*</span></label>
                <select id="p-gender" required value={pGender} onChange={(e) => setPGender(e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="p-bloodGroup">Blood group (optional)</label>
                <select id="p-bloodGroup" value={pBloodGroup} onChange={(e) => setPBloodGroup(e.target.value)}>
                  <option value="">Unknown</option>
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option>
                  <option>O+</option><option>O-</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="p-emergency">Emergency contact (optional)</label>
                <input id="p-emergency" maxLength={20} value={pEmergency} onChange={(e) => setPEmergency(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="p-address">Address<span className="req">*</span></label>
              <input id="p-address" required maxLength={200} value={pAddress} onChange={(e) => setPAddress(e.target.value)} />
            </div>
            <LocationFields idPrefix="p" cascade={patientLocation} />
            <button id="patientSubmit" className="btn btn-solid btn-block" type="submit" disabled={patientSubmitting}>
              {patientSubmitting ? "Creating account…" : "Create patient account"}
            </button>
          </form>

          {/* ============ DOCTOR FORM ============ */}
          <form id="doctorForm" noValidate hidden={role !== "doctor"} onSubmit={handleDoctorSubmit}>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="d-firstName">First name<span className="req">*</span></label>
                <input id="d-firstName" required maxLength={50} value={dFirstName} onChange={(e) => setDFirstName(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="d-lastName">Last name<span className="req">*</span></label>
                <input id="d-lastName" required maxLength={50} value={dLastName} onChange={(e) => setDLastName(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="d-middleName">Middle name</label>
              <input id="d-middleName" maxLength={50} value={dMiddleName} onChange={(e) => setDMiddleName(e.target.value)} />
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="d-email">Email<span className="req">*</span></label>
                <input id="d-email" type="email" required maxLength={100} value={dEmail} onChange={(e) => setDEmail(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="d-phone">Phone number<span className="req">*</span></label>
                <input id="d-phone" required maxLength={20} value={dPhone} onChange={(e) => setDPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="d-password">Password<span className="req">*</span></label>
              <input id="d-password" type="password" required minLength={6} maxLength={200} value={dPassword} onChange={(e) => setDPassword(e.target.value)} />
              <span className="hint">At least 6 characters.</span>
            </div>
            <div className="form-row">
              <label htmlFor="d-license">Licence number<span className="req">*</span></label>
              <input id="d-license" required maxLength={50} value={dLicense} onChange={(e) => setDLicense(e.target.value)} />
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="d-hospital">Hospital<span className="req">*</span></label>
                <select id="d-hospital" required value={dHospital} onChange={(e) => setDHospital(e.target.value)}>
                  <option value="">{hospitals === null ? "Failed to load — refresh the page" : hospitals.length ? "Select hospital" : "Loading…"}</option>
                  {(hospitals || []).map((h) => (
                    <option key={h.hospitalId} value={h.hospitalId}>{h.hospitalName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="d-degree">Degree<span className="req">*</span></label>
                <select id="d-degree" required value={dDegree} onChange={(e) => setDDegree(e.target.value)}>
                  <option value="">{degrees === null ? "Failed to load — refresh the page" : degrees.length ? "Select degree" : "Loading…"}</option>
                  {(degrees || []).map((d) => (
                    <option key={d.degreeId} value={d.degreeId}>{d.degreeName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="d-specialization">Specialization<span className="req">*</span></label>
              <select id="d-specialization" required value={dSpecialization} onChange={(e) => setDSpecialization(e.target.value)}>
                <option value="">{specializations === null ? "Failed to load — refresh the page" : specializations.length ? "Select specialization" : "Loading…"}</option>
                {(specializations || []).map((s) => (
                  <option key={s.specializationId} value={s.specializationId}>{s.specializationName}</option>
                ))}
              </select>
            </div>
            <div className="form-row-2col">
              <div className="form-row">
                <label htmlFor="d-licenseDoc">Licence document path/URL<span className="req">*</span></label>
                <input id="d-licenseDoc" required maxLength={200} value={dLicenseDoc} onChange={(e) => setDLicenseDoc(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="d-degreeDoc">Degree document path/URL<span className="req">*</span></label>
                <input id="d-degreeDoc" required maxLength={200} value={dDegreeDoc} onChange={(e) => setDDegreeDoc(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="d-address">Address<span className="req">*</span></label>
              <input id="d-address" required maxLength={200} value={dAddress} onChange={(e) => setDAddress(e.target.value)} />
            </div>
            <LocationFields idPrefix="d" cascade={doctorLocation} />
            <p className="form-note">Doctor accounts also need admin approval after email verification before login succeeds.</p>
            <button id="doctorSubmit" className="btn btn-solid btn-block" type="submit" disabled={doctorSubmitting}>
              {doctorSubmitting ? "Creating account…" : "Create doctor account"}
            </button>
          </form>
        </div>

        <p className="auth-foot">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
