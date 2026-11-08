(() => {
  "use strict";

  const frame = document.getElementById("frame");
  const frameLabel = document.getElementById("frame-label");
  const glazeLabel = document.getElementById("glaze-label");
  const reshuffle = document.getElementById("reshuffle");

  const GLAZES = [
    "глазурь «небо»",
    "глазурь «пепел»",
    "глазурь «хвоя»",
    "глазурь «молоко»",
    "глазурь «глина»",
    "глазурь «ночь»"
  ];

  /* Пул проверенных фотографий чая и керамики (Unsplash).
     При загрузке и по кнопке «другой кадр» берётся случайный снимок.
     Если сеть недоступна, рисуем локальную SVG-заглушку, чтобы витрина не ломалась. */
  const PHOTOS = [
    "1576092768241-dec231879fc3",
    "1571934811356-5cc061b6821f",
    "1594631252845-29fc4cc8cde9",
    "1556679343-c7306c1976bc",
    "1523920290228-4f321a939b4c",
    "1563822249366-3efb23b8e0c9",
    "1514228742587-6b1558fcca3d",
    "1596040033229-a9821ebd058d",
    "1600335895229-6e75511892c8",
    "1547825407-2d060104b7f8",
    "1564890369478-c89ca6d9cde9",
    "1544787219-7f47ccb76574",
    "1495474472287-4d71bcdd2085",
    "1541167760496-1628856ab772",
    "1558160074-4d7d8bdf4256"
  ];

  let shot = 0;
  let lastSeed = -1;

  function nextSeed() {
    let seed = Math.floor(Math.random() * PHOTOS.length);
    if (seed === lastSeed) seed = (seed + 1) % PHOTOS.length;
    lastSeed = seed;
    return seed;
  }

  function photoUrl(seed) {
    const id = PHOTOS[seed];
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=900&h=760&q=80";
  }

  function fallbackSvg(seed) {
    const hue = [190, 26, 88, 140, 210, 348][seed % 6];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="760" viewBox="0 0 900 760">' +
      '<defs><radialGradient id="g" cx="38%" cy="30%" r="85%">' +
      '<stop offset="0%" stop-color="hsl(' + hue + ',18%,92%)"/>' +
      '<stop offset="100%" stop-color="hsl(' + hue + ',14%,72%)"/>' +
      '</radialGradient>' +
      '<filter id="s"><feGaussianBlur stdDeviation="16"/></filter></defs>' +
      '<rect width="900" height="760" fill="url(#g)"/>' +
      '<ellipse cx="450" cy="620" rx="270" ry="40" fill="hsl(' + hue + ',12%,55%)" opacity=".45" filter="url(#s)"/>' +
      '<g fill="none" stroke="hsl(' + hue + ',16%,30%)" stroke-width="6" opacity=".7">' +
      '<path d="M340 400c0-106 52-168 130-168s130 62 130 168c0 97-58 156-130 156s-130-59-130-156z"/>' +
      '<path d="M340 382c-62 6-84 56-62 106 20 44 65 55 98 48"/>' +
      '</g>' +
      '<g fill="hsl(' + hue + ',16%,30%)" opacity=".62">' +
      '<ellipse cx="672" cy="528" rx="76" ry="23"/><path d="M596 528c0 62 30 96 76 96s76-34 76-96z"/>' +
      '<ellipse cx="232" cy="552" rx="62" ry="20"/><path d="M170 552c0 52 24 80 62 80s62-28 62-80z"/>' +
      '</g></svg>';
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function render(seed) {
    const img = document.createElement("img");
    img.alt = "Чайный набор «Кани Ли»: керамический чайник и две пиалы";
    img.decoding = "async";
    img.src = photoUrl(seed);

    const previous = frame.querySelector("img");
    frame.appendChild(img);

    const show = () => {
      img.classList.add("is-ready");
      if (previous) {
        previous.remove();
      }
    };

    img.addEventListener("load", show, { once: true });
    img.addEventListener(
      "error",
      () => {
        img.src = fallbackSvg(seed);
        img.addEventListener("load", show, { once: true });
      },
      { once: true }
    );

    shot += 1;
    frameLabel.textContent = "кадр " + String(shot).padStart(2, "0");
    glazeLabel.textContent = GLAZES[seed % GLAZES.length];
  }

  reshuffle.addEventListener("click", () => render(nextSeed()));
  render(nextSeed());

  /* ---------- заказ ---------- */
  const dialog = document.getElementById("order-dialog");
  const openBtn = document.getElementById("order");
  const closeBtn = document.getElementById("close-dialog");
  const successClose = document.getElementById("close-success");
  const form = document.getElementById("order-form");
  const step = document.getElementById("order-step");
  const success = document.getElementById("success");
  const errorBox = document.getElementById("form-error");
  const orderNumber = document.getElementById("order-number");

  function resetSheet() {
    form.reset();
    errorBox.hidden = true;
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute("aria-invalid"));
    step.hidden = false;
    success.hidden = true;
    orderNumber.textContent = "КЛ-0000";
  }

  openBtn.addEventListener("click", () => {
    resetSheet();
    dialog.showModal();
    form.querySelector("input").focus();
  });

  closeBtn.addEventListener("click", () => dialog.close());
  successClose.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.elements.name;
    const phone = form.elements.phone;
    const digits = phone.value.replace(/\D/g, "");
    const problems = [];

    [name, phone].forEach((el) => el.removeAttribute("aria-invalid"));

    if (name.value.trim().length < 2) {
      name.setAttribute("aria-invalid", "true");
      problems.push("напишите имя");
    }
    if (digits.length < 10) {
      phone.setAttribute("aria-invalid", "true");
      problems.push("проверьте номер телефона");
    }

    if (problems.length) {
      errorBox.textContent = "Не хватает данных: " + problems.join(", ") + ".";
      errorBox.hidden = false;
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    orderNumber.textContent = "КЛ-" + String(Math.floor(1000 + Math.random() * 9000));
    step.hidden = true;
    success.hidden = false;
    successClose.focus();
  });
})();