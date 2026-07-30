(function () {
  "use strict";

  var user = PatientSession.requirePatientAuth();
  if (!user) return;
  PatientShell.init(user);

  var page = document.body.getAttribute("data-page");
  var ui = {};
  var state = {
    profile: null,
    visits: [],
    diagnoses: [],
    reports: [],
    prescriptions: [],
    currentPrescriptionId: null,
    selectedReportFile: null,
    qrUrl: null
  };

  function $(id) { return document.getElementById(id); }
  function esc(value) { return PatientUtil.escapeHtml(value); }

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

  function joinName(profile) {
    return [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ");
  }

  function detailCell(label, value, full) {
    return '<div class="' + (full ? "full" : "") + '">' +
      '<div class="dl">' + esc(label) + '</div>' +
      '<div class="dv">' + esc(value) + '</div>' +
    '</div>';
  }

  function wireModalCloseButtons() {
    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        setModalOpen($(button.getAttribute("data-close-modal")), false);
      });
    });
  }

  async function loadQrImage() {
    var qrImg = $("healthCardQr");
    if (!qrImg) return;
    if (state.qrUrl) {
      URL.revokeObjectURL(state.qrUrl);
      state.qrUrl = null;
    }
    try {
      var qr = await PatientAPI.healthCardQr();
      state.qrUrl = URL.createObjectURL(qr.blob);
      qrImg.src = state.qrUrl;
    } catch (err) {
      qrImg.alt = err.message;
    }
  }

  function renderProfileBadge(profile) {
    var nameEl = $("sidebarProfileName");
    var metaEl = $("sidebarProfileMeta");
    var initialsEl = $("sidebarInitials");
    if (nameEl) nameEl.textContent = joinName(profile);
    if (metaEl) metaEl.textContent = "Aarogyam ID " + profile.aarogyamId;
    if (initialsEl) initialsEl.textContent = PatientUtil.initials(profile.firstName, profile.lastName);
  }

  function renderHealthCardBlock(profile, mountId) {
    var mount = $(mountId);
    if (!mount) return;
    mount.innerHTML =
      '<div class="cap">Patient</div>' +
      '<div class="card-title">' + esc(joinName(profile)) + '</div>' +
      '<div class="card-sub">Aarogyam ID ' + esc(profile.aarogyamId) + '</div>' +
      '<div class="cap card-cap-spaced">Blood group</div>' +
      '<div>' + esc(profile.bloodGroup || "Not set") + '</div>' +
      '<div class="cap card-cap-spaced">Emergency contact</div>' +
      '<div>' + esc(profile.emergencyContact || "Not added") + '</div>';
  }

  function renderOverviewStats(stats) {
    var statGrid = $("statGrid");
    if (!statGrid) return;
    var cards = [
      { label: "Total visits", value: stats.totalVisits, note: stats.lastVisitDate ? "Last visit " + PatientUtil.formatDate(stats.lastVisitDate) : "No visits yet" },
      { label: "Prescriptions", value: stats.totalPrescriptions, note: "Issued during consultations" },
      { label: "Reports", value: stats.totalReports, note: stats.reportsThisMonth + " added this month" },
      { label: "Unread alerts", value: stats.unreadNotifications, note: "Waiting for your review", warn: stats.unreadNotifications > 0 }
    ];
    statGrid.innerHTML = cards.map(function (card) {
      return '<div class="stat-card' + (card.warn ? " warn" : "") + '">' +
        '<div class="stat-label">' + esc(card.label) + '</div>' +
        '<div class="stat-value">' + esc(card.value) + '</div>' +
        '<div class="metric-note">' + esc(card.note) + '</div>' +
      '</div>';
    }).join("");
  }

  function renderTimeline(visits, diagnoses, limit, mountId) {
    var mount = $(mountId);
    if (!mount) return;
    if (!visits.length) {
      mount.innerHTML = '<div class="empty-state">No visits recorded yet.</div>';
      return;
    }
    var diagnosisByVisitId = {};
    diagnoses.forEach(function (diagnosis) {
      if (!diagnosisByVisitId[diagnosis.visitId]) diagnosisByVisitId[diagnosis.visitId] = [];
      diagnosisByVisitId[diagnosis.visitId].push(diagnosis);
    });
    mount.innerHTML = visits.slice(0, limit || visits.length).map(function (visit) {
      var visitDiagnoses = diagnosisByVisitId[visit.visitId] || [];
      var tags = visitDiagnoses.map(function (item) {
        return '<span class="badge ok">' + esc(item.diagnosisTitle) + '</span>';
      }).join("");
      return '<div class="timeline-item">' +
        '<div class="timeline-head">' +
          '<b>' + esc(PatientUtil.formatDate(visit.visitDate)) + '</b>' +
        '</div>' +
        '<div class="timeline-body">' + esc((visit.notes || "Consultation notes were not added for this visit.").slice(0, 160)) + '</div>' +
        (tags ? '<div class="timeline-tags">' + tags + '</div>' : "") +
      '</div>';
    }).join("");
  }

  function assignVisitNumbers(visits) {
    var sorted = visits.slice().sort(function (a, b) { return new Date(a.visitDate) - new Date(b.visitDate); });
    var numberByVisitId = {};
    sorted.forEach(function (visit, index) { numberByVisitId[visit.visitId] = index + 1; });
    return numberByVisitId;
  }

  function renderHistoryList(visits, diagnoses, prescriptions, mountId) {
    var mount = $(mountId);
    if (!mount) return;
    if (!visits.length) {
      mount.innerHTML = '<div class="empty-state">No visits recorded yet.</div>';
      return;
    }

    var numberByVisitId = assignVisitNumbers(state.visits);
    var diagnosisByVisit = {};
    diagnoses.forEach(function (d) { (diagnosisByVisit[d.visitId] = diagnosisByVisit[d.visitId] || []).push(d); });
    var prescriptionByVisit = {};
    prescriptions.forEach(function (p) { (prescriptionByVisit[p.visitId] = prescriptionByVisit[p.visitId] || []).push(p); });

    var displayVisits = visits.slice().sort(function (a, b) { return new Date(b.visitDate) - new Date(a.visitDate); });

    mount.innerHTML = displayVisits.map(function (visit) {
      var vDiagnoses = diagnosisByVisit[visit.visitId] || [];
      var vPrescriptions = prescriptionByVisit[visit.visitId] || [];
      var tags = vDiagnoses.map(function (d) { return '<span class="badge ok">' + esc(d.diagnosisTitle) + '</span>'; }).join("");
      var title = vDiagnoses.length ? vDiagnoses.map(function (d) { return d.diagnosisTitle; }).join(", ") : "Consultation";

      var diagnosisBlock = vDiagnoses.length
        ? '<div class="visit-sub-block"><div class="visit-sub-label">Diagnoses</div>' + vDiagnoses.map(function (d) {
            return '<div class="timeline-body-card"><b>' + esc(d.diagnosisTitle) + '</b><div class="row-sub">' + esc(d.description || "No description added.") + '</div></div>';
          }).join("") + '</div>'
        : '';

      var prescriptionBlock = vPrescriptions.length
        ? '<div class="visit-sub-block"><div class="visit-sub-label">Prescriptions</div><div class="stack-list">' + vPrescriptions.map(function (p) {
            return '<article class="list-item clickable" data-view-prescription="' + p.prescriptionId + '">' +
              '<div class="list-item-main"><div class="row-title">' + esc(PatientUtil.formatDate(p.prescriptionDate)) + '</div><div class="row-sub">' + esc((p.prescriptionText || "").slice(0, 140)) + '</div></div>' +
              '<button class="btn btn-ghost btn-sm" type="button" data-download-prescription="' + p.prescriptionId + '">Download</button>' +
            '</article>';
          }).join("") + '</div></div>'
        : '';

      return '<div class="visit-card">' +
        '<div class="visit-card-head" data-toggle-visit="' + visit.visitId + '">' +
          '<div class="visit-card-num">' + numberByVisitId[visit.visitId] + '</div>' +
          '<div class="visit-card-main">' +
            '<div class="visit-card-date">' + esc(PatientUtil.formatDate(visit.visitDate)) + '</div>' +
            '<div class="visit-card-title">' + esc(title) + '</div>' +
            (tags ? '<div class="visit-card-tags">' + tags + '</div>' : '') +
          '</div>' +
          '<svg class="visit-card-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>' +
        '</div>' +
        '<div class="visit-card-body">' +
          '<div class="visit-sub-block"><div class="visit-sub-label">Notes</div><div class="row-sub">' + esc(visit.notes || "No notes added.") + '</div></div>' +
          diagnosisBlock + prescriptionBlock +
        '</div>' +
      '</div>';
    }).join("");
  }

  function renderReportsTable(reports, mountId) {
    var mount = $(mountId);
    if (!mount) return;
    if (!reports.length) {
      mount.innerHTML = '<tr><td colspan="6" class="table-empty">No reports uploaded yet.</td></tr>';
      return;
    }
    mount.innerHTML = reports.map(function (report) {
      return '<tr>' +
        '<td><div class="row-title">' + esc(report.title) + '</div><div class="row-sub">' + esc(report.reportType) + '</div></td>' +
        '<td>' + esc(PatientUtil.formatDate(report.reportDate || report.createdAt)) + '</td>' +
        '<td>' + (report.visitId ? ('#' + esc(report.visitId)) : '—') + '</td>' +
        '<td class="mono">' + esc(PatientUtil.fileSize(report.fileSize)) + '</td>' +
        '<td class="mono">' + esc(report.doctorId ? "Doctor" : "Self") + '</td>' +
        '<td class="actions">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-download-report="' + report.reportId + '">Download</button>' +
          '<button class="btn btn-danger btn-sm" type="button" data-delete-report="' + report.reportId + '">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  async function handleReportDownload(reportId) {
    try {
      var file = await PatientAPI.downloadReport(reportId);
      PatientUtil.downloadBlob(file.blob, file.fileName || ("report-" + reportId));
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handlePrescriptionDownload(prescriptionId) {
    try {
      var file = await PatientAPI.downloadPrescription(prescriptionId);
      PatientUtil.downloadBlob(file.blob, file.fileName || ("prescription-" + prescriptionId + ".pdf"));
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function openPrescription(prescriptionId) {
    state.currentPrescriptionId = prescriptionId;
    var content = $("prescriptionDetailContent");
    if (!content) return;
    content.innerHTML = '<div class="table-loading">Loading prescription…</div>';
    setModalOpen($("prescriptionModal"), true);
    try {
      var detail = await PatientAPI.prescriptionDetails(prescriptionId);
      content.innerHTML =
        '<div class="detail-grid">' +
          detailCell("Doctor", detail.doctorName) +
          detailCell("Date", PatientUtil.formatDate(detail.prescriptionDate)) +
          detailCell("Diagnosis", detail.diagnosisTitle || "Not linked") +
          detailCell("Prescription", detail.prescriptionText || "No prescription text.", true) +
        '</div>';
    } catch (err) {
      content.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
  }

  async function initOverview() {
    ui = {
      statGrid: $("statGrid"),
      timelineList: $("timelineList")
    };
    try {
      var responses = await Promise.all([
        PatientAPI.dashboard(),
        PatientAPI.profile(),
        PatientAPI.visits(),
        PatientAPI.diagnoses()
      ]);
      state.profile = responses[1];
      state.visits = responses[2] || [];
      state.diagnoses = responses[3] || [];

      renderOverviewStats(responses[0]);
      renderProfileBadge(state.profile);
      $("welcomeHeading").textContent = "Good day, " + state.profile.firstName;
      $("profileName").textContent = joinName(state.profile);
      $("profileMeta").textContent = "Aarogyam ID " + state.profile.aarogyamId + " • " + state.profile.gender + " • DOB " + PatientUtil.formatDate(state.profile.dateOfBirth);
      $("patientInitials").textContent = PatientUtil.initials(state.profile.firstName, state.profile.lastName);
      $("profileDetails").innerHTML = [
        detailCell("Blood group", state.profile.bloodGroup || "Not set"),
        detailCell("Emergency contact", state.profile.emergencyContact || "Not added"),
        detailCell("Member since", PatientUtil.formatDate(state.profile.createdAt))
      ].join("");
      renderHealthCardBlock(state.profile, "healthCardInfo");
      loadQrImage();
      renderTimeline(state.visits, state.diagnoses, 3, "timelineList");
    } catch (err) {
      ui.statGrid.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
      ui.timelineList.innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
    }
  }

  async function initProfile() {
    ui = {
      profileAlert: $("profileAlert"),
      passwordAlert: $("passwordAlert"),
      profileView: $("profileView"),
      profileForm: $("profileForm"),
      passwordForm: $("passwordForm"),
      countryId: $("countryId"),
      stateId: $("stateId"),
      cityId: $("cityId")
    };

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

    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.countries()
      ]);
      state.profile = responses[0];
      renderProfileBadge(state.profile);
      renderProfileView(state.profile);
      populateProfileForm(state.profile, responses[1]);
      await populateStateOptions(state.profile.countryId, state.profile.stateId);
      await populateCityOptions(state.profile.stateId, state.profile.cityId);
      renderHealthCardBlock(state.profile, "healthCardInfo");
      loadQrImage();
    } catch (err) {
      ui.profileAlert.textContent = err.message;
      ui.profileAlert.hidden = false;
    }

    $("editProfileBtn").addEventListener("click", showEdit);
    $("cancelEditBtn").addEventListener("click", async function () {
      try {
        var countries = await PatientAPI.countries();
        populateProfileForm(state.profile, countries);
        await populateStateOptions(state.profile.countryId, state.profile.stateId);
        await populateCityOptions(state.profile.stateId, state.profile.cityId);
      } catch (e) {}
      showView();
    });

    ui.countryId.addEventListener("change", function () {
      populateStateOptions(ui.countryId.value, null);
      $("cityId").innerHTML = '<option value="">Select city</option>';
    });
    ui.stateId.addEventListener("change", function () {
      populateCityOptions(ui.stateId.value, null);
    });

    ui.profileForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      ui.profileAlert.hidden = true;
      var payload = {
        firstName: $("firstName").value.trim(),
        middleName: $("middleName").value.trim() || null,
        lastName: $("lastName").value.trim(),
        dateOfBirth: $("dateOfBirth").value,
        gender: $("gender").value,
        bloodGroup: $("bloodGroup").value.trim() || null,
        address: $("address").value.trim(),
        countryId: Number($("countryId").value),
        stateId: Number($("stateId").value),
        cityId: Number($("cityId").value),
        emergencyContact: $("emergencyContact").value.trim() || null
      };
      try {
        await PatientAPI.updateProfile(payload);
        showToast("Profile updated successfully.");
        state.profile = await PatientAPI.profile();
        renderProfileBadge(state.profile);
        renderProfileView(state.profile);
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
        await PatientAPI.changePassword({
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

  function renderProfileView(profile) {
    $("aarogyamIdValue").textContent = profile.aarogyamId;
    $("profileView").innerHTML = [
      detailCell("Name", joinName(profile)),
      detailCell("Date of birth", PatientUtil.formatDate(profile.dateOfBirth)),
      detailCell("Gender", profile.gender || "Not set"),
      detailCell("Blood group", profile.bloodGroup || "Not set"),
      detailCell("Address", profile.address || "Not added", true),
      detailCell("Emergency contact", profile.emergencyContact || "Not added")
    ].join("");
  }

  function populateProfileForm(profile, countries) {
    $("firstName").value = profile.firstName || "";
    $("middleName").value = profile.middleName || "";
    $("lastName").value = profile.lastName || "";
    $("dateOfBirth").value = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "";
    $("gender").value = profile.gender || "";
    $("bloodGroup").value = profile.bloodGroup || "";
    $("address").value = profile.address || "";
    $("emergencyContact").value = profile.emergencyContact || "";
    if (countries) {
      $("countryId").innerHTML = '<option value="">Select country</option>' + countries.map(function (item) {
        return '<option value="' + item.countryId + '"' + (item.countryId === profile.countryId ? " selected" : "") + '>' + esc(item.countryName) + '</option>';
      }).join("");
    }
  }

  async function populateStateOptions(countryId, selectedStateId) {
    if (!countryId) {
      $("stateId").innerHTML = '<option value="">Select state</option>';
      return;
    }
    var states = await PatientAPI.states(countryId);
    $("stateId").innerHTML = '<option value="">Select state</option>' + states.map(function (item) {
      return '<option value="' + item.stateId + '"' + (item.stateId === selectedStateId ? " selected" : "") + '>' + esc(item.stateName) + '</option>';
    }).join("");
  }

  async function populateCityOptions(stateId, selectedCityId) {
    if (!stateId) {
      $("cityId").innerHTML = '<option value="">Select city</option>';
      return;
    }
    var cities = await PatientAPI.cities(stateId);
    $("cityId").innerHTML = '<option value="">Select city</option>' + cities.map(function (item) {
      return '<option value="' + item.cityId + '"' + (item.cityId === selectedCityId ? " selected" : "") + '>' + esc(item.cityName) + '</option>';
    }).join("");
  }

  async function initHistory() {
    wireModalCloseButtons();
    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.visits(),
        PatientAPI.diagnoses(),
        PatientAPI.prescriptions(),
        PatientAPI.diagnosisTypes()
      ]);
      state.profile = responses[0];
      state.visits = responses[1] || [];
      state.diagnoses = responses[2] || [];
      state.prescriptions = responses[3] || [];
      renderProfileBadge(state.profile);
      renderHistoryPage(state.visits, state.diagnoses, state.prescriptions, responses[4] || []);
    } catch (err) {
      $("historyList").innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
    }

    $("historyList").addEventListener("click", async function (event) {
      var downloadBtn = event.target.closest("[data-download-prescription]");
      if (downloadBtn) { await handlePrescriptionDownload(downloadBtn.getAttribute("data-download-prescription")); return; }
      var prescriptionCard = event.target.closest("[data-view-prescription]");
      if (prescriptionCard) { await openPrescription(prescriptionCard.getAttribute("data-view-prescription")); return; }
      var toggleHead = event.target.closest("[data-toggle-visit]");
      if (toggleHead) { toggleHead.closest(".visit-card").classList.toggle("open"); }
    });
    $("downloadPrescriptionBtn").addEventListener("click", function () {
      if (state.currentPrescriptionId) handlePrescriptionDownload(state.currentPrescriptionId);
    });
  }

  function renderHistoryPage(visits, diagnoses, prescriptions, diagnosisTypes) {
    var searchInput = $("historySearch");
    var filterSelect = $("historyFilter");
    filterSelect.innerHTML = '<option value="">All diagnosis types</option>' + diagnosisTypes.map(function (item) {
      return '<option value="' + item.diagnosisTypeId + '">' + esc(item.diagnosisTypeName) + '</option>';
    }).join("");

    function apply() {
      var term = (searchInput.value || "").toLowerCase();
      var typeId = filterSelect.value ? Number(filterSelect.value) : null;

      var filteredDiagnoses = diagnoses.filter(function (item) {
        var matchesType = !typeId || item.diagnosisTypeId === typeId;
        var matchesTerm = !term ||
          item.diagnosisTitle.toLowerCase().indexOf(term) >= 0 ||
          (item.description || "").toLowerCase().indexOf(term) >= 0;
        return matchesType && matchesTerm;
      });
      var allowedVisitIds = {};
      filteredDiagnoses.forEach(function (item) { allowedVisitIds[item.visitId] = true; });

      var matchingPrescriptionVisitIds = {};
      if (term) {
        prescriptions.forEach(function (p) {
          if ((p.prescriptionText || "").toLowerCase().indexOf(term) >= 0) matchingPrescriptionVisitIds[p.visitId] = true;
        });
      }

      var filteredVisits = term || typeId
        ? visits.filter(function (visit) {
            return allowedVisitIds[visit.visitId] ||
              matchingPrescriptionVisitIds[visit.visitId] ||
              (!typeId && (visit.notes || "").toLowerCase().indexOf(term) >= 0);
          })
        : visits;

      var visibleVisitIds = {};
      filteredVisits.forEach(function (v) { visibleVisitIds[v.visitId] = true; });
      var visibleDiagnoses = diagnoses.filter(function (d) { return visibleVisitIds[d.visitId]; });
      var visiblePrescriptions = prescriptions.filter(function (p) { return visibleVisitIds[p.visitId]; });

      renderHistoryList(filteredVisits, visibleDiagnoses, visiblePrescriptions, "historyList");
    }

    searchInput.addEventListener("input", apply);
    filterSelect.addEventListener("change", apply);
    apply();
  }

  async function initReports() {
    ui = {
      reportsBody: $("reportsBody"),
      uploadModal: $("uploadModal"),
      uploadForm: $("uploadForm"),
      uploadAlert: $("uploadAlert"),
      uploadSubmitBtn: $("uploadSubmitBtn"),
      reportFile: $("reportFile"),
      reportFilename: $("reportFilename"),
      reportVisitId: $("reportVisitId"),
      reportDropzone: $("reportDropzone")
    };
    wireModalCloseButtons();

    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.visits(),
        PatientAPI.reports()
      ]);
      state.profile = responses[0];
      state.visits = responses[1] || [];
      state.reports = responses[2] || [];
      renderProfileBadge(state.profile);
      renderReportsTable(state.reports, "reportsBody");
      var numberByVisitId = assignVisitNumbers(state.visits);
      ui.reportVisitId.innerHTML = '<option value="">None</option>' + state.visits.map(function (visit) {
        return '<option value="' + visit.visitId + '">Visit ' + numberByVisitId[visit.visitId] + ' • ' + esc(PatientUtil.formatDate(visit.visitDate)) + '</option>';
      }).join("");
    } catch (err) {
      ui.reportsBody.innerHTML = '<tr><td colspan="6" class="table-empty">' + esc(err.message) + '</td></tr>';
    }

    $("openUploadBtn").addEventListener("click", function () {
      ui.uploadAlert.hidden = true;
      ui.uploadAlert.textContent = "";
      setModalOpen(ui.uploadModal, true);
    });

    ui.uploadForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      ui.uploadAlert.hidden = true;
      var title = $("reportTitle").value.trim();
      var reportType = $("reportType").value.trim();
      var file = state.selectedReportFile || ui.reportFile.files[0];
      if (!title || !reportType || !file) {
        ui.uploadAlert.textContent = "Please enter report details and choose a file.";
        ui.uploadAlert.hidden = false;
        return;
      }
      var formData = new FormData();
      formData.append("Title", title);
      formData.append("ReportType", reportType);
      formData.append("File", file);
      if ($("reportDate").value) formData.append("ReportDate", $("reportDate").value);
      if (ui.reportVisitId.value) formData.append("VisitId", ui.reportVisitId.value);
      ui.uploadSubmitBtn.disabled = true;
      ui.uploadSubmitBtn.textContent = "Uploading…";
      try {
        await PatientAPI.uploadReport(formData);
        ui.uploadForm.reset();
        state.selectedReportFile = null;
        ui.reportFilename.textContent = "No file selected";
        setModalOpen(ui.uploadModal, false);
        showToast("Report uploaded successfully.");
        state.reports = await PatientAPI.reports();
        renderReportsTable(state.reports, "reportsBody");
      } catch (err) {
        ui.uploadAlert.textContent = err.message;
        ui.uploadAlert.hidden = false;
      } finally {
        ui.uploadSubmitBtn.disabled = false;
        ui.uploadSubmitBtn.textContent = "Upload report";
      }
    });

    ui.reportFile.addEventListener("change", function () {
      state.selectedReportFile = ui.reportFile.files[0] || null;
      ui.reportFilename.textContent = state.selectedReportFile ? state.selectedReportFile.name : "No file selected";
    });
    ["dragenter", "dragover"].forEach(function (eventName) {
      ui.reportDropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        ui.reportDropzone.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      ui.reportDropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        ui.reportDropzone.classList.remove("drag-over");
      });
    });
    ui.reportDropzone.addEventListener("drop", function (event) {
      if (!event.dataTransfer.files.length) return;
      state.selectedReportFile = event.dataTransfer.files[0];
      ui.reportFilename.textContent = state.selectedReportFile.name;
    });

    ui.reportsBody.addEventListener("click", async function (event) {
      var downloadId = event.target.getAttribute("data-download-report");
      var deleteId = event.target.getAttribute("data-delete-report");
      if (downloadId) {
        await handleReportDownload(downloadId);
        return;
      }
      if (deleteId) {
        if (!window.confirm("Delete this report from your dashboard?")) return;
        try {
          await PatientAPI.deleteReport(deleteId);
          state.reports = await PatientAPI.reports();
          renderReportsTable(state.reports, "reportsBody");
          showToast("Report deleted.");
        } catch (err) {
          showToast(err.message, true);
        }
      }
    });
  }

  if (page === "overview") initOverview();
  if (page === "profile") initProfile();
  if (page === "history") initHistory();
  if (page === "reports") initReports();
})();
