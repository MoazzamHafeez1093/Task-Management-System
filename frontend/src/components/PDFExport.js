import React, { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PDFExport = ({ tasks, onClose }) => {
  useEffect(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Tasks Export", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add table
    const tableColumn = ["Title", "Priority", "Status", "Due Date", "Tags"];
    const tableRows = tasks.map(task => [
      task.title,
      task.priority,
      task.completed ? "Completed" : "Pending",
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A",
      (task.tags || []).join(", ")
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Save the PDF
    doc.save(`tasks_export_${new Date().toISOString().split("T")[0]}.pdf`);
    onClose();
  }, [tasks, onClose]);

  return null;
};

export default PDFExport; 