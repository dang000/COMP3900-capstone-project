import sqlite3
from typing import Optional, List, Dict

from app.courses.course import Course
from app.courses.clo import Clo
from app.courses.assessment import Assessment
from app.user import User


def get_course_n_from_db(
    user_id: int, course_id: int, cursor: sqlite3.Cursor
) -> Optional[Course]:
    """Get the Nth course for a user from the database"""
    cursor.execute("SELECT * FROM COURSES WHERE USER_ID=?", (user_id,))
    rows = cursor.fetchall()
    if course_id > len(rows):
        return None
    else:
        row = rows[course_id]
        course = Course(
            row["TITLE"],
            row["DISCIPLINE"],
            row["CODE"],
            row["FACULTY"],
            row["DESCRIPTION"],
        )
        load_course_clos_from_db(user_id, row["ID"], course, cursor)
        load_course_assessments_from_db(user_id, row["ID"], course, cursor)
        return course


def update_course_in_db(
    user_id: int, course_id: int, course: Course, cursor: sqlite3.Cursor
):
    """Given a user id, a course id, and a course object,
    update that course id with the details of the course object
    """
    cursor.execute(
        """
        UPDATE COURSES
        SET TITLE = ?, DISCIPLINE = ?, CODE = ?, FACULTY = ?, DESCRIPTION = ?
        WHERE ID = ? AND USER_ID = ?
        """,
        (
            course.title,
            course.discipline,
            course.code,
            course.faculty,
            course.description,
            course_id,
            user_id,
        ),
    )
    delete_all_clos_from_db(user_id, course_id, cursor)
    delete_all_assessments_from_db(user_id, course_id, cursor)
    for clo in course.clos:
        add_clo_to_db(user_id, course_id, clo, cursor)
    for assessment in course.assessments:
        add_assessment_to_db(user_id, course_id, assessment, cursor)


def load_all_courses_from_db(user_id: int, cursor: sqlite3.Cursor) -> List[Dict]:
    """Given a user object, populate the users' course object
    with the necessary details from the database
    """
    cursor.execute("SELECT * FROM COURSES WHERE USER_ID=?", (user_id,))
    rows = cursor.fetchall()
    courses = []
    for row in rows:
        course = Course(
            row["TITLE"],
            row["DISCIPLINE"],
            row["CODE"],
            row["FACULTY"],
            row["DESCRIPTION"],
        )
        load_course_clos_from_db(user_id, row["ID"], course, cursor)
        load_course_assessments_from_db(user_id, row["ID"], course, cursor)
        courses.append(course.publish())
    return courses


def load_last_course_from_db(user_: User, cursor: sqlite3.Cursor) -> bool:
    """Given a user object, populate the users' course object
    with the necessary details from the database
    """
    cursor.execute(
        "SELECT * FROM COURSES WHERE USER_ID=? ORDER BY ID DESC LIMIT 1", (user_.id,)
    )
    row = cursor.fetchone()
    if row is None:
        return False
    course = user_.course
    course.title = row["TITLE"]
    course.discipline = row["DISCIPLINE"]
    course.code = row["CODE"]
    course.faculty = row["FACULTY"]
    course.description = row["DESCRIPTION"]
    load_course_clos_from_db(user_.id, row["ID"], course, cursor)
    load_course_assessments_from_db(user_.id, row["ID"], course, cursor)
    return True


def load_course_clos_from_db(
    user_id: int, course_id: int, course: Course, cursor: sqlite3.Cursor
):
    """Given a user id and a course id, populate the course object
    with found course learning outcomes from the database
    """
    cursor.execute(
        "SELECT * FROM CLOS WHERE USER_ID=? AND COURSE_ID=?", (user_id, course_id)
    )
    rows = cursor.fetchall()
    course.clos = []
    for row in rows:
        course.add_clo(Clo(row["TEXT"]))


def load_course_assessments_from_db(
    user_id: int, course_id: int, course: Course, cursor: sqlite3.Cursor
):
    """Given a user id and a course id, populate the course object
    with found assessments from the database
    """
    cursor.execute(
        "SELECT * FROM ASSESSMENTS WHERE USER_ID=? AND COURSE_ID=?",
        (user_id, course_id),
    )
    rows = cursor.fetchall()
    course.assessments = []
    for row in rows:
        course.add_assessment(Assessment(row["TEXT"], row["WEIGHT"]))


