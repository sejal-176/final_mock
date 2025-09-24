// Load all incidents from localStorage and display
function loadAllIncidents() {
  const incidents = JSON.parse(localStorage.getItem("incidents") || "[]");
  const table = document.getElementById("certHistoryTable");
  table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

  incidents.forEach((inc, index) => {
    const row = table.insertRow();
    row.insertCell(0).innerText = inc.incidentId;
    row.insertCell(1).innerText = inc.userId;
    row.insertCell(2).innerText = inc.report;
    row.insertCell(3).innerText = inc.label;
    row.insertCell(4).innerText = inc.confidence + "%";
    row.insertCell(5).innerText = inc.risk;
    row.insertCell(6).innerText = inc.evidence;
    row.insertCell(7).innerText = inc.dateTime;

    // Status cell
    const statusCell = row.insertCell(8);

    // Only allow status update for High Risk cases
    if(inc.risk.includes("High Risk")) {
      const select = document.createElement("select");
      select.className = "status-select";
      ["Reviewed", "On Process", "Solved"].forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.text = status;
        select.appendChild(option);
      });

      // Set default or previous status
      select.value = inc.status || "Reviewed";

      // Update localStorage when status changes
      select.addEventListener("change", () => {
        const incidentsUpdate = JSON.parse(localStorage.getItem("incidents") || "[]");
        incidentsUpdate[index].status = select.value;
        localStorage.setItem("incidents", JSON.stringify(incidentsUpdate));
      });

      statusCell.appendChild(select);
    } else {
      statusCell.innerText = inc.status || "-";
    }
  });
}

// Auto-refresh every 5 seconds to show new incidents from Defence portal
function autoRefresh() {
  loadAllIncidents();
  setTimeout(autoRefresh, 5000);
}

window.onload = autoRefresh;
