// scripts.js
document.addEventListener("DOMContentLoaded", () => {
    const limitedStockToggle = document.getElementById('limited-stock');
    const certifiedToggle = document.getElementById('certified');

    limitedStockToggle.addEventListener('change', () => {
        console.log(`Limited stock: ${limitedStockToggle.checked}`);
    });

    certifiedToggle.addEventListener('change', () => {
        console.log(`Certified: ${certifiedToggle.checked}`);
    });
});
