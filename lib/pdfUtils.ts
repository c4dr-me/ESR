
export function addWatermarkToCurrentPage(doc: PDFKit.PDFDocument, text: string = "ESR", fontName: string = "NotoSansMono") {
  doc.save();
  doc.font(fontName)
    .fontSize(180)
    .fillColor("gray", 0.15)
    .rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] })
    .text(
      text,
      doc.page.width / 2 - 360,
      doc.page.height / 2 - 75,
      {
        align: "center",
        width: 650,
      }
    );
  doc.restore();
}

export function addFooterToCurrentPage(doc: PDFKit.PDFDocument, footerText: string, fontName: string = "NotoSansMono") {
  doc.font(fontName)
    .fontSize(9)
    .fillColor("gray")
    .text(footerText, 0, doc.page.height - doc.page.margins.bottom - 30, {
      align: "center",
      width: doc.page.width,
    });
}