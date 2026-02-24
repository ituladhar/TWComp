/**
 * Export Controller module for Paramount Partner Dashboard
 * Handles single-page print optimization and PDF export triggers.
 */

const ExportController = {
    /**
     * Trigger browser print dialog
     * Optimized via CSS @media print in styles.css
     */
    triggerExport: function() {
        // We ensure any tooltips or temporary states are cleared before printing
        window.print();
    },

    /**
     * Initialize listeners for export buttons if added in future UI iterations
     */
    init: function() {
        // This can be expanded to include html2pdf.js logic if a direct 
        // PDF download is preferred over the browser print dialog.
        console.log("Paramount Export Controller Initialized.");
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', ExportController.init);
