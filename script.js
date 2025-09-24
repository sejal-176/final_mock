const users = [
  {id:1, username:"admin", password:"admin123"},
  {id:2, username:"user1", password:"user123"},
  {id:3, username:"analyst", password:"analyst123"}
];

const threatLabels = ["Phishing","Malware","Ransomware","Social Engineering","Data Breach"];
const lowRiskLabels = ["Suspicious Email","Minor Malware","Phishing Attempt"];

// LOGIN
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const user = users.find(u => u.username === username && u.password === password);
  if(user){
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    showSection('guidelines'); 
    autoRefreshHistory();
  } else {
    document.getElementById("loginError").innerText = "Invalid username or password";
  }
}

// NAVIGATION
function showSection(section){
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  if(section === 'guidelines') document.getElementById("guidelinesSection").style.display = "block";
  if(section === 'history') document.getElementById("historySection").style.display = "block";
  if(section === 'upload') document.getElementById("uploadSection").style.display = "block";
}

// LOGOUT
function logout(){
  localStorage.removeItem("loggedInUser"); 
  document.getElementById("dashboard").style.display = "none"; 
  document.getElementById("loginPage").style.display = "block"; 
}

// POPUP MODAL
function showModal(title, msg){ 
  document.getElementById("popupTitle").innerText = title; 
  document.getElementById("popupMessage").innerText = msg; 
  document.getElementById("popupModal").style.display = "block";
}
function closeModal(){ document.getElementById("popupModal").style.display = "none"; }

// HASH FUNCTION
async function hashValue(value){
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// MOCK LLM ANALYSIS WITH CUSTOM MITIGATIVE STEPS
async function analyzeEvidence(evidence){
  let confidence = Math.floor(Math.random() * 101);
  let label, risk, message;

  if(confidence > 50){
    label = threatLabels[Math.floor(Math.random() * threatLabels.length)];
    risk = "High Risk - Forwarded to CERT Army";
    message = `Critical case detected!\nThreat: ${label}\nConfidence: ${confidence}%\nForwarded to CERT Army.`;
    showModal("High Risk Incident", message);
  } else {
    label = lowRiskLabels[Math.floor(Math.random() * lowRiskLabels.length)];
    confidence = Math.floor(Math.random() * 41) + 10;
    risk = "Low Risk";

    // Custom mitigative steps for each low-risk label
    let mitigationSteps = "";
    switch(label){
      case "Suspicious Email":
        mitigationSteps = "- Do not open email attachments\n- Verify sender identity\n- Report to admin";
        break;
      case "Minor Malware":
        mitigationSteps = "- Run antivirus scan\n- Quarantine infected files\n- Update system software";
        break;
      case "Phishing Attempt":
        mitigationSteps = "- Change passwords immediately\n- Enable 2FA\n- Educate users about phishing";
        break;
      default:
        mitigationSteps = "- Monitor activity\n- Follow standard security practices";
    }

    message = `Low confidence (${confidence}%).\nDetected: ${label}\nMitigative steps:\n${mitigationSteps}`;
    showModal("Low Risk Incident - Mitigation Steps", message);
  }

  const hashedLabel = await hashValue(evidence);
  return { hashedLabel, label, confidence, risk };
}

// UPLOAD INCIDENT
async function uploadIncident(){
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const incidentId = document.getElementById("incidentId").value;
  const reportText = document.getElementById("reportText").value;
  const fileUpload = document.getElementById("fileUpload").files[0]?.name || "No File";
  
  if(!incidentId || (!reportText && !fileUpload)){
    alert("Provide Incident ID and report/file"); 
    return;
  }

  const evidenceText = reportText || fileUpload;
  const analysis = await analyzeEvidence(evidenceText);
  const dateTime = new Date().toLocaleString();

  const incidents = JSON.parse(localStorage.getItem("incidents") || "[]");
  incidents.push({
    incidentId,
    userId: user.username,
    report: evidenceText,
    evidence: analysis.hashedLabel,
    label: analysis.label,
    confidence: analysis.confidence,
    risk: analysis.risk,
    dateTime,
    status: (analysis.risk.includes("High Risk") ? "Reviewed" : "-")
  });
  localStorage.setItem("incidents", JSON.stringify(incidents));
  loadHistory();
}

// LOAD HISTORY
function loadHistory(){
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const incidents = JSON.parse(localStorage.getItem("incidents") || "[]")
    .filter(inc => inc.userId === user.username);
  const table = document.getElementById("historyTable");

  table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

  incidents.forEach((inc) => {
    const row = table.insertRow();
    row.insertCell(0).innerText = inc.incidentId;
    row.insertCell(1).innerText = inc.userId;
    row.insertCell(2).innerText = inc.report;
    row.insertCell(3).innerText = inc.label;
    row.insertCell(4).innerText = inc.confidence + "%";
    row.insertCell(5).innerText = inc.risk;
    row.insertCell(6).innerText = inc.evidence;
    row.insertCell(7).innerText = inc.dateTime;
    row.insertCell(8).innerText = inc.status || "-";
  });
}

// AUTO REFRESH HISTORY
function autoRefreshHistory(){
  loadHistory();
  setTimeout(autoRefreshHistory, 2000);
}
