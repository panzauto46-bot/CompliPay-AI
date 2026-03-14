const state = {
  complianceScore: 44,
  compliancePassed: false,
  contracts: 17,
  executedTx: 0,
};

const ids = {
  runComplianceBtn: document.getElementById("runComplianceBtn"),
  executeAiBtn: document.getElementById("executeAiBtn"),
  newPaymentBtn: document.getElementById("newPaymentBtn"),
  escalateBtn: document.getElementById("escalateBtn"),
  saveDraftBtn: document.getElementById("saveDraftBtn"),
  deployBtn: document.getElementById("deployBtn"),
  statusKyc: document.getElementById("statusKyc"),
  statusKyt: document.getElementById("statusKyt"),
  statusAml: document.getElementById("statusAml"),
  statusTravel: document.getElementById("statusTravel"),
  complianceBar: document.getElementById("complianceBar"),
  complianceScoreText: document.getElementById("complianceScoreText"),
  complianceNote: document.getElementById("complianceNote"),
  aiState: document.getElementById("aiState"),
  aiRiskMessage: document.getElementById("aiRiskMessage"),
  actionHint: document.getElementById("actionHint"),
  passRate: document.getElementById("passRate"),
  contractCount: document.getElementById("contractCount"),
  auditBody: document.getElementById("auditBody"),
  lastEvent: document.getElementById("lastEvent"),
  amount: document.getElementById("amount"),
  rule: document.getElementById("rule"),
  token: document.getElementById("token"),
  steps: Array.from(document.querySelectorAll(".step")),
};

function utcNowText() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function randomHash() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${out.slice(0, 4)}...${out.slice(-4)}`;
}

function updateStatus(el, kind, label) {
  el.classList.remove("pending", "ok", "flag");
  el.classList.add("status", kind);
  el.textContent = label;
}

function updateCompliance(score, message, passed) {
  state.complianceScore = score;
  state.compliancePassed = passed;
  ids.complianceBar.style.width = `${score}%`;
  ids.complianceScoreText.textContent = `${score}%`;
  ids.complianceNote.textContent = message;
  ids.passRate.textContent = `${Math.max(72, Math.min(99, score))}%`;

  if (passed) {
    ids.aiState.textContent = "Execution Mode: Ready (policy-compliant)";
    ids.aiRiskMessage.textContent =
      "All mandatory checks passed. AI agent can execute transfer within approved policy threshold.";
  } else {
    ids.aiState.textContent = "Execution Mode: Policy Locked (manual review required)";
    ids.aiRiskMessage.textContent =
      "One or more compliance checks are not passed. Auto-execution is blocked until review.";
  }
}

function activateStep(index) {
  ids.steps.forEach((el, i) => {
    if (i <= index) {
      el.classList.add("active");
    }
  });
}

function appendAuditRow(statusLabel) {
  const amount = Number(ids.amount.value || 0).toLocaleString("en-US");
  const ruleCode = (ids.rule.value || "PAYMENT").split(" ")[0].toUpperCase().slice(0, 4);
  const idSuffix = String(Math.floor(Math.random() * 90000) + 10000);
  const contractId = `${ruleCode}-${idSuffix}`;

  const tr = document.createElement("tr");
  tr.classList.add("pulse");

  const cells = [
    `<td class="code">${contractId}</td>`,
    `<td class="code">${randomHash()}</td>`,
    `<td class="amount">${ids.token.value} ${amount}</td>`,
    `<td><span class="status ${statusLabel === "Confirmed" ? "ok" : "pending"}">${statusLabel}</span></td>`,
    `<td>${utcNowText()}</td>`,
    "<td>Solana Testnet</td>",
  ];

  tr.innerHTML = cells.join("");
  ids.auditBody.prepend(tr);
  setTimeout(() => tr.classList.remove("pulse"), 900);
}

ids.newPaymentBtn.addEventListener("click", () => {
  ids.amount.focus();
  ids.actionHint.textContent =
    "Payment builder ready. Define amount, rule, and schedule, then run compliance before execution.";
  activateStep(2);
  ids.lastEvent.textContent = `Last event: Payment draft initiated at ${utcNowText()} UTC.`;
});

ids.saveDraftBtn.addEventListener("click", () => {
  ids.lastEvent.textContent = `Last event: Draft saved at ${utcNowText()} UTC.`;
  ids.actionHint.textContent = "Draft saved. You can deploy now or run compliance checks first.";
  activateStep(2);
});

ids.deployBtn.addEventListener("click", () => {
  state.contracts += 1;
  ids.contractCount.textContent = String(state.contracts);
  ids.lastEvent.textContent = `Last event: Contract deployed to testnet at ${utcNowText()} UTC.`;
  ids.actionHint.textContent = "Contract deployed. Next step: run compliance checks.";
  activateStep(2);
});

ids.runComplianceBtn.addEventListener("click", () => {
  updateStatus(ids.statusKyc, "ok", "Passed");
  updateStatus(ids.statusAml, "ok", "Passed");
  updateStatus(ids.statusTravel, "ok", "Passed");

  const riskyAmount = Number(ids.amount.value || 0) > 500000;
  if (riskyAmount) {
    updateStatus(ids.statusKyt, "flag", "Review");
    updateCompliance(
      76,
      "KYT requested enhanced due diligence due to transfer size. Manual approval suggested.",
      false,
    );
  } else {
    updateStatus(ids.statusKyt, "ok", "Passed");
    updateCompliance(96, "All compliance checks passed. Payment is eligible for AI execution.", true);
  }

  ids.lastEvent.textContent = `Last event: Compliance run completed at ${utcNowText()} UTC.`;
  activateStep(3);
});

ids.executeAiBtn.addEventListener("click", () => {
  if (!state.compliancePassed) {
    ids.actionHint.textContent =
      "AI execution blocked. Complete or resolve compliance checks before auto-settlement.";
    appendAuditRow("Pending");
    ids.lastEvent.textContent = `Last event: Execution attempt blocked by policy at ${utcNowText()} UTC.`;
    return;
  }

  state.executedTx += 1;
  appendAuditRow("Confirmed");
  ids.actionHint.textContent =
    "Payment executed successfully by AI agent. On-chain audit log has been updated.";
  ids.lastEvent.textContent = `Last event: AI executed payment #${state.executedTx} at ${utcNowText()} UTC.`;
  activateStep(5);
});

ids.escalateBtn.addEventListener("click", () => {
  updateStatus(ids.statusKyt, "flag", "Escalated");
  updateCompliance(
    68,
    "Case escalated for compliance officer review. AI auto-execution disabled for this contract.",
    false,
  );
  ids.lastEvent.textContent = `Last event: Case escalated at ${utcNowText()} UTC.`;
  ids.actionHint.textContent =
    "Escalation sent. Wait for compliance officer approval or switch to manual execution.";
});
