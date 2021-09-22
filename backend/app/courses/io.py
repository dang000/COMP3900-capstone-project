import json
from abc import ABC, abstractmethod
from io import BytesIO
from typing import Union

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table

from app.courses.course import Course


class Writer(ABC):
    def __init__(self, course: Course):
        self._course: Course = course

    @abstractmethod
    def save(self, path: Union[BytesIO, str]):
        pass


class JSONWriter(Writer):
    def __init__(self, course: Course):
        super().__init__(course)

    def save(self, path: Union[BytesIO, str]):
        out = {
            "title": self._course.get_title(),
            "faculty": self._course.get_faculty(),
            "discipline": self._course.get_discipline(),
            "code": self._course.get_code(),
            "description": self._course.get_description(),
            "clos": [
                {
                    "text": clo.get_text(),
                }
                for clo in self._course.clos
            ],
            "assessments": [
                {
                    "text": assessment.get_text(),
                    "weight": assessment.get_weight(),
                }
                for assessment in self._course.assessments
            ],
        }
        if isinstance(path, BytesIO):
            path.write(json.dumps(out).encode())
        else:
            # we're given a str, bytes, or os.PathLike object
            with open(path, "w") as f:
                json.dump(out, f)


class PDFWriter(Writer):
    __styles = getSampleStyleSheet()
    __styleT = __styles["Title"]
    __styleN = __styles["Normal"]
    __styleH1 = __styles["Heading1"]
    __styleH2 = __styles["Heading2"]
    __styleBullet = __styles["Bullet"]

    def __init__(self, course: Course):
        super().__init__(course)

    def save(self, path: Union[BytesIO, str]):
        doc = SimpleDocTemplate(path)
        story = []
        story.append(
            Paragraph(self._course.title or "PLACEHOLDER TITLE", PDFWriter.__styleT)
        )
        story.append(
            Paragraph(
                f"{self._course.faculty or 'PLACEHOLDER FACULTY'}: "
                f"{self._course.discipline or 'PLACEHOLDER DISCIPLINE'} "
                f"{self._course.code or 'PLACEHOLDER CODE'}",
                PDFWriter.__styleH1,
            )
        )
        story.append(Spacer(1, 0.1 * inch))
        story.append(
            Paragraph(
                self._course.description or "PLACEHOLDER DESCRIPTION",
                PDFWriter.__styleN,
            )
        )
        story.append(Spacer(1, 0.1 * inch))
        story.append(Paragraph("Course Learning Outcomes", PDFWriter.__styleH2))
        for clo in self._course.clos:
            story.append(
                Paragraph(
                    f"{clo.text or 'PLACEHOLDER CLO TEXT'}",
                    PDFWriter.__styleBullet,
                    bulletText="*",
                )
            )
        story.append(Paragraph("Assessments", PDFWriter.__styleH2))
        data = [["Assessment Type", "Assessment Weights"]]
        data += [
            [
                assessment.text or "PLACEHOLDER ASSESSMENT TEXT",
                str(assessment.get_weight() or "PLACEHOLDER ASSESSMENT WEIGHT"),
            ]
            for assessment in self._course.assessments
        ]
        table = Table(data)
        table.setStyle(
            [
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
            ]
        )
        story.append(table)
        doc.build(story)
