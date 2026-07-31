(function () {
  "use strict";

  var user = DoctorSession.requireDoctorAuth();
  if (!user) return;
  DoctorShell.init(user);

  var page = document.body.getAttribute("data-page");
  var state = {
    profile: null
  };

  function $(id) { return document.getElementById(id); }
  function esc(value) { return DoctorUtil.escapeHtml(value); }
  function queryParam(name) { return new URLSearchParams(window.location.search).get(name); }

  function showToast(message, isError) {
    var host = $("toastHost");
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast" + (isError ? " error" : "");
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  function setModalOpen(modal, isOpen) {
    if (!modal) return;
    modal.hidden = !isOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function wireModalCloseButtons() {
    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        setModalOpen($(button.getAttribute("data-close-modal")), false);
      });
    });
  }

  function detailCell(label, value, full) {
    return '<div class="' + (full ? "full" : "") + '">' +
      '<div class="dl">' + esc(label) + '</div>' +
      '<div class="dv">' + esc(value) + '</div>' +
    '</div>';
  }

  function joinName(row) {
    return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
  }

  async function loadSharedProfile() {
    state.profile = await DoctorAPI.profile();
    var fullName = "Dr. " + joinName(state.profile);
    var nameEl = $("sidebarProfileName");
    var metaEl = $("sidebarProfileMeta");
    var initialsEl = $("sidebarInitials");
    if (nameEl) nameEl.textContent = fullName;
    if (metaEl) metaEl.textContent = "License " + (state.profile.licenseNumber || "—");
    if (initialsEl) initialsEl.textContent = DoctorUtil.initials(state.profile.firstName, state.profile.lastName);
    var hero = $("doctorHeading");
    if (hero) hero.textContent = fullName;
  }

  async function initOverview() {
    try {
      var responses = await Promise.all([
        DoctorAPI.dashboard(),
        DoctorAPI.myPatients()
      ]);
      var stats = responses[0];
      var recentPatients = responses[1] || [];

      $("statGrid").innerHTML = [
        card("Patients treated", stats.patientsTreated, "Unique patients"),
        card("Total visits", stats.totalVisits, "All recorded consultations"),
        card("Visits today", stats.visitsToday, "Recorded today"),
        card("Diagnoses this week", stats.diagnosesThisWeek, "Last 7 days"),
        card("Prescriptions this week", stats.prescriptionsThisWeek, "Last 7 days")
      ].join("");

      renderPatientsTable("recentPatientsBody", recentPatients.slice(0, 5));
    } catch (err) {
      $("statGrid").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }

    initSearchSection();
  }

  function initSearchSection() {
    var form = $("searchForm");
    var body = $("searchResults");
    if (!form || !body) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      body.innerHTML = '<div class="table-loading">Searching…</div>';
      try {
        var rows = await DoctorAPI.searchPatients($("aarogyamId").value.trim(), $("searchName").value.trim());
        if (!rows.length) {
          body.innerHTML = '<div class="empty-state">No patient matched that search.</div>';
          return;
        }
        body.innerHTML = rows.map(function (row) {
          return '<div class="card result-card"><div class="result-copy"><div class="row-title">' + esc(joinName(row)) + '</div><div class="row-sub">AAID ' + esc(row.aarogyamId) + ' • ' + esc(row.gender) + ' • ' + esc(row.bloodGroup || "Blood group not set") + '</div></div><a class="btn btn-solid btn-sm" href="patient.html?patientId=' + row.patientId + '">View record</a></div>';
        }).join("");
      } catch (err) {
        body.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
      }
    });
  }

  function card(label, value, note) {
    return '<div class="stat-card"><div class="stat-label">' + esc(label) + '</div><div class="stat-value">' + esc(value) + '</div><div class="metric-note">' + esc(note) + '</div></div>';
  }

  function renderPatientsTable(mountId, rows) {
    var mount = $(mountId);
    if (!mount) return;
    if (!rows.length) {
      mount.innerHTML = '<tr><td colspan="4" class="table-empty">No patients found yet.</td></tr>';
      return;
    }
    mount.innerHTML = rows.map(function (row) {
      return '<tr>' +
        '<td><div class="row-title">' + esc(joinName(row)) + '</div><div class="row-sub">' + esc(row.bloodGroup || "Blood group not set") + '</div></td>' +
        '<td class="mono">' + esc(row.aarogyamId) + '</td>' +
        '<td>' + esc(DoctorUtil.formatDate(row.lastVisitDate)) + '</td>' +
        '<td class="actions"><a class="btn btn-ghost btn-sm" href="patient.html?patientId=' + row.patientId + '">Open</a></td>' +
      '</tr>';
    }).join("");
  }

  async function initMyPatients() {
    var body = $("patientsBody");
    async function load(search) {
      body.innerHTML = '<tr><td colspan="5" class="table-loading">Loading…</td></tr>';
      try {
        var rows = await DoctorAPI.myPatients(search);
        if (!rows.length) {
          body.innerHTML = '<tr><td colspan="5" class="table-empty">No patients found.</td></tr>';
          return;
        }
        body.innerHTML = rows.map(function (row) {
          return '<tr>' +
            '<td><div class="row-title">' + esc(joinName(row)) + '</div><div class="row-sub">' + esc(row.gender) + '</div></td>' +
            '<td class="mono">' + esc(row.aarogyamId) + '</td>' +
            '<td>' + esc(row.totalVisits) + '</td>' +
            '<td>' + esc(DoctorUtil.formatDate(row.lastVisitDate)) + '</td>' +
            '<td class="actions"><a class="btn btn-ghost btn-sm" href="patient.html?patientId=' + row.patientId + '">Open</a></td>' +
          '</tr>';
        }).join("");
      } catch (err) {
        body.innerHTML = '<tr><td colspan="5" class="table-empty">' + esc(err.message) + '</td></tr>';
      }
    }
    $("patientSearch").addEventListener("input", function () {
      load($("patientSearch").value.trim());
    });
    load("");
  }

  async function initPatientDetail() {
    var patientId = queryParam("patientId");
    if (!patientId) {
      $("patientContent").innerHTML = '<div class="form-alert error">Missing patientId in the URL.</div>';
      return;
    }
    try {
      var responses = await Promise.all([
        DoctorAPI.getPatient(patientId),
        DoctorAPI.getPatientVisits(patientId),
        DoctorAPI.getPatientDiagnoses(patientId),
        DoctorAPI.getPatientReports(patientId),
        DoctorAPI.getPatientPrescriptions(patientId)
      ]);
      var patient = responses[0];
      var visits = responses[1] || [];
      var diagnoses = responses[2] || [];
      var reports = responses[3] || [];
      var prescriptions = responses[4] || [];

      $("patientName").textContent = joinName(patient);
      $("patientMeta").textContent = patient.aarogyamId + " • " + patient.gender + " • " + (patient.bloodGroup || "Blood group not set");
      $("openCreateVisit").href = "create-visit.html?patientId=" + patient.patientId;

      state.currentVisits = visits;
      state.currentDiagnoses = diagnoses;

      $("patientContent").innerHTML =
        '<div class="card"><div class="card-title">History</div><div class="timeline">' + renderVisitTimeline(visits, diagnoses) + '</div></div>' +
        '<div class="card"><div class="card-title">Reports</div>' + renderReportList(reports) + '</div>' +
        '<div class="card"><div class="card-title">Prescriptions</div>' + renderPrescriptionList(prescriptions) + '</div>';

      $("patientContent").addEventListener("click", async function (event) {
        var reportId = event.target.getAttribute("data-report-download");
        if (reportId) {
          try {
            var file = await DoctorAPI.downloadReport(reportId);
            DoctorUtil.downloadBlob(file.blob, file.fileName || ("report-" + reportId));
          } catch (err) {
            showToast(err.message, true);
          }
          return;
        }

        var visitCard = event.target.closest("[data-view-visit]");
        if (visitCard) { openVisitModal(visitCard.getAttribute("data-view-visit")); return; }

        var prescriptionCard = event.target.closest("[data-view-prescription]");
        var downloadBtn = event.target.closest("[data-download-prescription]");
        if (downloadBtn) { handlePrescriptionDownload(downloadBtn.getAttribute("data-download-prescription")); return; }
        if (prescriptionCard) { openPrescriptionModal(prescriptionCard.getAttribute("data-view-prescription")); return; }
      });

      wireModalCloseButtons();
      $("downloadPrescriptionBtn").addEventListener("click", function () {
        if (state.currentPrescriptionId) handlePrescriptionDownload(state.currentPrescriptionId);
      });
    } catch (err) {
      $("patientContent").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
  }

  function openVisitModal(visitId) {
    var visit = (state.currentVisits || []).find(function (v) { return String(v.visitId) === String(visitId); });
    var diagnoses = (state.currentDiagnoses || []).filter(function (d) { return String(d.visitId) === String(visitId); });
    if (!visit) return;
    $("visitDetailContent").innerHTML =
      '<div class="detail-grid">' +
        detailCell("Visit", "#" + visit.visitId) +
        detailCell("Date", DoctorUtil.formatDateTime(visit.visitDate)) +
        detailCell("Notes", visit.notes || "No notes added.", true) +
      '</div>' +
      (diagnoses.length
        ? '<div class="section-space"><div class="card-title">Diagnoses on this visit</div>' + diagnoses.map(function (d) {
            return '<div class="timeline-body-card"><b>' + esc(d.diagnosisTitle) + '</b><div class="row-sub">' + esc(d.description || "No description added.") + '</div></div>';
          }).join("") + '</div>'
        : '');
    setModalOpen($("visitModal"), true);
  }

  async function handlePrescriptionDownload(prescriptionId) {
    try {
      var file = await DoctorAPI.downloadPrescription(prescriptionId);
      DoctorUtil.downloadBlob(file.blob, file.fileName || ("prescription-" + prescriptionId + ".pdf"));
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function openPrescriptionModal(prescriptionId) {
    state.currentPrescriptionId = prescriptionId;
    var content = $("prescriptionDetailContent");
    content.innerHTML = '<div class="table-loading">Loading prescription…</div>';
    setModalOpen($("prescriptionModal"), true);
    try {
      var detail = await DoctorAPI.getPrescriptionDetails(prescriptionId);
      content.innerHTML =
        '<div class="detail-grid">' +
          detailCell("Patient", detail.patientName) +
          detailCell("Date", DoctorUtil.formatDate(detail.prescriptionDate)) +
          detailCell("Visit", "#" + detail.visitId) +
          detailCell("Diagnosis", detail.diagnosisTitle || "Not linked") +
          detailCell("Prescription", detail.prescriptionText || "No prescription text.", true) +
        '</div>';
    } catch (err) {
      content.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
  }

  function renderVisitTimeline(visits, diagnoses) {
    if (!visits.length) return '<div class="empty-state">No visits recorded yet.</div>';
    var diagnosisByVisit = {};
    diagnoses.forEach(function (item) {
      if (!diagnosisByVisit[item.visitId]) diagnosisByVisit[item.visitId] = [];
      diagnosisByVisit[item.visitId].push(item);
    });
    return visits.map(function (visit) {
      var items = diagnosisByVisit[visit.visitId] || [];
      return '<div class="timeline-item clickable" data-view-visit="' + visit.visitId + '"><div class="timeline-body-card"><div class="timeline-head"><b>Visit #' + esc(visit.visitId) + '</b><span class="timeline-date">' + esc(DoctorUtil.formatDate(visit.visitDate)) + '</span></div><div class="timeline-body">' + esc((visit.notes || "No notes added.").slice(0, 160)) + '</div>' + (items.length ? '<div class="timeline-tags">' + items.map(function (d) { return '<span class="badge ok">' + esc(d.diagnosisTitle) + '</span>'; }).join("") + '</div>' : '') + '</div></div>';
    }).join("");
  }

  function renderReportList(reports) {
    if (!reports.length) return '<div class="empty-state">No reports uploaded yet.</div>';
    return '<div class="stack-list">' + reports.map(function (row) {
      return '<article class="list-item"><div class="list-item-main"><div class="row-title">' + esc(row.title) + '</div><div class="row-sub">' + esc(row.reportType) + ' • ' + esc(DoctorUtil.formatDate(row.reportDate || row.createdAt)) + '</div></div><button class="btn btn-ghost btn-sm" data-report-download="' + row.reportId + '" type="button">Download</button></article>';
    }).join("") + '</div>';
  }

  function renderPrescriptionList(rows) {
    if (!rows.length) return '<div class="empty-state">No prescriptions issued yet.</div>';
    return '<div class="stack-list">' + rows.map(function (row) {
      return '<article class="list-item clickable" data-view-prescription="' + row.prescriptionId + '"><div class="list-item-main"><div class="row-title">Prescription #' + esc(row.prescriptionId) + '</div><div class="row-sub">' + esc((row.prescriptionText || "").slice(0, 140)) + '</div><div class="list-meta">' + esc(DoctorUtil.formatDate(row.prescriptionDate)) + '</div></div><button class="btn btn-ghost btn-sm" data-download-prescription="' + row.prescriptionId + '" type="button">Download</button></article>';
    }).join("") + '</div>';
  }

  function showFlowAlert(message) {
    var alertEl = $("flowAlert");
    alertEl.textContent = message;
    alertEl.hidden = false;
  }

  function setInvalid(rowId, isInvalid) {
    var row = $(rowId);
    if (row) row.classList.toggle("invalid", isInvalid);
  }

  function toLocalDatetimeValue(date) {
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function goToStep(step, foundPatient) {
    $("panelStep1").hidden = step !== 1;
    $("visitFlowForm").hidden = step !== 2;
    $("stepPill1").classList.toggle("active", step === 1);
    $("stepPill1").classList.toggle("done", step === 2);
    $("stepPill2").classList.toggle("active", step === 2);
    if (step === 2 && foundPatient) {
      $("pfName").textContent = joinName(foundPatient);
      $("pfMeta").textContent = foundPatient.aarogyamId + " • " + foundPatient.gender + " • " + (foundPatient.bloodGroup || "Blood group not set");
      $("pfInitials").textContent = DoctorUtil.initials(foundPatient.firstName, foundPatient.lastName);
    }
  }

  function initOptionalToggles() {
    document.querySelectorAll(".optional-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var section = $(toggle.getAttribute("data-toggle"));
        section.classList.toggle("open");
      });
    });
  }

  async function initCreateVisit() {
    var state2 = { patient: null };

    try {
      var diagnosisTypes = await DoctorAPI.diagnosisTypes();
      $("diagnosisTypeId").innerHTML = '<option value="">Select diagnosis type</option>' + diagnosisTypes.map(function (row) {
        return '<option value="' + row.diagnosisTypeId + '">' + esc(row.diagnosisTypeName) + '</option>';
      }).join("");
    } catch (err) {}

    initOptionalToggles();
    $("visitDate").value = toLocalDatetimeValue(new Date());

    async function runLookup(aarogyamId) {
      $("flowAlert").hidden = true;
      $("lookupResult").innerHTML = '<div class="table-loading">Searching…</div>';
      $("continueToStep2").disabled = true;
      try {
        var rows = await DoctorAPI.searchPatients(aarogyamId, null);
        if (!rows.length) {
          $("lookupResult").innerHTML = '<div class="form-alert error">No patient found with that Aarogyam ID.</div>';
          return;
        }
        state2.patient = rows[0];
        $("lookupResult").innerHTML =
          '<div class="patient-found-card"><div class="avatar-circle small">' + esc(DoctorUtil.initials(rows[0].firstName, rows[0].lastName)) + '</div>' +
          '<div class="pf-main"><div class="row-title">' + esc(joinName(rows[0])) + '</div>' +
          '<div class="row-sub mono">' + esc(rows[0].aarogyamId) + ' • ' + esc(rows[0].gender) + ' • ' + esc(rows[0].bloodGroup || "Blood group not set") + '</div></div></div>';
        $("continueToStep2").disabled = false;
      } catch (err) {
        $("lookupResult").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
      }
    }

    var patientId = queryParam("patientId");
    if (patientId) {
      try {
        state2.patient = await DoctorAPI.getPatient(patientId);
        goToStep(2, state2.patient);
      } catch (err) {
        showFlowAlert(err.message);
      }
    }

    $("lookupBtn").addEventListener("click", function () {
      var value = $("lookupAarogyamId").value.trim();
      setInvalid("rowAarogyamId", !value);
      if (!value) return;
      runLookup(value);
    });
    $("lookupAarogyamId").addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); $("lookupBtn").click(); }
    });
    $("continueToStep2").addEventListener("click", function () {
      if (!state2.patient) return;
      goToStep(2, state2.patient);
    });
    $("changePatientBtn").addEventListener("click", function () {
      goToStep(1);
    });
    $("backToStep1").addEventListener("click", function () {
      goToStep(1);
    });

    $("visitFlowForm").addEventListener("submit", async function (event) {
      event.preventDefault();
      $("flowAlert").hidden = true;

      if (!state2.patient) {
        showFlowAlert("Please find and choose a patient first.");
        goToStep(1);
        return;
      }

      var diagnosisOpen = $("sectionDiagnosis").classList.contains("open");
      var prescriptionOpen = $("sectionPrescription").classList.contains("open");
      var reportOpen = $("sectionReport").classList.contains("open");

      var visitDateValid = !!$("visitDate").value;
      var diagnosisTypeValid = !diagnosisOpen || !!$("diagnosisTypeId").value;
      var diagnosisTitleValid = !diagnosisOpen || !!$("diagnosisTitle").value.trim();
      var prescriptionValid = !prescriptionOpen || !!$("prescriptionText").value.trim();
      var reportTitleValid = !reportOpen || !!$("reportTitle").value.trim();
      var reportFileValid = !reportOpen || !!$("reportFile").files[0];

      setInvalid("rowVisitDate", !visitDateValid);
      setInvalid("rowDiagnosisType", !diagnosisTypeValid);
      setInvalid("rowDiagnosisTitle", !diagnosisTitleValid);
      setInvalid("rowPrescriptionText", !prescriptionValid);
      setInvalid("rowReportTitle", !reportTitleValid);
      setInvalid("rowReportFile", !reportFileValid);

      if (!visitDateValid || !diagnosisTypeValid || !diagnosisTitleValid || !prescriptionValid || !reportTitleValid || !reportFileValid) {
        showFlowAlert("Please fix the highlighted fields.");
        return;
      }

      var patientIdVal = state2.patient.patientId;
      var visitDateOnly = $("visitDate").value.split("T")[0];
      var submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        var visit = await DoctorAPI.createVisit({
          patientId: patientIdVal,
          visitDate: $("visitDate").value,
          notes: $("visitNotes").value.trim()
        });

        var diagnosisId = null;
        if (diagnosisOpen) {
          var diagnosis = await DoctorAPI.createDiagnosis({
            visitId: visit.visitId,
            diagnosisTypeId: Number($("diagnosisTypeId").value),
            diagnosisTitle: $("diagnosisTitle").value.trim(),
            description: $("diagnosisDescription").value.trim(),
            diagnosisDate: visitDateOnly
          });
          diagnosisId = diagnosis.diagnosisId;
        }

        if (prescriptionOpen) {
          await DoctorAPI.createPrescription({
            visitId: visit.visitId,
            diagnosisId: diagnosisId,
            prescriptionText: $("prescriptionText").value.trim(),
            prescriptionDate: visitDateOnly
          });
        }

        if (reportOpen) {
          var formData = new FormData();
          formData.append("PatientId", patientIdVal);
          formData.append("VisitId", visit.visitId);
          if (diagnosisId) formData.append("DiagnosisId", diagnosisId);
          formData.append("Title", $("reportTitle").value.trim());
          formData.append("ReportType", $("reportType").value.trim() || "Clinical");
          formData.append("ReportDate", visitDateOnly);
          formData.append("File", $("reportFile").files[0]);
          await DoctorAPI.uploadReport(formData);
        }

        showToast("Visit created successfully.");
        setTimeout(function () {
          window.location.href = "patient.html?patientId=" + patientIdVal;
        }, 900);
      } catch (err) {
        showFlowAlert(err.message);
        submitBtn.disabled = false;
      }
    });
  }

  function nameById(list, idField, nameField, id) {
    var item = list.find(function (row) { return row[idField] === id; });
    return item ? item[nameField] : "—";
  }

  async function populateStateOptions(countryId, selectedStateId) {
    if (!countryId) {
      $("stateId").innerHTML = '<option value="">Select state</option>';
      return;
    }
    var states = await DoctorAPI.states(countryId);
    $("stateId").innerHTML = '<option value="">Select state</option>' + states.map(function (item) {
      return '<option value="' + item.stateId + '"' + (item.stateId === selectedStateId ? " selected" : "") + '>' + esc(item.stateName) + '</option>';
    }).join("");
  }

  async function populateCityOptions(stateId, selectedCityId) {
    if (!stateId) {
      $("cityId").innerHTML = '<option value="">Select city</option>';
      return;
    }
    var cities = await DoctorAPI.cities(stateId);
    $("cityId").innerHTML = '<option value="">Select city</option>' + cities.map(function (item) {
      return '<option value="' + item.cityId + '"' + (item.cityId === selectedCityId ? " selected" : "") + '>' + esc(item.cityName) + '</option>';
    }).join("");
  }

  async function initProfile() {
    var ui = {
      profileAlert: $("profileAlert"),
      passwordAlert: $("passwordAlert"),
      profileView: $("profileView"),
      profileForm: $("profileForm"),
      passwordForm: $("passwordForm")
    };
    var lookups = { hospitals: [], specializations: [], countries: [] };
    var doctor = null;

    function showView() {
      ui.profileView.hidden = false;
      ui.profileForm.hidden = true;
      $("editProfileBtn").hidden = false;
    }
    function showEdit() {
      ui.profileView.hidden = true;
      ui.profileForm.hidden = false;
      $("editProfileBtn").hidden = true;
    }

    function renderProfileView() {
      $("licenseValue").textContent = doctor.licenseNumber;
      ui.profileView.innerHTML = [
        detailCell("Name", "Dr. " + joinName(doctor)),
        detailCell("Hospital", nameById(lookups.hospitals, "hospitalId", "hospitalName", doctor.hospitalId)),
        detailCell("Specialization", nameById(lookups.specializations, "specializationId", "specializationName", doctor.specializationId)),
        detailCell("Approval status", doctor.approvalStatus),
        detailCell("Address", doctor.address, true)
      ].join("");
    }

    function populateProfileForm() {
      $("firstName").value = doctor.firstName || "";
      $("middleName").value = doctor.middleName || "";
      $("lastName").value = doctor.lastName || "";
      $("address").value = doctor.address || "";
      $("hospitalId").innerHTML = lookups.hospitals.map(function (item) {
        return '<option value="' + item.hospitalId + '"' + (item.hospitalId === doctor.hospitalId ? " selected" : "") + '>' + esc(item.hospitalName) + '</option>';
      }).join("");
      $("specializationId").innerHTML = lookups.specializations.map(function (item) {
        return '<option value="' + item.specializationId + '"' + (item.specializationId === doctor.specializationId ? " selected" : "") + '>' + esc(item.specializationName) + '</option>';
      }).join("");
      $("countryId").innerHTML = lookups.countries.map(function (item) {
        return '<option value="' + item.countryId + '"' + (item.countryId === doctor.countryId ? " selected" : "") + '>' + esc(item.countryName) + '</option>';
      }).join("");
    }

    try {
      var responses = await Promise.all([
        DoctorAPI.profile(),
        DoctorAPI.hospitals(),
        DoctorAPI.specializations(),
        DoctorAPI.countries()
      ]);
      doctor = responses[0];
      lookups.hospitals = responses[1] || [];
      lookups.specializations = responses[2] || [];
      lookups.countries = responses[3] || [];

      renderProfileView();
      populateProfileForm();
      await populateStateOptions(doctor.countryId, doctor.stateId);
      await populateCityOptions(doctor.stateId, doctor.cityId);
    } catch (err) {
      ui.profileAlert.textContent = err.message;
      ui.profileAlert.hidden = false;
    }

    $("editProfileBtn").addEventListener("click", showEdit);
    $("cancelEditBtn").addEventListener("click", async function () {
      populateProfileForm();
      await populateStateOptions(doctor.countryId, doctor.stateId);
      await populateCityOptions(doctor.stateId, doctor.cityId);
      showView();
    });

    $("countryId").addEventListener("change", function () {
      populateStateOptions($("countryId").value, null);
      $("cityId").innerHTML = '<option value="">Select city</option>';
    });
    $("stateId").addEventListener("change", function () {
      populateCityOptions($("stateId").value, null);
    });

    ui.profileForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      ui.profileAlert.hidden = true;
      var payload = {
        firstName: $("firstName").value.trim(),
        middleName: $("middleName").value.trim() || null,
        lastName: $("lastName").value.trim(),
        hospitalId: Number($("hospitalId").value),
        specializationId: Number($("specializationId").value),
        address: $("address").value.trim(),
        countryId: Number($("countryId").value),
        stateId: Number($("stateId").value),
        cityId: Number($("cityId").value)
      };
      try {
        await DoctorAPI.updateProfile(payload);
        showToast("Profile updated successfully.");
        doctor = await DoctorAPI.profile();
        renderProfileView();
        loadSharedProfile();
        showView();
      } catch (err) {
        ui.profileAlert.textContent = err.message;
        ui.profileAlert.hidden = false;
      }
    });

    ui.passwordForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      ui.passwordAlert.hidden = true;
      try {
        await DoctorAPI.changePassword({
          currentPassword: $("currentPassword").value,
          newPassword: $("newPassword").value
        });
        ui.passwordForm.reset();
        showToast("Password updated successfully.");
      } catch (err) {
        ui.passwordAlert.textContent = err.message;
        ui.passwordAlert.hidden = false;
      }
    });
  }

  loadSharedProfile();
  if (page === "overview") initOverview();
  if (page === "patients") initMyPatients();
  if (page === "patient") initPatientDetail();
  if (page === "create-visit") initCreateVisit();
  if (page === "profile") initProfile();
})();
