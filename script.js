(function () {
  "use strict";
  var doc = document;
  var dialog = doc.getElementById("contact-dialog");
  var dialogTitle = doc.getElementById("dialog-title");
  var dialogValue = doc.getElementById("dialog-value");
  var dialogOpen = doc.getElementById("dialog-open");
  var copyBtn = doc.getElementById("copy-contact");
  var toast = doc.getElementById("toast");
  var toastTimer;

  doc.getElementById("year").textContent = new Date().getFullYear();

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2300);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      try {
        var field = doc.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;opacity:0;left:-9999px";
        doc.body.appendChild(field);
        field.select();
        var copied = doc.execCommand("copy");
        doc.body.removeChild(field);
        copied ? resolve() : reject();
      } catch (error) { reject(error); }
    });
  }

  function openContactSheet(kind, value, href) {
    var isPhone = kind === "tel";
    dialogTitle.textContent = isPhone ? "Liên hệ qua điện thoại" : "Gửi email";
    dialogValue.textContent = value;
    dialogOpen.textContent = isPhone ? "Gọi điện" : "Mở ứng dụng email";
    dialogOpen.href = href;
    copyBtn.textContent = isPhone ? "Sao chép số điện thoại" : "Sao chép địa chỉ email";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.location.href = href;
    }
  }

  // Trình duyệt tích hợp (Facebook, Zalo, Instagram, TikTok, Messenger, WebView...)
  var ua = navigator.userAgent || "";
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|Zalo|Line\/|musical_ly|BytedanceWebview|TikTok|Messenger|; wv\)/i.test(ua) ||
    (/iPhone|iPad|iPod/.test(ua) && !/Safari/i.test(ua));

  if (inApp) {
    doc.querySelectorAll("[data-kind]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        openContactSheet(link.dataset.kind, link.dataset.copy, link.href);
      });
    });
  }

  copyBtn.addEventListener("click", function () {
    copyText(dialogValue.textContent).then(function () {
      notify("Đã sao chép: " + dialogValue.textContent);
    }).catch(function () {
      notify("Không thể tự sao chép. Hãy nhấn giữ thông tin để sao chép.");
    });
  });
  doc.getElementById("close-dialog").addEventListener("click", function () {
    dialog.close();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  // ---------- QR Code + chia sẻ danh thiếp ----------
  var pageUrl = "https://linhmkey.vercel.app";
  var qrBox = doc.getElementById("qrcode");
  function buildQR() {
    if (typeof QRCode === "undefined") return false;
    new QRCode(qrBox, { text: pageUrl, width: 180, height: 180, colorDark: "#2b1a12", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return true;
  }
  window.addEventListener("load", function () { if (!buildQR()) qrBox.textContent = "Không tải được mã QR"; });

  doc.getElementById("share-btn").addEventListener("click", function () {
    var data = { title: "Hoàng Linh – Coffee & Homestay", text: "Danh thiếp Hoàng Linh – Coffee & Homestay", url: pageUrl };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else {
      copyText(pageUrl).then(function () { notify("Đã sao chép liên kết danh thiếp"); })
        .catch(function () { notify("Không thể sao chép liên kết"); });
    }
  });

  doc.getElementById("vcard-btn").addEventListener("click", function () {
    var vcf = ["BEGIN:VCARD", "VERSION:3.0", "FN:Hoàng Linh", "N:Linh;Hoàng;;;",
      "ORG:Coffee & Homestay", "TEL;TYPE=CELL:+84943919441", "EMAIL:linhmkey@gmail.com",
      "URL:" + pageUrl, "ADR;TYPE=WORK:;;;Phan Thiết;Lâm Đồng;;Việt Nam", "END:VCARD"].join("\r\n");
    var url = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
    var a = doc.createElement("a");
    a.href = url; a.download = "Hoang-Linh.vcf";
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    notify("Đang tải danh bạ (.vcf)");
  });

  // ---------- Bản đồ các địa điểm ----------
  var places = [
    { name: "Tiệm Cà Phê Đường Chân Trời", sub: "Cà phê · Phan Thiết", chip: "coffee", icon: "i-cup",
      lat: 10.9195558, lng: 108.1095249, link: "https://maps.app.goo.gl/zKN1n9P2eEZxecHb9" },
    { name: "Thoai Mai House", sub: "Homestay · Phan Thiết", chip: "stay", icon: "i-home",
      lat: 10.9218568, lng: 108.1107783, link: "https://maps.app.goo.gl/8qpAkwWy48XY8FFG8" },
    { name: "Thoai Mai House – Căn view biển", sub: "Hẻm 40 Lê Lợi · Hướng biển", chip: "sea", icon: "i-wave",
      lat: 10.9191394, lng: 108.1092872, link: "https://maps.app.goo.gl/hQvQ3Gurq7GXXRLp6" }
  ];
  var mapTabs = doc.querySelectorAll(".map-tab");
  var mapFrame = doc.getElementById("map-frame");
  function showPlace(i) {
    var p = places[i];
    mapTabs.forEach(function (tab, idx) {
      var on = idx === i;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    mapFrame.title = "Bản đồ " + p.name;
    mapFrame.src = "https://www.google.com/maps?q=" + p.lat + "," + p.lng + "&z=17&hl=vi&output=embed";
    doc.getElementById("map-name").textContent = p.name;
    doc.getElementById("map-sub").textContent = p.sub;
    var chip = doc.getElementById("map-chip");
    chip.className = "chip " + p.chip;
    chip.querySelector("use").setAttribute("href", "#" + p.icon);
    doc.getElementById("map-open").href = p.link;
    doc.getElementById("map-route").href = "https://www.google.com/maps/dir/?api=1&destination=" + p.lat + "," + p.lng;
  }
  mapTabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { showPlace(idx); });
  });

})();
