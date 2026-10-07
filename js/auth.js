(function () {
  var API = window.CONFIG.API;
  var DEMO_CODE = "1234";
  var DEMO_CODE_FA = "۱۲۳۴";
  var step = 1;
  var phone = "";
  var isNew = false;
  var userId = null;
  var oldName = "";

  function $(sel) {
    return document.querySelector(sel);
  }
  function toEn(s) {
    return String(s == null ? "" : s).replace(/[\u06F0-\u06F9]/g, function (d) {
      return String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48);
    });
  }
  function showErr(msg) {
    var e = $("#login-error");
    e.textContent = msg;
    e.classList.remove("hidden");
  }
  function hideErr() {
    $("#login-error").classList.add("hidden");
  }
  function digits(s) {
    return toEn(s).replace(/\D/g, "");
  }

  var phoneInput = $("#phone-input");
  var codeInput = $("#code-input");
  phoneInput.addEventListener("input", function () {
    phoneInput.value = digits(phoneInput.value).slice(0, 11);
    hideErr();
  });
  codeInput.addEventListener("input", function () {
    codeInput.value = digits(codeInput.value).slice(0, 4);
    hideErr();
  });

  $("#login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    hideErr();

    if (step === 1) {
      phone = digits(phoneInput.value).slice(0, 11);
      if (!/^09\d{9}$/.test(phone)) {
        showErr("شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).");
        return;
      }
      var btn = $("#login-submit");
      btn.disabled = true;
      fetch(API + "/users?phone=" + encodeURIComponent(phone))
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .then(function (list) {
          btn.disabled = false;
          isNew = !list.length;
          userId = isNew ? null : list[0].id;
          oldName = isNew ? "" : list[0].name || "";
          if (oldName) $("#name-input").value = oldName;
          step = 2;
          $("#code-block").classList.remove("hidden");
          btn.textContent = "ورود";
          $("#login-hint").textContent =
            "کد تایید نمایشی: " + DEMO_CODE_FA + " (نسخه آزمایشی — پیامک واقعی ارسال نمی‌شود)";
          codeInput.focus();
        })
        .catch(function () {
          btn.disabled = false;
          showErr("ارتباط با سرور برقرار نشد؛ json-server را روی پورت ۳۰۰۰ اجرا کنید.");
        });
      return;
    }

    var code = digits(codeInput.value).slice(0, 4);
    if (code !== DEMO_CODE) {
      showErr("کد تایید اشتباه است.");
      return;
    }
    var nameInput = $("#name-input");
    var name = nameInput.value.trim() || oldName;
    if (!name) name = "کاربر " + phone.slice(-4);

    var btn2 = $("#login-submit");
    btn2.disabled = true;
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
        localStorage.setItem("user", JSON.stringify({ name: name, phone: phone }));
        location.href = "index.html";
      })
      .catch(function () {
        btn2.disabled = false;
        showErr("ذخیره اطلاعات ممکن نشد؛ json-server را بررسی کنید.");
      });
  });
})();
