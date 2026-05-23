import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Color Palette ─────────────────────────────────────────────────
C_DARK    = colors.HexColor("#050a12")
C_TEAL    = colors.HexColor("#00d48c")
C_VIOLET  = colors.HexColor("#8b5cf6")
C_TEXT    = colors.HexColor("#1a1a2e")
C_MUTED   = colors.HexColor("#64748b")
C_BORDER  = colors.HexColor("#e2e8f0")
C_BG      = colors.HexColor("#f8fafc")
C_RED     = colors.HexColor("#ef4444")
C_AMBER   = colors.HexColor("#f59e0b")
C_GREEN   = colors.HexColor("#10b981")
C_VIOLET2 = colors.HexColor("#7c3aed")

RISK_COLORS = {
    "LOW":      C_GREEN,
    "MODERATE": C_AMBER,
    "HIGH":     C_RED,
    "CRITICAL": colors.HexColor("#dc2626"),
}

W, H = A4
MARGIN = 18 * mm


def get_risk_color(risk: str) -> colors.Color:
    return RISK_COLORS.get(risk.upper(), C_MUTED)


def get_accent(module: str) -> colors.Color:
    return C_TEAL if module == "deepdown" else C_VIOLET


def generate_report_pdf(report_data: dict, patient_name: str = "Patient") -> bytes:
    """Generate a professional medical PDF report."""
    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
    )

    module  = report_data.get("module", "alzmind")
    accent  = get_accent(module)
    mod_name = "DeepDown — Dermatological Analysis" if module == "deepdown" else "AlzMind — Neurological Analysis"

    styles   = getSampleStyleSheet()
    story    = []

    # ── Styles ────────────────────────────────────────────────────
    def S(name, **kw):
        return ParagraphStyle(name, **kw)

    sTitle   = S("sTitle",   fontName="Helvetica-Bold",   fontSize=22, textColor=C_DARK,    leading=26, alignment=TA_LEFT)
    sSub     = S("sSub",     fontName="Helvetica",         fontSize=10, textColor=C_MUTED,   leading=14, alignment=TA_LEFT)
    sLabel   = S("sLabel",   fontName="Helvetica-Bold",   fontSize=8,  textColor=C_MUTED,   leading=12, spaceAfter=2, spaceBefore=10)
    sValue   = S("sValue",   fontName="Helvetica",         fontSize=11, textColor=C_TEXT,    leading=15)
    sBody    = S("sBody",    fontName="Helvetica",         fontSize=10, textColor=C_TEXT,    leading=15)
    sBold    = S("sBold",    fontName="Helvetica-Bold",   fontSize=10, textColor=C_TEXT,    leading=15)
    sDisc    = S("sDisc",    fontName="Helvetica-Oblique", fontSize=8,  textColor=C_MUTED,   leading=11, alignment=TA_CENTER)
    sSection = S("sSection", fontName="Helvetica-Bold",   fontSize=12, textColor=C_DARK,    leading=16, spaceBefore=12, spaceAfter=4)
    sFinding = S("sFinding", fontName="Helvetica",         fontSize=10, textColor=C_TEXT,    leading=15)

    ts = datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")
    risk      = report_data.get("riskLevel", "MODERATE")
    risk_col  = get_risk_color(risk)
    clf       = report_data.get("classification", "—")
    conf      = report_data.get("confidence", 0)
    icd       = report_data.get("icd10Code", "—")
    rec       = report_data.get("recommendation", "—")
    findings  = report_data.get("findings", [])
    symptoms  = report_data.get("symptoms", "None reported")
    model_used = report_data.get("modelUsed", "ApexNeura AI")

    # ── Header ────────────────────────────────────────────────────
    header_data = [[
        Paragraph("APEX<font color='#00d48c'>NEURA</font>", S("logo", fontName="Helvetica-Bold", fontSize=18, textColor=C_DARK, leading=22)),
        Paragraph(f"AI Medical Diagnostic Report<br/><font size='8' color='#64748b'>Generated: {ts}</font>",
                  S("hdr_right", fontName="Helvetica", fontSize=10, textColor=C_MUTED, leading=14, alignment=TA_RIGHT)),
    ]]
    header_tbl = Table(header_data, colWidths=[W/2 - MARGIN, W/2 - MARGIN])
    header_tbl.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LINEBELOW", (0,0), (-1,-1), 0.5, C_BORDER),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 10*mm))

    # ── Module + Patient ──────────────────────────────────────────
    story.append(Paragraph(mod_name, S("mod", fontName="Helvetica-Bold", fontSize=10, textColor=accent, leading=14, spaceAfter=3)))
    story.append(Paragraph("Diagnostic Analysis Report", sTitle))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(f"Patient: {patient_name}  |  Report ID: {datetime.utcnow().strftime('%Y%m%d%H%M%S')}", sSub))
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 6*mm))

    # ── Classification + Risk ─────────────────────────────────────
    risk_bg = colors.HexColor("#fef2f2") if risk in ("HIGH","CRITICAL") else \
              colors.HexColor("#fffbeb") if risk == "MODERATE" else \
              colors.HexColor("#f0fdf4")

    clf_data = [[
        [
            Paragraph("CLASSIFICATION", sLabel),
            Paragraph(clf, S("clfV", fontName="Helvetica-Bold", fontSize=20, textColor=C_DARK, leading=24)),
            Spacer(1, 3),
            Paragraph(f"ICD-10: {icd}", S("icd", fontName="Helvetica", fontSize=9, textColor=C_MUTED, leading=12)),
        ],
        [
            Paragraph("RISK LEVEL", sLabel),
            Paragraph(f"⬤  {risk}", S("riskV", fontName="Helvetica-Bold", fontSize=16, textColor=risk_col, leading=20)),
            Spacer(1, 3),
            Paragraph(f"Model Confidence: {conf}%", S("conf", fontName="Helvetica", fontSize=9, textColor=C_MUTED, leading=12)),
        ],
    ]]
    clf_tbl = Table(clf_data, colWidths=[(W - 2*MARGIN)*0.6, (W - 2*MARGIN)*0.4])
    clf_tbl.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("BACKGROUND", (1,0), (1,0), risk_bg),
        ("ROUNDEDCORNERS", [4,4,4,4]),
        ("BOX", (0,0), (-1,-1), 0.5, C_BORDER),
        ("LINEAFTER", (0,0), (0,0), 0.5, C_BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ]))
    story.append(clf_tbl)
    story.append(Spacer(1, 8*mm))

    # ── Confidence bar (text-based) ───────────────────────────────
    story.append(Paragraph("MODEL CONFIDENCE", sLabel))
    bar_filled = int(conf / 5)  # 20 segments total
    bar_empty  = 20 - bar_filled
    bar_str    = "█" * bar_filled + "░" * bar_empty
    story.append(Paragraph(
        f'<font color="{accent.hexval()}">{bar_str}</font>  <b>{conf}%</b>',
        S("bar", fontName="Helvetica", fontSize=10, textColor=C_TEXT, leading=14)
    ))
    story.append(Spacer(1, 8*mm))

    # ── Findings ──────────────────────────────────────────────────
    if findings:
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
        story.append(Spacer(1, 4*mm))
        lbl = "DERMOSCOPY FINDINGS" if module == "deepdown" else "NEUROIMAGING FINDINGS"
        story.append(Paragraph(lbl, sSection))
        for f in findings:
            if f:
                story.append(Paragraph(f"&bull;&nbsp;&nbsp;{f}", sFinding))
                story.append(Spacer(1, 2))

    # ── AlzMind specific ─────────────────────────────────────────
    cdr = report_data.get("cdrScore")
    atrophy = report_data.get("atrophyIndex")
    regions = report_data.get("brainRegionsAffected", [])

    if module == "alzmind" and (cdr or atrophy or regions):
        story.append(Spacer(1, 6*mm))
        story.append(Paragraph("CLINICAL SCORES", sSection))

        scores_data = []
        if cdr:
            scores_data.append([
                Paragraph("CDR SCORE", sLabel),
                Paragraph(str(cdr), S("scoreV", fontName="Helvetica-Bold", fontSize=18, textColor=C_VIOLET, leading=22)),
            ])
        if atrophy:
            scores_data.append([
                Paragraph("ATROPHY INDEX", sLabel),
                Paragraph(str(atrophy), sValue),
            ])

        if scores_data:
            sc_tbl = Table(scores_data, colWidths=[60*mm, (W - 2*MARGIN - 60*mm)])
            sc_tbl.setStyle(TableStyle([
                ("VALIGN", (0,0), (-1,-1), "TOP"),
                ("TOPPADDING", (0,0), (-1,-1), 6),
                ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ]))
            story.append(sc_tbl)

        if regions:
            story.append(Spacer(1, 3*mm))
            story.append(Paragraph("AFFECTED BRAIN REGIONS", sLabel))
            story.append(Paragraph(",  ".join(regions), sFinding))

    # ── Symptoms ─────────────────────────────────────────────────
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("PATIENT-REPORTED SYMPTOMS", sSection))
    story.append(Paragraph(symptoms or "None reported", sBody))

    # ── Recommendation ────────────────────────────────────────────
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("CLINICAL RECOMMENDATION", sSection))

    rec_bg = colors.HexColor("#fef2f2") if risk in ("HIGH","CRITICAL") else C_BG
    rec_tbl = Table([[Paragraph(rec, S("recV", fontName="Helvetica-Bold", fontSize=11, textColor=C_TEXT, leading=16))]],
                    colWidths=[W - 2*MARGIN])
    rec_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), rec_bg),
        ("BOX", (0,0), (-1,-1), 0.5, C_BORDER),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    story.append(rec_tbl)

    # ── Model info ────────────────────────────────────────────────
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(f"AI Model: {model_used}", S("mi", fontName="Helvetica", fontSize=8, textColor=C_MUTED, leading=12)))

    # ── Footer disclaimer ─────────────────────────────────────────
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "⚠ DISCLAIMER: This report is generated by an AI prototype for research and educational purposes only. "
        "It is NOT a substitute for professional medical diagnosis, advice, or treatment. "
        "Always consult a qualified healthcare professional for medical decisions.",
        sDisc
    ))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("ApexNeura AI · Prototype v0.5 · Research & Demo Only", sDisc))

    doc.build(story)
    return buf.getvalue()