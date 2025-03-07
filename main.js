document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    let articles = [];

    document.getElementById("addArticle").addEventListener("click", function () {
        // Récupérer les valeurs des champs
        const name = document.getElementById("articleName").value;
        const quantity = parseInt(document.getElementById("articleQuantity").value);
        const price = parseFloat(document.getElementById("articlePrice").value);
        const discountRate = parseFloat(document.getElementById("discountRate").value) || 0;
    
        // Vérifier si les champs sont valides
        if (!name || quantity <= 0 || price <= 0) {
            alert("Veuillez remplir correctement les informations du produit.");
            return;
        }
    
        // Ajouter l'article à la liste
        articles.push({ name, quantity, price, discountRate });
    
        // Ajouter l'article dans le tableau HTML
        const tbody = document.getElementById("articleBody");
        const row = tbody.insertRow();
        row.innerHTML = `<td>${name}</td><td>${quantity}</td><td>${price.toFixed(2)}</td><td>${discountRate}%</td>`;
    
        // Mettre à jour les totaux
        updateTotals();
    
        // Réinitialiser les champs de saisie après l'ajout
        resetProductFields();
    
        // Activer le bouton pour générer le PDF
        document.querySelector(".generatePDF").disabled = false;
    });
    
    // Fonction pour réinitialiser les champs de saisie des produits
    function resetProductFields() {
        document.getElementById("articleName").value = '';
        document.getElementById("articleQuantity").value = '';
        document.getElementById("articlePrice").value = '';
        document.getElementById("discountRate").value = '';
    }
    
    // Fonction pour mettre à jour les totaux
    function updateTotals() {
        const totalHT = calculateTotalHT(articles);
        const totalTTC = calculateTotalTTC(totalHT);
    
        document.getElementById("total-ht").textContent = totalHT.toFixed(2);
        document.getElementById("total-ttc").textContent = totalTTC.toFixed(2);
    }
    
    // Fonction pour calculer le Total HT
    function calculateTotalHT(items) {
        return items.reduce((total, item) => total + (item.quantity * item.price * (1 - item.discountRate / 100)), 0);
    }
    
    // Fonction pour calculer le Total TTC (TVA 20%)
    function calculateTotalTTC(totalHT) {
        const taxRate = 0.20;
        return totalHT + (totalHT * taxRate);
    }

    window.generatePDF = function () {
        const doc = new jsPDF();
    
        // Définir les couleurs et polices
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        
        // Récupérer les informations client
        const clientName = document.getElementById("clientName").value;
        const clientEmail = document.getElementById("clientEmail").value;
    
        // Récupérer les informations de l'entreprise
        const companyName = document.getElementById("companyName").value;
        const companyPhone = document.getElementById("companyPhone").value;
        const companyAddress = document.getElementById("companyAddress").value;
        const companyWebsite = document.getElementById("companyWebsite").value;
        const companyLogoUrl = document.getElementById("companyLogo").value;
    
        // Positionner le logo en haut à droite
        if (companyLogoUrl) {
            doc.addImage(companyLogoUrl, "PNG", 10, 10, 33, 33);
        }
    
        // Nom de l'entreprise centré
        doc.text(companyName.toUpperCase(), 105, 15, { align: "center" });
    
        // Séparateur horizontal
        doc.setLineWidth(0.5);
        doc.line(10, 50, 200, 50);
    
        // Informations de l'entreprise (en bleu)
        doc.setTextColor(0, 102, 204);
        doc.setFontSize(12);
        doc.text("Téléphone : " + companyPhone, 10, 60);
        doc.text("Adresse : " + companyAddress, 10, 70);
        doc.text("Site Web : " + companyWebsite, 10, 80);
        
        // Séparateur
        doc.line(10, 85, 200, 85);
    
        // Informations du client (en gras)
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Facturé à :", 10, 95);
        doc.setFont("helvetica", "normal");
        doc.text("Nom : " + clientName, 10, 105);
        doc.text("Email : " + clientEmail, 10, 115);
    
        // Séparateur
        doc.line(10, 123, 200, 120);
    
        // Ajouter les articles sous forme de tableau
        let y = 130;
        doc.setFont("helvetica", "bold");
        doc.text("Détails des articles", 10, y);
        doc.setFont("helvetica", "normal");
        y += 10;
    
        doc.autoTable({
            startY: y,
            head: [["Nom du produit", "Quantité", "Prix (FCFA)", "Remise (%)"]],
            body: articles.map(item => [item.name, item.quantity, item.price.toFixed(2), item.discountRate + "%"]),
            theme: "grid",
            headStyles: { fillColor: [0, 102, 204] },
            styles: { fontSize: 10, cellPadding: 2 },
        });
    
        // Ajouter les totaux
        const totalHT = calculateTotalHT(articles);
        const totalTTC = calculateTotalTTC(totalHT);
        
        doc.setFont("helvetica", "bold");
        doc.text(`Total HT : ${totalHT.toFixed(2)} FCFA`, 10, doc.autoTable.previous.finalY + 20);
        doc.text(`Total TTC : ${totalTTC.toFixed(2)} FCFA`, 10, doc.autoTable.previous.finalY + 30);
    
        // Ajouter le QR Code du site web
        if (companyWebsite) {
            const qrCode = new QRCode(document.createElement("div"), {
                text: companyWebsite,
                width: 100,
                height: 100
            });
    
            setTimeout(() => {
                const qrImage = qrCode._oDrawing._elImage;
                const imgData = qrImage.src;
                doc.addImage(imgData, "PNG", 150, doc.autoTable.previous.finalY + 20, 40, 40);
                doc.save("facture.pdf");
            }, 500);
        } else {
            doc.save("facture.pdf");
        }
    };
});