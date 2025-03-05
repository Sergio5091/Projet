// import {QRCode} from "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
const items = [];

// Ajouter un article
document.getElementById('addArticle').addEventListener('click', () => {
    const name = document.getElementById('articleName').value;
    const quantity = parseInt(document.getElementById('articleQuantity').value) || 0;
    const price = parseFloat(document.getElementById('articlePrice').value) || 0;
    const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
    let SubButton = document.getElementById('addArticle');
    let article = {
        nom: name.value,
        qte: parseInt(quantity.value),
        prix: parseFloat(price.value),
        remise: parseInt(discountRate.value)
    };

    if (name && quantity > 0 && price > 0 && discountRate >= 0) {
        items.push({ name, quantity, price, discountRate });
        updateArticleTable();
        calculateTotals();
        étatGeneratePDFButton();
    } else {
        alert('Veuillez remplir correctement les champs.');
    }
});

// Vérifier si le tableau est vide et activer/désactiver le bouton PDF
function étatGeneratePDFButton() {
    const generatePDFButton = document.querySelector('.generatePDF');

    // Si le tableau items est vide, désactiver le bouton, sinon l'activer
    if (items.length === 0) {
        generatePDFButton.disabled = true;  // Désactiver
    } else {
        generatePDFButton.disabled = false; // Activer
    }
}

// Mettre à jour la table des articles
function updateArticleTable() {
    const articleBody = document.getElementById('articleBody');
    articleBody.innerHTML = '';
    items.forEach((item, index) => {
        articleBody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.discountRate.toFixed(2)}</td>
                </tr>
            `;
    });
    localStorage.setItem("items", JSON.stringify(items));

    //Réinitialisation des champs après ajout 
    document.getElementById('articleName').value = "";
    document.getElementById('articleQuantity').value = "";
    document.getElementById('articlePrice').value = "";
    document.getElementById('discountRate').value = "";


}


// Calcul du Total HT
function calculateTotalHT() {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Calcul du Total TTC
function calculateTotalTTC() {
    let totalHT = calculateTotalHT();
    let totalDiscount = items.reduce((sum, item) => sum + (item.price * item.quantity * (item.discountRate / 100)), 0);
    return totalHT - totalDiscount;
}

// Calcul des totaux et mise à jour du DOM
function calculateTotals() {
    document.getElementById('total-ht').innerText = calculateTotalHT().toFixed(2);
    document.getElementById('total-ttc').innerText = calculateTotalTTC().toFixed(2);
}


// Générer le PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ajout du titre avec une taille de police plus grande et en gras
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Facture", 105, 10, null, null, 'center');

    // Informations du client avec une taille de police plus petite
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Nom du client : " + document.getElementById('clientName').value, 10, 20);
    doc.text("Email : " + document.getElementById('clientEmail').value, 10, 30);

    // Lignes pour séparer les sections
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);  // Ligne horizontale sous les informations du client

    let y = 45;
    items.forEach(item => {
        // Liste des articles avec des détails
        doc.setFontSize(12);
        doc.text(`${item.name} - ${item.quantity} x ${item.price.toFixed(2)} FCFA - Remise : ${item.discountRate}%`, 10, y);
        y += 10;
    });

    // Total HT et TTC avec une couleur différente
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204); // Couleur bleue pour les totaux
    doc.text(`Total HT : ${calculateTotalHT().toFixed(2)} FCFA`, 10, y + 10);
    doc.text(`Total TTC : ${calculateTotalTTC().toFixed(2)} FCFA`, 10, y + 20);

    // Génération du QR Code et ajout au PDF
    // Créer un élément image avec le QR Code
    const qrText = "https://google.com"; 
    const qrCode = new QRCode(document.createElement('div'), {
        text: qrText,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Attendre que le QR Code soit généré et l'ajouter au PDF
    setTimeout(() => {
        const qrImage = qrCode._oDrawing._elImage;
        const imgData = qrImage.src;

        // Ajouter le QR Code au PDF
        doc.addImage(imgData, 'PNG', 150, y + 30, 50, 50);

        // Sauvegarder le PDF
        doc.save("facture.pdf");
    }, 500); // Attente pour s'assurer que le QR Code est généré avant d'ajouter l'image au PDF
}