(function () {
  "use strict";

  var user = DoctorSession.requireDoctorAuth();
  if (!user) return;
  DoctorShell.init(user);

  var page = document.body.getAttribute("data-page");
  var state = {
    profile: null,
    notifications: []
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

  async function refreshNotificationBadge() {
    var badge = $("navNotificationCount");
    if (!badge) return;
    try {
      state.notifications = await DoctorAPI.notifications(true);
      if (state.notifications.length) {
        badge.textContent = state.notifications.length;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (err) {
      badge.hidden = true;
    }
  }

  function renderNotifications(mountId, rows, limit) {
    var mount = $(mountId);
    if (!mount) return;
    var list = limit ? rows.slice(0, limit) : rows;
    if (!list.length) {
      mount.innerHTML = '<div class="empty-state">No notifications right now.</div>';
      return;
    }
    mount.innerHTML = list.map(function (item) {
      return '<article class="list-item' + (item.isRead ? "" : " unread") + '">' +
        '<div class="list-item-main">' +
          '<div class="row-title">' + esc(item.title) + '</div>' +
          '<div class="row-sub pre-wrap">' + esc(item.message) + '</div>' +
          '<div class="list-meta">' + esc(DoctorUtil.formatRelativeTime(item.createdAt)) + '</div>' +
        '</div>' +
        (!item.isRead ? '<button class="btn btn-ghost btn-sm" data-read="' + item.notificationId + '" type="button">Mark read</button>' : '') +
      '</article>';
    }).join("");
  }

  async function initOverview() {
    try {
      var responses = await Promise.all([
        DoctorAPI.dashboard(),
        DoctorAPI.myPatients(),
        DoctorAPI.notifications()
      ]);
      var stats = responses[0];
      var recentPatients = responses[1] || [];
      state.notifications = responses[2] || [];

      $("statGrid").innerHTML = [
        card("Patients treated", stats.patientsTreated, "Unique patients"),
        card("Total visits", stats.totalVisits, "All recorded consultations"),
        card("Visits today", stats.visitsToday, "Recorded today"),
        card("Diagnoses this week", stats.diagnosesThisWeek, "Last 7 days"),
        card("Prescriptions this week", stats.prescriptionsThisWeek, "Last 7 days")
      ].join("");

      renderPatientsTable("recentPatientsBody", recentPatients.slice(0, 5));
      renderNotifications("notificationList", state.notifications, 4);
    } catch (err) {
      $("statGrid").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
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

  async function initSearch() {
    var form = $("searchForm");
    var body = $("searchResults");
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

      $("patientContent").innerHTML =
        '<div class="card"><div class="card-title">History</div><div class="timeline">' + renderVisitTimeline(visits, diagnoses) + '</div></div>' +
        '<div class="card"><div class="card-title">Reports</div>' + renderReportList(reports) + '</div>' +
        '<div class="card"><div class="card-title">Prescriptions</div>' + renderPrescriptionList(prescriptions) + '</div>';

      $("patientContent").addEventListener("click", async function (event) {
        var reportId = event.target.getAttribute("data-report-download");
        if (!reportId) return;
        try {
          var file = await DoctorAPI.downloadReport(reportId);
          DoctorUtil.downloadBlob(file.blob, file.fileName || ("report-" + reportId));
        } catch (err) {
          showToast(err.message, true);
        }
      });
    } catch (err) {
      $("patientContent").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
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
      return '<div class="timeline-item"><div class="timeline-head"><b>Visit #' + esc(visit.visitId) + '</b><span class="timeline-date">' + esc(DoctorUtil.formatDate(visit.visitDate)) + '</span></div><div class="timeline-body">' + esc(visit.notes || "No notes added.") + '</div>' + (items.length ? '<div class="timeline-tags">' + items.map(function (d) { return '<span class="badge ok">' + esc(d.diagnosisTitle) + '</span>'; }).join("") + '</div>' : '') + '</div>';
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
      return '<article class="list-item"><div class="list-item-main"><div class="row-title">Prescription #' + esc(row.prescriptionId) + '</div><div class="row-sub">' + esc((row.prescriptionText || "").slice(0, 140)) + '</div></div></article>';
    }).join("") + '</div>';
  }

  async function initCreateVisit() {
    var patientId = queryParam("patientId");
    if (patientId) {
      try {
        var patient = await DoctorAPI.getPatient(patientId);
        $("patientSummary").textContent = joinName(patient) + " • " + patient.aarogyamId;
        $("patientId").value = patient.patientId;
      } catch (err) {
        $("flowAlert").textContent = err.message;
        $("flowAlert").hidden = false;
      }
    }

    try {
      var diagnosisTypes = await DoctorAPI.diagnosisTypes();
      $("diagnosisTypeId").innerHTML = '<option value="">Select diagnosis type</option>' + diagnosisTypes.map(function (row) {
        return '<option value="' + row.diagnosisTypeId + '">' + esc(row.diagnosisTypeName) + '</option>';
      }).join("");
    } catch (err) {}

    // Stepper & Wizard transitions
    var currentStep = 1;
    var stepsCount = 4;

    function showStep(stepNum) {
      currentStep = stepNum;
      for (var i = 1; i <= stepsCount; i++) {
        var container = $("step" + i);
        if (container) {
          if (i === stepNum) {
            container.style.display = "block";
            container.style.opacity = "0";
            setTimeout(function (c) {
              c.style.opacity = "1";
            }, 50, container);
          } else {
            container.style.display = "none";
          }
        }
      }

      // Update stepper chips
      var stepper = $("visitFlowStepper");
      if (stepper) {
        var chips = stepper.querySelectorAll(".chip");
        chips.forEach(function (chip, index) {
          if (index + 1 === stepNum) {
            chip.classList.add("on");
          } else {
            chip.classList.remove("on");
          }
        });
      }
      
      // Clear alert on step change
      $("flowAlert").hidden = true;
    }

    // Step 1: Next
    $("btnNext1").addEventListener("click", function () {
      if (!$("patientId").checkValidity() || !$("visitDate").checkValidity()) {
        $("visitFlowForm").reportValidity();
        return;
      }
      showStep(2);
    });

    // Step 2: Back, Skip, Next
    $("btnBack2").addEventListener("click", function () {
      showStep(1);
    });
    $("btnSkip2").addEventListener("click", function () {
      $("diagnosisTypeId").value = "";
      $("diagnosisTitle").value = "";
      $("diagnosisDate").value = "";
      $("diagnosisDescription").value = "";
      showStep(3);
    });
    $("btnNext2").addEventListener("click", function () {
      if ($("diagnosisTitle").value.trim() && !$("diagnosisTypeId").value) {
        $("flowAlert").textContent = "Please select a diagnosis type for the entered title.";
        $("flowAlert").hidden = false;
        return;
      }
      showStep(3);
    });

    // Step 3: Back, Skip, Next
    $("btnBack3").addEventListener("click", function () {
      showStep(2);
    });
    $("btnSkip3").addEventListener("click", function () {
      $("prescriptionDate").value = "";
      $("prescriptionText").value = "";
      showStep(4);
    });
    $("btnNext3").addEventListener("click", function () {
      showStep(4);
    });

    // Step 4: Back, Skip
    $("btnBack4").addEventListener("click", function () {
      showStep(3);
    });
    $("btnSkip4").addEventListener("click", function () {
      $("reportTitle").value = "";
      $("reportType").value = "";
      $("reportDate").value = "";
      $("reportFile").value = "";
      $("visitFlowForm").dispatchEvent(new Event("submit", { cancelable: true }));
    });

    $("visitFlowForm").addEventListener("submit", async function (event) {
      event.preventDefault();
      $("flowAlert").hidden = true;
      var patientIdVal = Number($("patientId").value);
      if (!patientIdVal) {
        $("flowAlert").textContent = "Please choose a patient first.";
        $("flowAlert").hidden = false;
        showStep(1);
        return;
      }
      if (!$("visitDate").value) {
        $("flowAlert").textContent = "Please select a visit date.";
        $("flowAlert").hidden = false;
        showStep(1);
        return;
      }

      var submitBtn = event.target.querySelector("button[type='submit']");
      var originalBtnText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
      }

      try {
        var visit = await DoctorAPI.createVisit({
          patientId: patientIdVal,
          visitDate: $("visitDate").value,
          notes: $("visitNotes").value.trim()
        });

        var diagnosisId = null;
        if ($("diagnosisTitle").value.trim()) {
          var diagnosis = await DoctorAPI.createDiagnosis({
            visitId: visit.visitId,
            diagnosisTypeId: Number($("diagnosisTypeId").value),
            diagnosisTitle: $("diagnosisTitle").value.trim(),
            description: $("diagnosisDescription").value.trim(),
            diagnosisDate: $("diagnosisDate").value || null
          });
          diagnosisId = diagnosis.diagnosisId;
        }

        if ($("prescriptionText").value.trim()) {
          await DoctorAPI.createPrescription({
            visitId: visit.visitId,
            diagnosisId: diagnosisId,
            prescriptionText: $("prescriptionText").value.trim(),
            prescriptionDate: $("prescriptionDate").value || null
          });
        }

        if ($("reportFile").files[0]) {
          var formData = new FormData();
          formData.append("PatientId", patientIdVal);
          formData.append("VisitId", visit.visitId);
          if (diagnosisId) formData.append("DiagnosisId", diagnosisId);
          formData.append("Title", $("reportTitle").value.trim() || "Visit report");
          formData.append("ReportType", $("reportType").value.trim() || "Clinical");
          if ($("reportDate").value) formData.append("ReportDate", $("reportDate").value);
          formData.append("File", $("reportFile").files[0]);
          await DoctorAPI.uploadReport(formData);
        }

        showToast("Visit flow completed successfully.");
        setTimeout(function () {
          window.location.href = "patient.html?patientId=" + patientIdVal;
        }, 900);
      } catch (err) {
        $("flowAlert").textContent = err.message;
        $("flowAlert").hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  async function initNotifications() {
    try {
      state.notifications = await DoctorAPI.notifications();
      renderNotifications("notificationList", state.notifications);
      $("notificationList").addEventListener("click", async function (event) {
        var id = event.target.getAttribute("data-read");
        if (!id) return;
        try {
          await DoctorAPI.markNotificationRead(id);
          state.notifications = await DoctorAPI.notifications();
          renderNotifications("notificationList", state.notifications);
          refreshNotificationBadge();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    } catch (err) {
      $("notificationList").innerHTML = '<div class="form-alert error">' + esc(err.message) + '</div>';
    }
  }

  loadSharedProfile().then(refreshNotificationBadge);
  if (page === "overview") initOverview();
  if (page === "search") initSearch();
  if (page === "patients") initMyPatients();
  if (page === "patient") initPatientDetail();
  if (page === "create-visit") initCreateVisit();
  if (page === "notifications") initNotifications();
})();
