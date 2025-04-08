export const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map((row) => Object.values(row).join(",")).join("\n")
  
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  export const exportToPDF = async (elementId: string, filename: string) => {
    // This is a placeholder for PDF export functionality
    // You would typically use a library like jsPDF or html2pdf here
    console.log("Exporting to PDF:", elementId, filename)
  }