def get_user_from_db(username: str, cursor: sqlite3.Cursor) -> Optional[User]:
    """Given a username, find the corresponding user details from the database
    Usernames' password is not validated here, validate outside of this function
    """
    cursor.execute("SELECT * FROM USERS WHERE USERNAME=?", (username,))
    row = cursor.fetchone()
    if row is None:
        return None
    # Valid row; create a user object
    return User(*row)


def get_course_id_from_db(user_id: int, cursor: sqlite3.Cursor) -> Optional[int]:
    """Given a user id, find the corresponding course id from the database"""
    cursor.execute(
        "SELECT ID FROM COURSES WHERE USER_ID=? ORDER BY ID DESC LIMIT 1", (user_id,)
    )
    row = cursor.fetchone()
    if row is None:
        return None
    # Valid row; create a user object
    return row["ID"]


def add_clo_to_db(
    user_id: int, course_id: int, clo: Clo, cursor: sqlite3.Cursor
) -> bool:
    """Given a user id and course id, add the Clo object to the database"""
    cursor.execute(
        """
        INSERT INTO CLOS (USER_ID, COURSE_ID, TEXT)
        VALUES (?, ?, ?)
    """,
        (user_id, course_id, clo.text),
    )
    return True


def delete_clo_from_db(
    user_id: int, course_id: int, clo: Clo, cursor: sqlite3.Cursor
) -> bool:
    """Given a user id and course id, delete the Assessment object from the database"""
    cursor.execute(
        """
        DELETE FROM CLOS
        WHERE ID IN
        (
            SELECT ID FROM CLOS
            WHERE USER_ID=? AND COURSE_ID=? AND TEXT=?
            LIMIT 1
        )
    """,
        (user_id, course_id, clo.text),
    )
    return True


def delete_all_clos_from_db(user_id: int, course_id: int, cursor: sqlite3.Cursor):
    """Delete all course learning outcomes that match a user_id and course_id"""
    cursor.execute(
        """
        DELETE FROM CLOS WHERE USER_ID=? AND COURSE_ID=?
    """,
        (user_id, course_id),
    )


def add_assessment_to_db(
    user_id: int, course_id: int, assessment: Assessment, cursor: sqlite3.Cursor
) -> bool:
    """Given a user id and course id, add the Assessment object to the database"""
    cursor.execute(
        """
        INSERT INTO ASSESSMENTS (USER_ID, COURSE_ID, TEXT, WEIGHT)
        VALUES (?, ?, ?, ?)
    """,
        (user_id, course_id, assessment.text, assessment.weight),
    )
    return True


def delete_assessment_from_db(
    user_id: int, course_id: int, assessment: Assessment, cursor: sqlite3.Cursor
) -> bool:
    """Given a user id and course id, delete the Assessment object from the database"""
    cursor.execute(
        """
        DELETE FROM ASSESSMENTS
        WHERE ID IN
        (
            SELECT ID FROM ASSESSMENTS
            WHERE USER_ID=? AND COURSE_ID=? AND TEXT=? AND WEIGHT=?
            LIMIT 1
        )
    """,
        (user_id, course_id, assessment.text, assessment.weight),
    )
    return True


def delete_all_assessments_from_db(
    user_id: int, course_id: int, cursor: sqlite3.Cursor
):
    """Delete all course learning outcomes that match a user_id and course_id"""
    cursor.execute(
        """
        DELETE FROM ASSESSMENTS WHERE USER_ID=? AND COURSE_ID=?
    """,
        (user_id, course_id),
    )


def add_course_to_db(user_id: int, course: Course, cursor: sqlite3.Cursor):
    """Given a user id and a course object, add the Course to the database.
    `resolution_method` is one of ['IGNORE', 'REPLACE']
    """
    cursor.execute(
        """
        INSERT INTO COURSES (
            USER_ID,
            TITLE,
            DISCIPLINE,
            CODE,
            FACULTY,
            DESCRIPTION
            )
            VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            user_id,
            course.title,
            course.discipline,
            course.code,
            course.faculty,
            course.description,
        ),
    )
    course_id = get_course_id_from_db(user_id, cursor)
    for clo in course.clos:
        add_clo_to_db(user_id, course_id, clo, cursor)
    for assessment in course.assessments:
        add_assessment_to_db(user_id, course_id, assessment, cursor)
