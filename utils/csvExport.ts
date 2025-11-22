import { FlowerAnalysis } from "../types";

export const downloadCSV = (results: FlowerAnalysis[]) => {
  const headers = ["File Name", "Flower Type", "Geographic Area", "Confidence", "Timestamp"];
  
  const rows = results.map(r => [
    `"${r.fileName.replace(/"/g, '""')}"`,
    `"${r.flowerName.replace(/"/g, '""')}"`,
    `"${r.geographicArea.replace(/"/g, '""')}"`,
    `${r.confidence}%`,
    `"${r.timestamp}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Flower_Analysis_Results_${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};