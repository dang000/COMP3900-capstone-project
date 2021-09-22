# a container for the CLO's and assessments associated with a course
# allows for them to be saved and manipulated
import json
from typing import Dict, List, Optional, Union

from app.courses.assessment import Assessment
from app.courses.clo import Clo


class Course:
    def __init__(
        self,
        title: str = "",
        discipline: str = "",
        code: str = "",
        faculty: str = "",
        description: str = "",
        clos: List[Union[Clo, Dict]] = None,
        assessments: List[Union[Assessment, Dict]] = None,
    ):
        self.title: str = title
        self.discipline: str = discipline
        self.code: str = code
        self.faculty: str = faculty
        self.description: str = description
        self.clos = [] if clos is None else clos
        self.assessments = [] if assessments is None else assessments
        if self.clos and type(self.clos[0]) is dict:
            self.clos = [Clo(**_) for _ in self.clos]
        if self.assessments and type(self.assessments[0]) is dict:
            self.assessments = [Assessment(**_) for _ in self.assessments]

    def __repr__(self) -> str:
        return (
            f"<Course "
            f"{self.title=}, "
            f"{self.discipline=}, "
            f"{self.code=}, "
            f"{self.faculty=}, "
            f"{self.description=}, "
            f"{self.clos=}, "
            f"{self.assessments=}>"
        )

    def set_title(self, title: str):
        self.title = title

    def get_title(self) -> str:
        return self.title

    def set_discipline(self, discipline: str):
        self.discipline = discipline

    def get_discipline(self) -> str:
        return self.discipline

    def set_code(self, code: str):
        self.code = code

    def get_code(self) -> str:
        return self.code

    def set_faculty(self, faculty: str):
        self.faculty = faculty

    def get_faculty(self) -> str:
        return self.faculty

    def set_description(self, description):
        self.description = description

    def get_description(self) -> str:
        return self.description

    def add_clo(self, clo: Clo) -> bool:
        if clo.valid():
            self.clos.append(clo)
            return True
        else:
            return False

    # TODO: consider better id then just the index
    def fetch_clo(self, id: int) -> Clo:
        return self.clos[id]

    def remove_clo(self, id: int) -> Clo:
        return self.clos.pop(id)

    def add_assessment(self, assessment: Assessment) -> bool:
        if assessment.valid():
            self.assessments.append(assessment)
            return True
        else:
            return False

    # determine how to uniquely id a assessment
    def fetch_assessment(self, id):
        return

    # determine how to uniquely id a clo
    def remove_assessment(self, id):
        return self.assessments.pop(id)

    def find_clo(self, search: str) -> int:
        for i, clo in enumerate(self.clos):
            if clo.matches(search):
                return i
        # no clo found
        return -1

    # returns all clos that match the search
    def find_clos(self, search: str) -> List[Clo]:
        matching = [clo for clo in self.clos if clo.matches(search)]
        return matching

    def find_assessment(self, search: str, weight: int) -> int:
        for i, ass in enumerate(self.assessments):
            if ass.matches(search, weight):
                return i
        # no assessment found
        return -1

    # returns assessments that match the search
    def find_assessments(self, search: str) -> List[Assessment]:
        matching = [ass for ass in self.assessments if ass.matches(search)]
        return matching

    # returns an empty JSON container
    @staticmethod
    def empty() -> dict:
        temp = Course()
        return temp.publish()

    # puts objects fields into a dictionary for publication
    def encode(self, clos: Dict, assessments: Dict) -> dict:
        return {
            "success": True,
            "title": self.title,
            "discipline": self.discipline,
            "code": self.code,
            "faculty": self.faculty,
            "description": self.description,
            "clos": clos,
            "assessments": assessments,
        }

    # publishes the course with a provided set of clos and assessments
    # if none given, publish the whole course
    def publish(
        self,
        clos: Optional[List[Clo]] = None,
        assessments: Optional[List[Assessment]] = None,
    ) -> dict:
        if clos is None:
            clos = self.clos
        if assessments is None:
            assessments = self.assessments
        clos = [{"text": x.get_text()} for x in clos]
        assessments = [
            {"text": x.get_text(), "weight": x.get_weight()} for x in assessments
        ]
        return json.dumps(self.encode(clos, assessments))
