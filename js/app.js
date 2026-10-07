// Event Registration & QR Portal Application Logic
(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY = 'event_registrations_qa_v1';
  const SETTINGS_KEY = 'event_settings_qa_v1';
  const THEME_KEY = 'event_theme_qa_v1';

  // Default Event Configuration
  const defaultSettings = {
    eventName: 'Global Innovation Summit 2026',
    dates: 'October 15 - 18, 2026',
    venue: 'Grand Expo Convention Centre, Hall 3',
    qrUrl: window.location.href.split('#')[0] // Defaults to current page
  };

  // Sample seed data to showcase the drafted roster
  const sampleAttendees = [
    {
      id: 'REG-2026-1042',
      fullName: 'Dr. Rajesh Mehta',
      email: 'rajesh.mehta@quantumtech.io',
      phone: '+91 98201 12345',
      visitDate: '2026-10-15',
      timeSlot: 'Morning (09:30 AM - 01:00 PM)',
      attendeeType: 'VIP / Delegate',
      organization: 'Quantum Systems Lab',
      guestCount: '2',
      purpose: 'Attend Keynotes & Workshops',
      city: 'Bengaluru',
      notes: 'VIP parking access requested',
      checkedIn: true,
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'REG-2026-1043',
      fullName: 'Pooja Venkatesh',
      email: 'pooja.v@nexushub.co',
      phone: '+91 97112 88492',
      visitDate: '2026-10-16',
      timeSlot: 'Afternoon (01:30 PM - 05:00 PM)',
      attendeeType: 'Exhibitor / Partner',
      organization: 'Nexus CleanTech',
      guestCount: '3',
      purpose: 'Business Networking & Partnerships',
      city: 'Mumbai',
      notes: 'Exhibitor booth #B14 setup',
      checkedIn: false,
      registeredAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'REG-2026-1044',
      fullName: 'Aryan Verma',
      email: 'aryan.verma@techuni.edu',
      phone: '+91 99580 33411',
      visitDate: '2026-10-17',
      timeSlot: 'Full Day Access (All Sessions)',
      attendeeType: 'Student / Academic',
      organization: 'National Institute of Technology',
      guestCount: '1',
      purpose: 'Explore Innovations & Tech Demos',
      city: 'New Delhi',
      notes: 'Student delegation pass',
      checkedIn: false,
      registeredAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  // State
  let attendees = [];
  let settings = Object.assign({}, defaultSettings);
  let activeTab = 'registerTab';
  let sidebarQrObj = null;
  let standeeQrObj = null;
  let badgeQrObj = null;

  // DOM Elements
  const elements = {
    // Tabs & Nav
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    attendeeBadgeCount: document.getElementById('attendeeBadgeCount'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Hero Header Displays
    navEventTitle: document.getElementById('navEventTitle'),
    heroEventTitle: document.getElementById('heroEventTitle'),
    heroDateDisplay: document.getElementById('heroDateDisplay'),
    heroVenueDisplay: document.getElementById('heroVenueDisplay'),

    // Form
    registrationForm: document.getElementById('registrationForm'),
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    visitDate: document.getElementById('visitDate'),
    timeSlot: document.getElementById('timeSlot'),
    organization: document.getElementById('organization'),
    guestCount: document.getElementById('guestCount'),
    purpose: document.getElementById('purpose'),
    city: document.getElementById('city'),
    notes: document.getElementById('notes'),
    termsCheck: document.getElementById('termsCheck'),
    btnFillSample: document.getElementById('btnFillSample'),
    btnDateToday: document.getElementById('btnDateToday'),
    btnDateTomorrow: document.getElementById('btnDateTomorrow'),
    btnDateWeekend: document.getElementById('btnDateWeekend'),

    // Sidebar
    sidebarQrCode: document.getElementById('sidebarQrCode'),
    btnSidebarCopyLink: document.getElementById('btnSidebarCopyLink'),
    btnGoToStandee: document.getElementById('btnGoToStandee'),

    // Standee Tab
    cfgEventName: document.getElementById('cfgEventName'),
    cfgEventDates: document.getElementById('cfgEventDates'),
    cfgVenue: document.getElementById('cfgVenue'),
    cfgQrUrl: document.getElementById('cfgQrUrl'),
    standeeDisplayTitle: document.getElementById('standeeDisplayTitle'),
    standeeDisplayDates: document.getElementById('standeeDisplayDates'),
    standeeDisplayVenue: document.getElementById('standeeDisplayVenue'),
    standeeQrBox: document.getElementById('standeeQrBox'),
    btnPrintStandee: document.getElementById('btnPrintStandee'),
    btnDownloadQrImage: document.getElementById('btnDownloadQrImage'),
    btnCopyStandeeLink: document.getElementById('btnCopyStandeeLink'),

    // Attendees Table Tab
    attendeesTableBody: document.getElementById('attendeesTableBody'),
    attendeeSearch: document.getElementById('attendeeSearch'),
    filterCategory: document.getElementById('filterCategory'),
    filterCheckinStatus: document.getElementById('filterCheckinStatus'),
    statTotalAttendees: document.getElementById('statTotalAttendees'),
    statCheckedIn: document.getElementById('statCheckedIn'),
    statTodayVisits: document.getElementById('statTodayVisits'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnClearData: document.getElementById('btnClearData'),

    // Pass Modal
    passModal: document.getElementById('passModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnModalCloseSecondary: document.getElementById('btnModalCloseSecondary'),
    btnPrintBadge: document.getElementById('btnPrintBadge'),
    badgeEventTitle: document.getElementById('badgeEventTitle'),
    badgeRegId: document.getElementById('badgeRegId'),
    badgeQrContainer: document.getElementById('badgeQrContainer'),
    badgeCategory: document.getElementById('badgeCategory'),
    badgeName: document.getElementById('badgeName'),
    badgeOrg: document.getElementById('badgeOrg'),
    badgeDate: document.getElementById('badgeDate'),
    badgeSlot: document.getElementById('badgeSlot'),
    badgeGuests: document.getElementById('badgeGuests'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // Helper: Format Date string YYYY-MM-DD
  function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Helper: Format Date to readable string
  function formatReadableDate(dateString) {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return dateString;
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconSvg = type === 'success' 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Load from Storage
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        attendees = JSON.parse(stored);
      } else {
        attendees = [...sampleAttendees];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        settings = Object.assign({}, defaultSettings, JSON.parse(storedSettings));
      }

      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
    } catch (e) {
      console.warn('Storage read error:', e);
      attendees = [...sampleAttendees];
    }
  }

  function saveAttendees() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
    } catch (e) {
      console.error('Storage write error:', e);
    }
    renderAttendeesTable();
    updateStats();
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage settings write error:', e);
    }
  }

  // Initialize QR Codes
  function initQrCodes() {
    const currentUrl = settings.qrUrl || window.location.href.split('#')[0];

    // 1. Sidebar QR (150x150)
    elements.sidebarQrCode.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      sidebarQrObj = new QRCode(elements.sidebarQrCode, {
        text: currentUrl,
        width: 150,
        height: 150,
        colorDark: '#0b0f19',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      // 2. Standee Poster QR (230x230)
      elements.standeeQrBox.innerHTML = '';
      standeeQrObj = new QRCode(elements.standeeQrBox, {
        text: currentUrl,
        width: 230,
        height: 230,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      console.warn('QRCode library not ready yet');
    }
  }

  function updateStandeeQr(newUrl) {
    const target = newUrl && newUrl.trim() ? newUrl.trim() : window.location.href.split('#')[0];
    if (standeeQrObj) {
      standeeQrObj.clear();
      standeeQrObj.makeCode(target);
    }
    if (sidebarQrObj) {
      sidebarQrObj.clear();
      sidebarQrObj.makeCode(target);
    }
  }

  // Generate Personalized Attendee Check-In QR
  function renderBadgeQr(attendee) {
    elements.badgeQrContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      const qrPayload = JSON.stringify({
        id: attendee.id,
        name: attendee.fullName,
        date: attendee.visitDate,
        type: attendee.attendeeType,
        guests: attendee.guestCount
      });

      badgeQrObj = new QRCode(elements.badgeQrContainer, {
        text: qrPayload,
        width: 100,
        height: 100,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  // Tab Switching
  function switchTab(tabId) {
    activeTab = tabId;
    elements.navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    elements.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    if (tabId === 'standeeTab') {
      // Refresh QR just in case dimensions changed
      const url = elements.cfgQrUrl.value || window.location.href.split('#')[0];
      updateStandeeQr(url);
    }
  }

  // Quick Date Helpers
  function setQuickDate(type) {
    const today = new Date();
    let target = new Date();

    if (type === 'today') {
      target = today;
    } else if (type === 'tomorrow') {
      target.setDate(today.getDate() + 1);
    } else if (type === 'weekend') {
      // Find upcoming Saturday
      const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      target.setDate(today.getDate() + daysUntilSaturday);
    }

    elements.visitDate.value = formatDateISO(target);

    // Update active style on pills
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    if (type === 'today') elements.btnDateToday.classList.add('active');
    if (type === 'tomorrow') elements.btnDateTomorrow.classList.add('active');
    if (type === 'weekend') elements.btnDateWeekend.classList.add('active');
  }

  // Fill Sample Form Data
  function fillSampleForm() {
    const sampleNames = ['Anil Singh', 'Rhea Chakraborty', 'Vikramaditya Roy', 'Sara Fernandes'];
    const sampleEmails = ['anil.singh@enterprise.in', 'rhea.c@designfoundry.org', 'v.roy@fintechsolutions.com', 'sara.f@globalcorp.com'];
    const sampleOrgs = ['Apex Innovations Ltd.', 'Creative Tech Studio', 'Nexus Ventures', 'Global Systems'];

    const idx = Math.floor(Math.random() * sampleNames.length);
    elements.fullName.value = sampleNames[idx];
    elements.email.value = sampleEmails[idx];
    elements.phone.value = '+91 98' + Math.floor(10000000 + Math.random() * 90000000);
    
    // Pick tomorrow
    const t = new Date();
    t.setDate(t.getDate() + 1);
    elements.visitDate.value = formatDateISO(t);

    elements.timeSlot.value = 'Morning (09:30 AM - 01:00 PM)';
    elements.organization.value = sampleOrgs[idx];
    elements.guestCount.value = '2';
    elements.city.value = 'Bengaluru';
    elements.notes.value = 'Need visitor car parking badge';

    // Pick a radio option
    const radios = document.querySelectorAll('input[name="attendeeType"]');
    if (radios.length > 1) {
      radios[1].checked = true; // VIP / Delegate
    }

    showToast('Sample details loaded into the registration form!', 'info');
  }

  // Handle Form Submission
  function handleRegistration(e) {
    e.preventDefault();

    const fullName = elements.fullName.value.trim();
    const email = elements.email.value.trim();
    const phone = elements.phone.value.trim();
    const visitDate = elements.visitDate.value;
    const timeSlot = elements.timeSlot.value;
    const organization = elements.organization.value.trim() || 'Individual Attendee';
    const guestCount = elements.guestCount.value;
    const purpose = elements.purpose.value;
    const city = elements.city.value.trim() || 'Local Visitor';
    const notes = elements.notes.value.trim();
    const attendeeTypeEl = document.querySelector('input[name="attendeeType"]:checked');
    const attendeeType = attendeeTypeEl ? attendeeTypeEl.value : 'General Visitor';

    if (!fullName || !email || !phone || !visitDate || !timeSlot) {
      alert('Please fill in all required fields (Name, Email, Phone, Visit Date, and Session Slot).');
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      elements.email.focus();
      return;
    }

    // Create New Attendee Record
    const regId = 'REG-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newAttendee = {
      id: regId,
      fullName,
      email,
      phone,
      visitDate,
      timeSlot,
      attendeeType,
      organization,
      guestCount,
      purpose,
      city,
      notes,
      checkedIn: false,
      registeredAt: new Date().toISOString()
    };

    // Prepend to list
    attendees.unshift(newAttendee);
    saveAttendees();

    // Show Digital Pass Modal
    openAttendeePassModal(newAttendee);

    // Reset Form
    elements.registrationForm.reset();
    setQuickDate('today');

    showToast(`Registration Successful! Pass #${regId} generated.`);
  }

  // Open Pass Modal
  function openAttendeePassModal(attendee) {
    elements.badgeEventTitle.textContent = settings.eventName;
    elements.badgeRegId.textContent = attendee.id;
    elements.badgeName.textContent = attendee.fullName;
    elements.badgeOrg.textContent = attendee.organization || 'Individual Visitor';
    elements.badgeCategory.textContent = attendee.attendeeType;
    elements.badgeDate.textContent = formatReadableDate(attendee.visitDate);
    elements.badgeSlot.textContent = attendee.timeSlot;
    elements.badgeGuests.textContent = attendee.guestCount + (attendee.guestCount === '1' ? ' Pass' : ' Passes');

    // Generate badge QR
    renderBadgeQr(attendee);

    elements.passModal.classList.add('active');
  }

  function closeAttendeePassModal() {
    elements.passModal.classList.remove('active');
  }

  // Toggle Check-in status
  function toggleCheckin(attendeeId) {
    const record = attendees.find(a => a.id === attendeeId);
    if (record) {
      record.checkedIn = !record.checkedIn;
      saveAttendees();
      showToast(record.checkedIn ? `${record.fullName} Checked In!` : `${record.fullName} marked Pending.`);
    }
  }

  // Delete Attendee
  function deleteAttendee(attendeeId) {
    if (confirm('Are you sure you want to remove this registration record?')) {
      attendees = attendees.filter(a => a.id !== attendeeId);
      saveAttendees();
      showToast('Registration deleted.');
    }
  }

  // Render Attendees Roster Table
  function renderAttendeesTable() {
    const query = elements.attendeeSearch.value.toLowerCase().trim();
    const catFilter = elements.filterCategory.value;
    const statusFilter = elements.filterCheckinStatus.value;

    const filtered = attendees.filter(a => {
      const matchQuery = !query || 
        a.fullName.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.phone.toLowerCase().includes(query) ||
        a.organization.toLowerCase().includes(query) ||
        a.id.toLowerCase().includes(query);

      const matchCategory = catFilter === 'ALL' || a.attendeeType === catFilter;
      const matchStatus = statusFilter === 'ALL' || 
        (statusFilter === 'Checked In' && a.checkedIn) ||
        (statusFilter === 'Pending' && !a.checkedIn);

      return matchQuery && matchCategory && matchStatus;
    });

    elements.attendeeBadgeCount.textContent = attendees.length;

    if (filtered.length === 0) {
      elements.attendeesTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--text-dim);">
            No matching registrations found. Register a visitor or adjust search filters.
          </td>
        </tr>
      `;
      return;
    }

    elements.attendeesTableBody.innerHTML = filtered.map(a => {
      let badgeClass = 'general';
      if (a.attendeeType.includes('VIP')) badgeClass = 'vip';
      else if (a.attendeeType.includes('Exhibitor')) badgeClass = 'exhibitor';
      else if (a.attendeeType.includes('Student')) badgeClass = 'student';

      const statusBtnClass = a.checkedIn ? 'checked' : 'pending';
      const statusText = a.checkedIn ? 'Checked In' : 'Pending Check-in';

      return `
        <tr>
          <td><strong style="font-family: monospace; color: var(--primary);">${a.id}</strong></td>
          <td>
            <strong>${escapeHtml(a.fullName)}</strong>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(a.city || '')}</div>
          </td>
          <td>
            <div>${formatReadableDate(a.visitDate)}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${escapeHtml(a.timeSlot)}</div>
          </td>
          <td>
            <div style="font-size: 0.82rem;">${escapeHtml(a.email)}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(a.phone)}</div>
          </td>
          <td>${escapeHtml(a.organization || '—')}</td>
          <td><span class="badge-tag ${badgeClass}">${escapeHtml(a.attendeeType)}</span></td>
          <td><span style="font-weight:600;">${a.guestCount || '1'}</span></td>
          <td>
            <button type="button" class="status-toggle-btn ${statusBtnClass}" data-action="toggle" data-id="${a.id}">
              ${statusText}
            </button>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" class="icon-btn" data-action="viewPass" data-id="${a.id}" title="View E-Badge" style="width: 28px; height: 28px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button type="button" class="icon-btn" data-action="delete" data-id="${a.id}" title="Remove entry" style="width: 28px; height: 28px; color: var(--danger);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Update Statistics
  function updateStats() {
    const total = attendees.length;
    const checked = attendees.filter(a => a.checkedIn).length;

    const todayStr = formatDateISO(new Date());
    const todayCount = attendees.filter(a => a.visitDate === todayStr).length;

    elements.statTotalAttendees.textContent = total;
    elements.statCheckedIn.textContent = checked;
    elements.statTodayVisits.textContent = todayCount;
  }

  // Export Attendees to CSV
  function exportAttendeesCSV() {
    if (attendees.length === 0) {
      alert('No attendees to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'Visit Date',
      'Time Slot',
      'Attendee Category',
      'Organization',
      'Number of Guests',
      'Purpose of Visit',
      'City',
      'Special Notes',
      'Checked In Status',
      'Registered Timestamp'
    ];

    const rows = attendees.map(a => [
      `"${a.id}"`,
      `"${(a.fullName || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${a.visitDate || ''}"`,
      `"${(a.timeSlot || '').replace(/"/g, '""')}"`,
      `"${(a.attendeeType || '').replace(/"/g, '""')}"`,
      `"${(a.organization || '').replace(/"/g, '""')}"`,
      `"${a.guestCount || '1'}"`,
      `"${(a.purpose || '').replace(/"/g, '""')}"`,
      `"${(a.city || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.checkedIn ? 'Yes' : 'No'}"`,
      `"${a.registeredAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-attendees-export-${formatDateISO(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exported attendee roster to CSV!');
  }

  // Download Standee QR code image
  function downloadQrImage() {
    const canvas = elements.standeeQrBox.querySelector('canvas');
    if (!canvas) {
      // Fallback for img tag
      const img = elements.standeeQrBox.querySelector('img');
      if (img && img.src) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'event-registration-qr.png';
        link.click();
        showToast('Downloaded QR code image!');
        return;
      }
      alert('Unable to capture QR canvas. Please try again.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${settings.eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded high-resolution QR code PNG!');
  }

  // Standee Settings Sync
  function updateEventSettings() {
    settings.eventName = elements.cfgEventName.value.trim() || defaultSettings.eventName;
    settings.dates = elements.cfgEventDates.value.trim() || defaultSettings.dates;
    settings.venue = elements.cfgVenue.value.trim() || defaultSettings.venue;
    settings.qrUrl = elements.cfgQrUrl.value.trim();

    // Sync UI elements
    elements.navEventTitle.textContent = settings.eventName;
    elements.heroEventTitle.textContent = settings.eventName;
    elements.heroDateDisplay.textContent = settings.dates;
    elements.heroVenueDisplay.textContent = settings.venue;

    elements.standeeDisplayTitle.textContent = settings.eventName;
    elements.standeeDisplayDates.textContent = settings.dates;
    elements.standeeDisplayVenue.textContent = settings.venue;

    updateStandeeQr(settings.qrUrl);
    saveSettings();
  }

  // Copy Link to clipboard
  function copyLinkToClipboard(url) {
    const linkToCopy = url || settings.qrUrl || window.location.href.split('#')[0];
    navigator.clipboard.writeText(linkToCopy).then(() => {
      showToast('Registration link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link:', linkToCopy);
    });
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Navigation Tabs
    elements.navTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      showToast(isLight ? 'Light theme activated' : 'Dark theme activated', 'info');
    });

    // Quick Date Pills
    elements.btnDateToday.addEventListener('click', () => setQuickDate('today'));
    elements.btnDateTomorrow.addEventListener('click', () => setQuickDate('tomorrow'));
    elements.btnDateWeekend.addEventListener('click', () => setQuickDate('weekend'));

    // Sample Fill Button
    elements.btnFillSample.addEventListener('click', fillSampleForm);

    // Registration Form Submit
    elements.registrationForm.addEventListener('submit', handleRegistration);

    // Sidebar buttons
    elements.btnSidebarCopyLink.addEventListener('click', () => copyLinkToClipboard());
    elements.btnGoToStandee.addEventListener('click', () => switchTab('standeeTab'));

    // Standee Customizer Inputs
    elements.cfgEventName.addEventListener('input', updateEventSettings);
    elements.cfgEventDates.addEventListener('input', updateEventSettings);
    elements.cfgVenue.addEventListener('input', updateEventSettings);
    elements.cfgQrUrl.addEventListener('input', updateEventSettings);

    // Standee Actions
    elements.btnPrintStandee.addEventListener('click', () => window.print());
    elements.btnDownloadQrImage.addEventListener('click', downloadQrImage);
    elements.btnCopyStandeeLink.addEventListener('click', () => copyLinkToClipboard());

    // Attendees Table Actions
    elements.attendeeSearch.addEventListener('input', renderAttendeesTable);
    elements.filterCategory.addEventListener('change', renderAttendeesTable);
    elements.filterCheckinStatus.addEventListener('change', renderAttendeesTable);
    elements.btnExportCsv.addEventListener('click', exportAttendeesCSV);

    elements.btnClearData.addEventListener('click', () => {
      if (confirm('Reset attendees list back to the default sample records?')) {
        attendees = [...sampleAttendees];
        saveAttendees();
        showToast('Reset to initial sample entries.');
      }
    });

    // Table Row Action delegation
    elements.attendeesTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const action = target.dataset.action;
      const id = target.dataset.id;

      if (action === 'toggle') {
        toggleCheckin(id);
      } else if (action === 'viewPass') {
        const attendee = attendees.find(a => a.id === id);
        if (attendee) openAttendeePassModal(attendee);
      } else if (action === 'delete') {
        deleteAttendee(id);
      }
    });

    // Modal Actions
    elements.btnCloseModal.addEventListener('click', closeAttendeePassModal);
    elements.btnModalCloseSecondary.addEventListener('click', closeAttendeePassModal);
    elements.passModal.addEventListener('click', (e) => {
      if (e.target === elements.passModal) closeAttendeePassModal();
    });
    elements.btnPrintBadge.addEventListener('click', () => window.print());

    // Sync input min date to today
    elements.visitDate.min = formatDateISO(new Date());
  }

  // Initialize
  function init() {
    loadState();

    // Populate Standee Inputs from state
    elements.cfgEventName.value = settings.eventName;
    elements.cfgEventDates.value = settings.dates;
    elements.cfgVenue.value = settings.venue;
    elements.cfgQrUrl.value = settings.qrUrl || window.location.href.split('#')[0];

    updateEventSettings();
    initQrCodes();

    // Set default date to today
    setQuickDate('today');

    // Initial render
    renderAttendeesTable();
    updateStats();
    setupEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
