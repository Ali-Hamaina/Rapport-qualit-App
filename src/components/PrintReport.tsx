import { Inspection } from "../types";

export function printInspectionReport(inspection: Inspection) {

  const totalSeriousDefects =
    inspection.seriousDefects?.reduce((sum, d) => sum + d.units, 0) || 0;

  const totalSeriousPercentage =
    inspection.seriousDefects?.reduce((sum, d) => sum + d.percentage, 0) || 0;

  const totalNonSeriousDefects =
    inspection.nonSeriousDefects?.reduce((sum, d) => sum + d.units, 0) || 0;

  const totalNonSeriousPercentage =
    inspection.nonSeriousDefects?.reduce((sum, d) => sum + d.percentage, 0) || 0;

  const totalDefects = totalSeriousDefects + totalNonSeriousDefects;
  const totalPercentage = totalSeriousPercentage + totalNonSeriousPercentage;

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  let statusClass = "rejected";

  if (inspection.status === "Accepté") statusClass = "accepted";
  else if (inspection.status === "Avertissement") statusClass = "warning";

  const seriousRows =
    inspection.seriousDefects?.filter((d) => d.units > 0) || [];

  const nonSeriousRows =
    inspection.nonSeriousDefects?.filter((d) => d.units > 0) || [];

  const html = `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<title>Inspection Report</title>

<style>

body{
font-family:Arial,Helvetica,sans-serif;
background:white;
color:#1e293b;
padding:40px;
}

.report{
max-width:900px;
margin:auto;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
border-bottom:3px solid #f49d25;
padding-bottom:10px;
}

.title{
font-size:22px;
font-weight:bold;
}

.lot{
font-size:12px;
background:#f1f5f9;
padding:6px 12px;
border-radius:6px;
}

.status{
padding:6px 14px;
border-radius:6px;
font-weight:bold;
font-size:12px;
text-transform:uppercase;
}

.status-accepted{
background:#dcfce7;
color:#166534;
}

.status-warning{
background:#fef3c7;
color:#92400e;
}

.status-rejected{
background:#fee2e2;
color:#991b1b;
}

.section{
margin-top:30px;
}

.section-title{
font-size:18px;
font-weight:bold;
border-bottom:2px solid #eee;
margin-bottom:10px;
padding-bottom:5px;
}

.info-grid{
display:grid;
grid-template-columns:1fr 1fr;
border:1px solid #ddd;
border-radius:6px;
overflow:hidden;
}

.info-item{
display:flex;
justify-content:space-between;
padding:10px;
border-bottom:1px solid #eee;
}

.info-item:nth-child(odd){
border-right:1px solid #eee;
}

.info-label{
font-weight:bold;
font-size:12px;
color:#555;
}

.info-value{
font-size:13px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

th{
background:#f8fafc;
padding:10px;
font-size:12px;
text-align:left;
border-bottom:2px solid #ddd;
}

td{
padding:10px;
border-bottom:1px solid #eee;
font-size:13px;
}

.total{
font-weight:bold;
background:#fafafa;
}

.samples{
display:grid;
grid-template-columns:1fr 1fr;
gap:10px;
}

.sample-card{
border:1px solid #ddd;
border-radius:6px;
padding:10px;
background:#fafafa;
}

.photos{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:8px;
margin-top:10px;
}

.photos img{
width:100%;
border-radius:6px;
border:1px solid #ddd;
}

.footer{
margin-top:40px;
font-size:11px;
color:#888;
display:flex;
justify-content:space-between;
border-top:1px solid #eee;
padding-top:10px;
}

</style>

</head>

<body>

<div class="report">

<div class="header">

<div class="title">
Quality Inspection Report
</div>

<div>

<span class="lot">Lot #${inspection.id}</span>

<span class="status">
${inspection.facility}
</span>

</div>

</div>

<div class="section">

<div class="section-title">
General Information
</div>

<div class="info-grid">

<div class="info-item">
<span class="info-label">Commodity</span>
<span class="info-value">${inspection.commodity}</span>
</div>

<div class="info-item">
<span class="info-label">Variety</span>
<span class="info-value">${inspection.variety}</span>
</div>

<div class="info-item">
<span class="info-label">Inspector</span>
<span class="info-value">${inspection.inspector}</span>
</div>

<div class="info-item">
<span class="info-label">Facility</span>
<span class="info-value">${inspection.facility || "-"}</span>
</div>

<div class="info-item">
<span class="info-label">Receive Date</span>
<span class="info-value">${formatDate(inspection.date)}</span>
</div>

<div class="info-item">
<span class="info-label">Pack Date</span>
<span class="info-value">${formatDate(inspection.packDate)}</span>
</div>

<div class="info-item">
<span class="info-label">Grower</span>
<span class="info-value">${inspection.grower}</span>
</div>

<div class="info-item">
<span class="info-label">Sample Size</span>
<span class="info-value">${inspection.sampleSize}</span>
</div>

</div>

</div>

${
seriousRows.length > 0 || nonSeriousRows.length > 0
? `
<div class="section">

<div class="section-title">
Defects Analysis
</div>

${
seriousRows.length > 0
? `
<h4>Serious Defects</h4>

<table>

<tr>
<th>Defect</th>
<th>Units</th>
<th>%</th>
</tr>

${seriousRows
.map(
(d) => `
<tr>
<td>${d.name}</td>
<td>${d.units}</td>
<td>${d.percentage.toFixed(2)}%</td>
</tr>`
)
.join("")}

<tr class="total">
<td>Total Serious</td>
<td>${totalSeriousDefects}</td>
<td>${totalSeriousPercentage.toFixed(2)}%</td>
</tr>

</table>
`
: ""
}

${
nonSeriousRows.length > 0
? `
<h4>Non Serious Defects</h4>

<table>

<tr>
<th>Defect</th>
<th>Units</th>
<th>%</th>
</tr>

${nonSeriousRows
.map(
(d) => `
<tr>
<td>${d.name}</td>
<td>${d.units}</td>
<td>${d.percentage.toFixed(2)}%</td>
</tr>`
)
.join("")}

<tr class="total">
<td>Total Non Serious</td>
<td>${totalNonSeriousDefects}</td>
<td>${totalNonSeriousPercentage.toFixed(2)}%</td>
</tr>

</table>
`
: ""
}

<div class="section-title">
Total Defects: ${totalDefects} (${totalPercentage.toFixed(2)}%)
</div>

</div>
`
: ""
}

${
inspection.samples && inspection.samples.length > 0
? `
<div class="section">

<div class="section-title">
Samples
</div>

<div class="samples">

${inspection.samples
.map(
(s) => `
<div class="sample-card">

<strong>${s.name}</strong>

${s.boxWeight ? `<p>Box Weight: ${s.boxWeight} KG</p>` : ""}

${s.brix ? `<p>Brix: ${s.brix}</p>` : ""}

${s.ringSizes ? `<p>Ring Size: ${s.ringSizes}</p>` : ""}

</div>
`
)
.join("")}

</div>

</div>
`
: ""
}

${
inspection.photos && inspection.photos.length > 0
? `
<div class="section">

<div class="section-title">
Photos
</div>

<div class="photos">

${inspection.photos
.map(
(p) => `
<img src="${p}" />
`
)
.join("")}

</div>

</div>
`
: ""
}

<div class="footer">

<div>
Generated by Citrus QC System
</div>

<div>
${new Date().toLocaleString()}
</div>

</div>

</div>

</body>

</html>
`;

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}