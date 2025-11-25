for (i = 0; i < 42; i++) {
  const template = document.getElementById("agendaDagTemplate");
  const container = document.getElementById("agendaGrid");

  const clone = template.content.cloneNode(true);
  clone.querySelector(".agendaTop").textContent = i + 1;
  container.appendChild(clone);
}