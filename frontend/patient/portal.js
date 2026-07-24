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
    notifications: [],
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

  async function refreshUnreadBadge() {
    var badge = $("navNotificationCount");
    if (!badge) return;
    try {
      var unread = await PatientAPI.notifications(true);
      if (unread.length) {
        badge.textContent = unread.length;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (err) {
      badge.hidden = true;
    }
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
      '<div class="cap">Blood group</div>' +
      '<div>' + esc(profile.bloodGroup || "Not set") + '</div>' +
      '<div class="cap card-cap-spaced">Emergency contact</div>' +
      '<div>' + esc(profile.emergencyContact || "Not added") + '</div>';
  }

  function wireModalCloseButtons() {
    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        setModalOpen($(button.getAttribute("data-close-modal")), false);
      });
    });
  }

  function renderOverviewStats(stats) {
    var statGrid = $("statGrid");
    if (!statGrid) return;
    var cards = [
      { label: "Total visits", value: stats.totalVisits, note: stats.lastVisitDate ? "Last visit " + PatientUtil.formatDate(stats.lastVisitDate) : "No visits yet" },
      { label: "Diagnoses", value: stats.totalDiagnoses, note: "Across your full medical history" },
      { label: "Prescriptions", value: stats.totalPrescriptions, note: "Issued during consultations" },
      { label: "Reports", value: stats.totalReports, note: stats.reportsThisMonth + " added this month" },
      { label: "Unread alerts", value: stats.unreadNotifications, note: "Notifications waiting for review", warn: stats.unreadNotifications > 0 }
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
    if (!visits.length && !diagnoses.length) {
      mount.innerHTML = '<div class="empty-state">No visits or diagnoses have been added yet.</div>';
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
          '<b>Visit #' + esc(visit.visitId) + '</b>' +
          '<span class="timeline-date">' + esc(PatientUtil.formatDate(visit.visitDate)) + '</span>' +
        '</div>' +
        '<div class="timeline-body">' + esc(visit.notes || "Consultation notes were not added for this visit.") + '</div>' +
        (tags ? '<div class="timeline-tags">' + tags + '</div>' : "") +
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

  function renderPrescriptionsTable(rows, mountId) {
    var mount = $(mountId);
    if (!mount) return;
    if (!rows.length) {
      mount.innerHTML = '<tr><td colspan="4" class="table-empty">No prescriptions available yet.</td></tr>';
      return;
    }
    mount.innerHTML = rows.map(function (prescription) {
      return '<tr>' +
        '<td><div class="row-title">Prescription #' + esc(prescription.prescriptionId) + '</div><div class="row-sub">' + esc((prescription.prescriptionText || "").slice(0, 110) || "Prescription note") + '</div></td>' +
        '<td>' + esc(PatientUtil.formatDate(prescription.prescriptionDate)) + '</td>' +
        '<td>#' + esc(prescription.visitId) + '</td>' +
        '<td class="actions">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-view-prescription="' + prescription.prescriptionId + '">View</button>' +
          '<button class="btn btn-solid btn-sm" type="button" data-download-prescription="' + prescription.prescriptionId + '">Download</button>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  function renderNotificationsList(rows, mountId, limit) {
    var mount = $(mountId);
    if (!mount) return;
    var list = limit ? rows.slice(0, limit) : rows;
    if (!list.length) {
      mount.innerHTML = '<div class="empty-state">You are all caught up.</div>';
      return;
    }
    mount.innerHTML = list.map(function (item) {
      return '<article class="list-item' + (item.isRead ? "" : " unread") + '">' +
        '<div class="list-item-main">' +
          '<div class="row-title">' + esc(item.title) + '</div>' +
          '<div class="row-sub pre-wrap">' + esc(item.message) + '</div>' +
          '<div class="list-meta">' + esc(PatientUtil.formatRelativeTime(item.createdAt)) + '</div>' +
        '</div>' +
        (!item.isRead ? '<button class="btn btn-ghost btn-sm" type="button" data-read-notification="' + item.notificationId + '">Mark read</button>' : '') +
      '</article>';
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
          detailCell("Visit", "#" + detail.visitId) +
          detailCell("Diagnosis", detail.diagnosisTitle || "Not linked") +
          detailCell("Patient", detail.patientName, true) +
          detailCell("Prescription", detail.prescriptionText || "No prescription text.", true) +
        '</div>';
    } catch (err) {
      content.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
  }

  async function initOverview() {
    ui = {
      statGrid: $("statGrid"),
      timelineList: $("timelineList"),
      notificationList: $("notificationList")
    };
    try {
      var responses = await Promise.all([
        PatientAPI.dashboard(),
        PatientAPI.profile(),
        PatientAPI.visits(),
        PatientAPI.diagnoses(),
        PatientAPI.notifications()
      ]);
      state.profile = responses[1];
      state.visits = responses[2] || [];
      state.diagnoses = responses[3] || [];
      state.notifications = responses[4] || [];

      renderOverviewStats(responses[0]);
      renderProfileBadge(state.profile);
      $("welcomeHeading").textContent = "Good day, " + state.profile.firstName;
      $("profileName").textContent = joinName(state.profile);
      $("profileMeta").textContent = "Aarogyam ID " + state.profile.aarogyamId + " • " + state.profile.gender + " • DOB " + PatientUtil.formatDate(state.profile.dateOfBirth);
      $("patientInitials").textContent = PatientUtil.initials(state.profile.firstName, state.profile.lastName);
      $("profileDetails").innerHTML = [
        detailCell("Blood group", state.profile.bloodGroup || "Not set"),
        detailCell("Emergency contact", state.profile.emergencyContact || "Not added"),
        detailCell("Address", state.profile.address || "Not added", true),
        detailCell("Member since", PatientUtil.formatDate(state.profile.createdAt))
      ].join("");
      renderTimeline(state.visits, state.diagnoses, 5, "timelineList");
      renderNotificationsList(state.notifications, "notificationList", 4);
      renderHealthCardBlock(state.profile, "healthCardInfo");
      loadQrImage();
    } catch (err) {
      ui.statGrid.innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
      ui.timelineList.innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
      ui.notificationList.innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
    }
  }

  async function initProfile() {
    ui = {
      profileAlert: $("profileAlert"),
      passwordAlert: $("passwordAlert"),
      profileForm: $("profileForm"),
      passwordForm: $("passwordForm"),
      countryId: $("countryId"),
      stateId: $("stateId"),
      cityId: $("cityId")
    };

    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.countries()
      ]);
      state.profile = responses[0];
      renderProfileBadge(state.profile);
      populateProfileForm(state.profile, responses[1]);
      await populateStateOptions(state.profile.countryId, state.profile.stateId);
      await populateCityOptions(state.profile.stateId, state.profile.cityId);
    } catch (err) {
      ui.profileAlert.textContent = err.message;
      ui.profileAlert.hidden = false;
    }

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

  function populateProfileForm(profile, countries) {
    $("aarogyamIdValue").textContent = profile.aarogyamId;
    $("firstName").value = profile.firstName || "";
    $("middleName").value = profile.middleName || "";
    $("lastName").value = profile.lastName || "";
    $("dateOfBirth").value = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "";
    $("gender").value = profile.gender || "";
    $("bloodGroup").value = profile.bloodGroup || "";
    $("address").value = profile.address || "";
    $("emergencyContact").value = profile.emergencyContact || "";
    $("countryId").innerHTML = '<option value="">Select country</option>' + countries.map(function (item) {
      return '<option value="' + item.countryId + '"' + (item.countryId === profile.countryId ? " selected" : "") + '>' + esc(item.countryName) + '</option>';
    }).join("");
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
    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.visits(),
        PatientAPI.diagnoses(),
        PatientAPI.diagnosisTypes()
      ]);
      state.profile = responses[0];
      state.visits = responses[1] || [];
      state.diagnoses = responses[2] || [];
      renderProfileBadge(state.profile);
      renderHistoryPage(state.visits, state.diagnoses, responses[3] || []);
    } catch (err) {
      $("historyTimeline").innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
    }
  }

  function renderHistoryPage(visits, diagnoses, diagnosisTypes) {
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
        var matchesTerm = !term || item.diagnosisTitle.toLowerCase().indexOf(term) >= 0 || String(item.visitId).indexOf(term) >= 0 || (item.description || "").toLowerCase().indexOf(term) >= 0;
        return matchesType && matchesTerm;
      });
      var allowedVisitIds = {};
      filteredDiagnoses.forEach(function (item) { allowedVisitIds[item.visitId] = true; });
      var filteredVisits = term || typeId
        ? visits.filter(function (visit) {
            return allowedVisitIds[visit.visitId] || String(visit.visitId).indexOf(term) >= 0 || (visit.notes || "").toLowerCase().indexOf(term) >= 0;
          })
        : visits;
      renderTimeline(filteredVisits, filteredDiagnoses, filteredVisits.length, "historyTimeline");
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
      ui.reportVisitId.innerHTML = '<option value="">None</option>' + state.visits.map(function (visit) {
        return '<option value="' + visit.visitId + '">Visit #' + visit.visitId + ' • ' + esc(PatientUtil.formatDate(visit.visitDate)) + '</option>';
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

  async function initPrescriptions() {
    wireModalCloseButtons();
    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.prescriptions()
      ]);
      state.profile = responses[0];
      state.prescriptions = responses[1] || [];
      renderProfileBadge(state.profile);
      renderPrescriptionsTable(state.prescriptions, "prescriptionsBody");
    } catch (err) {
      $("prescriptionsBody").innerHTML = '<tr><td colspan="4" class="table-empty">' + esc(err.message) + '</td></tr>';
    }

    $("prescriptionsBody").addEventListener("click", async function (event) {
      var viewId = event.target.getAttribute("data-view-prescription");
      var downloadId = event.target.getAttribute("data-download-prescription");
      if (viewId) await openPrescription(viewId);
      if (downloadId) await handlePrescriptionDownload(downloadId);
    });
    $("downloadPrescriptionBtn").addEventListener("click", function () {
      if (state.currentPrescriptionId) handlePrescriptionDownload(state.currentPrescriptionId);
    });
  }

  async function initNotifications() {
    try {
      var responses = await Promise.all([
        PatientAPI.profile(),
        PatientAPI.notifications()
      ]);
      state.profile = responses[0];
      state.notifications = responses[1] || [];
      renderProfileBadge(state.profile);
      renderNotificationsList(state.notifications, "notificationList");
    } catch (err) {
      $("notificationList").innerHTML = '<div class="empty-state">' + esc(err.message) + '</div>';
    }

    $("notificationList").addEventListener("click", async function (event) {
      var notificationId = event.target.getAttribute("data-read-notification");
      if (!notificationId) return;
      try {
        await PatientAPI.markNotificationRead(notificationId);
        state.notifications = await PatientAPI.notifications();
        renderNotificationsList(state.notifications, "notificationList");
        refreshUnreadBadge();
        showToast("Notification marked as read.");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  async function initHealthCard() {
    try {
      state.profile = await PatientAPI.profile();
      renderProfileBadge(state.profile);
      $("healthCardName").textContent = joinName(state.profile);
      $("healthCardAarogyamId").textContent = state.profile.aarogyamId;
      $("healthCardDob").textContent = PatientUtil.formatDate(state.profile.dateOfBirth);
      $("healthCardGender").textContent = state.profile.gender || "—";
      $("healthCardBloodGroup").textContent = state.profile.bloodGroup || "Not set";
      $("healthCardEmergency").textContent = state.profile.emergencyContact || "Not added";
      loadQrImage();
    } catch (err) {
      $("healthCardError").textContent = err.message;
      $("healthCardError").hidden = false;
    }
  }

  refreshUnreadBadge();

  if (page === "overview") initOverview();
  if (page === "profile") initProfile();
  if (page === "history") initHistory();
  if (page === "reports") initReports();
  if (page === "prescriptions") initPrescriptions();
  if (page === "notifications") initNotifications();
  if (page === "health-card") initHealthCard();
})();
