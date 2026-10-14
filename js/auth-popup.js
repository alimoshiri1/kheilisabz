(function () {
  var API = window.CONFIG.API;
  var STATIC = window.CONFIG.STATIC;
  function getLocalUsers() {
    try {
      return JSON.parse(localStorage.getItem("users") || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveLocalUser(phone, name) {
    var users = getLocalUsers();
    var found = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].phone === phone) found = users[i];
    }
    if (found) found.name = name;
    else users.push({ phone: phone, name: name });
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch (e) {}
  }
  var DEMO_CODE = "1234";
  var DEMO_CODE_FA = "۱۲۳۴";
  var step = 1;
  var phone = "";
  var isNew = false;
  var userId = null;
  var oldName = "";
  var timerId = null;

  function $(sel) {
    return document.querySelector(sel);
  }
  function toEn(s) {
    return String(s == null ? "" : s).replace(/[\u06F0-\u06F9]/g, function (d) {
      return String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48);
    });
  }
  function digits(s) {
    return toEn(s).replace(/\D/g, "");
  }
  function faDigits(s) {
    return String(s == null ? "" : s).replace(/[0-9]/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹"[+d];
    });
  }
  function showErr(msg) {
    var box = $("#login-error");
    if (!box) return;
    $("#login-error-text").textContent = msg;
    box.classList.remove("hidden");
  }
  function hideErr() {
    var box = $("#login-error");
    if (box) box.classList.add("hidden");
  }
  function spin(btn, on) {
    if (btn) btn.disabled = !!on;
  }

  /* ---------------- step 1: phone ---------------- */
  var phoneInput = $("#PhoneNumber");
  var getCodeBtn = $("#getCode");

  phoneInput.addEventListener("input", function () {
    phoneInput.value = digits(phoneInput.value).slice(0, 11);
    getCodeBtn.disabled = phoneInput.value.length !== 11;
    hideErr();
  });

  /* ---------------- step 2: code + name ---------------- */
  function startTimer() {
    stopTimer();
    var left = 120;
    var text = $("#timer-text");
    function tick() {
      if (!text) return;
      var m = Math.floor(left / 60);
      var s = left % 60;
      text.textContent = faDigits((m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s));
      if (left <= 0) {
        stopTimer();
        var t = $("#timer");
        if (t) t.classList.add("hidden");
        var rs = $("#codeResend");
        if (rs) rs.classList.remove("hidden");
        return;
      }
      left--;
    }
    tick();
    timerId = window.setInterval(tick, 1000);
  }
  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }

  function renderStep2() {
    $("#login-label").textContent = "کد تایید";
    $("#login-sub").innerHTML =
      "کد اعتبارسنجی برای شماره " + faDigits(phone) + " ارسال شد.";

    var nameHtml = isNew
      ? '<div class="form-group w-70 m-auto relative">' +
        '<p class="mb-5">نام خود را وارد کنید.</p>' +
        '<input type="text" class="effect-2" placeholder="نام و نام خانوادگی" autocomplete="off" id="Name" name="Name" value="">' +
        '<span class="focus-border"></span>' +
        "</div>"
      : "";

    $("#mobile_wrapper").innerHTML =
      '<div class="form-group w-70 m-auto relative">' +
      '<p class="mb-5">کد اعتبارسنجی را وارد کنید.</p>' +
      '<input type="text" class="effect-2" placeholder="۱۲۳۴" autocomplete="off" id="Code" name="Code" value="" inputmode="numeric" maxlength="4">' +
      '<span class="focus-border"></span>' +
      "</div>" +
      nameHtml +
      '<div class="timer" id="timer"><span id="timer-text"></span><div class="jst-clearDiv"></div></div>' +
      '<a class="hidden" id="codeResend" href="javascript:void(0)">ارسال مجدد کد</a>' +
      '<div class="alert-danger hidden" id="login-error" role="alert">' +
      "<span>&#9888;</span><span id=\"login-error-text\"></span>" +
      "</div>" +
      '<button type="submit" class="btn btn-custom mt-3" id="login" disabled="disabled" name="button" value="login">ورود</button>' +
      '<p class="otp-login">کد تایید نمایشی: ' + DEMO_CODE_FA + "</p>" +
      '<p class="change-number"><a href="javascript:void(0)" id="change-number">تغییر شماره</a></p>';

    step = 2;
    startTimer();

    var codeInput = $("#Code");
    codeInput.addEventListener("input", function () {
      codeInput.value = digits(codeInput.value).slice(0, 4);
      hideErr();
      $("#login").disabled = codeInput.value.length !== 4;
    });
    var nameInput = $("#Name");
    if (nameInput) {
      nameInput.addEventListener("input", hideErr);
    }
    $("#codeResend").addEventListener("click", function () {
      this.classList.add("hidden");
      var t = $("#timer");
      if (t) t.classList.remove("hidden");
      codeInput.value = "";
      $("#login").disabled = true;
      hideErr();
      startTimer();
      codeInput.focus();
    });
    $("#change-number").addEventListener("click", function () {
      location.reload();
    });
    codeInput.focus();
  }

  function done(name) {
    try {
      localStorage.setItem("user", JSON.stringify({ name: name, phone: phone }));
    } catch (e) {}
    try {
      if (window.opener && !window.opener.closed) {
        window.close();
        return;
      }
    } catch (e) {}
    location.href = "index.html";
  }

  $("#login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    hideErr();

    if (step === 1) {
      phone = digits(phoneInput.value).slice(0, 11);
      if (!/^09\d{9}$/.test(phone)) {
        showErr("شماره موبایل معتبر وارد کنید.");
        return;
      }
      spin(getCodeBtn, true);
      function gotList(list) {
        spin(getCodeBtn, false);
        isNew = !list.length;
        userId = isNew ? null : list[0].id;
        oldName = isNew ? "" : list[0].name || "";
        renderStep2();
      }
      if (STATIC) {
        gotList(
          getLocalUsers().filter(function (u) {
            return u.phone === phone;
          })
        );
        return;
      }
      fetch(API + "/users?phone=" + encodeURIComponent(phone))
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .then(gotList)
        .catch(function () {
          spin(getCodeBtn, false);
          try {
            gotList(
              getLocalUsers().filter(function (u) {
                return u.phone === phone;
              })
            );
          } catch (e) {
            showErr("ارتباط با سرور برقرار نشد؛ json-server را روی پورت ۳۰۰۰ اجرا کنید.");
          }
        });
      return;
    }

    var codeInput = $("#Code");
    var code = digits(codeInput.value).slice(0, 4);
    if (code !== DEMO_CODE) {
      showErr("کد تایید اشتباه است.");
      return;
    }
    var nameInput = $("#Name");
    var name = nameInput ? nameInput.value.trim() : oldName;
    if (isNew && !name) {
      showErr("نام خود را وارد کنید.");
      nameInput.focus();
      return;
    }
    if (!name) name = "کاربر " + phone.slice(-4);

    var btn = $("#login");
    spin(btn, true);
    if (STATIC) {
      saveLocalUser(phone, name);
      done(name);
      return;
    }
    var save;
    if (isNew) {
      save = fetch(API + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, name: name }),
      }).then(function (r) {
        if (!r.ok) throw new Error("post failed");
        return r.json();
      });
    } else if (name !== oldName) {
      save = fetch(API + "/users/" + userId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      }).then(function (r) {
        if (!r.ok) throw new Error("patch failed");
        return r.json();
      });
    } else {
      save = Promise.resolve({ name: name });
    }
    save
      .then(function () {
        done(name);
      })
      .catch(function () {
        spin(btn, false);
        showErr("ذخیره اطلاعات ممکن نشد؛ json-server را بررسی کنید.");
      });
  });
})();
