from typing import Dict, List

from app.courses.course import Course


def qualification(word: str) -> str:
    """
    A simple function to string together a course description from user answers
    turns the word that indicates level of understanding
    to a suffix that makes sense
    """
    if word == "Evaluate":
        return "Judge it."
    elif word == "Synthesise":
        return "integrate it."
    elif word == "Analyse":
        return "investigate it."
    elif word == "Apply":
        return "practice it"
    elif word == "Comprehend":
        return "fathom it."
    else:
        return "evoke it."


def parse_answers(course: Course, answers: List[Dict]) -> str:
    """Takes user input, as JSON of strings in order of provided

    Args:
        course: Course
        answers: answers from question pages

    Returns:
        General course description
    """
    desc = f"The course {course.get_title()} belonging to the "
    desc += f"{course.get_faculty()} faculty intends to teach in "
    desc += f"{course.get_discipline()} field. {course.get_description()}.Upon"
    desc += " students will learn:\n"
    # assumes the following args come in pairs
    for clo in answers:
        # TODO: 'qual' is not in dictionary, passing empty string for now
        desc += f"{clo['desc']} to {qualification(clo.get('qual', ''))}\n"
    return desc
