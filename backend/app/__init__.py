import hashlib
import json
import sqlite3
import secrets
from contextlib import closing
from datetime import datetime, timedelta, timezone
from io import BytesIO
from typing import Dict

from flask import Flask, request, g, make_response, jsonify
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
    get_jwt,
    current_user,
    jwt_required,
    JWTManager,
)

import config
from app.courses.assessment import Assessment
from app.courses.clo import Clo
from app.courses.course import Course
from app.courses.io import PDFWriter, JSONWriter
from app.database import (
    get_course_n_from_db,
    update_course_in_db,
    load_all_courses_from_db,
    load_last_course_from_db,
    get_user_from_db,
    get_course_id_from_db,
    add_clo_to_db,
    delete_clo_from_db,
    add_assessment_to_db,
    delete_assessment_from_db,
    add_course_to_db,
)
from app.evaluation.evaluator import evaluate
from app.question import parse_answers
from app.user import User

current_user: User

app = Flask(__name__)

# TODO: appropriate handling of secrets
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_SECRET_KEY"] = secrets.token_urlsafe(20)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)


@app.before_first_request
def create_tables_in_db():
    """Create table if they don't exist"""
    with closing(sqlite3.connect(config.DATABASE)) as db:
        app.logger.info("Creating tables if they do not exist...")
        with open(config.CREATE_TABLES_SQL) as f:
            db.executescript(f.read())
        db.commit()


@app.before_request
def connect_db():
    """Connect to database before each request"""
    app.logger.info("Connecting to database: %s...", config.DATABASE)
    g.db = sqlite3.connect(config.DATABASE)
    g.db.row_factory = sqlite3.Row
    g.cursor = g.db.cursor()


@app.teardown_request
def commit_and_close_db(exception):
    """Commit transactions and close the current connection"""
    if exception is not None:
        app.logger.error("Got exception: %s...", exception)
    if hasattr(g, "db"):
        app.logger.info("Closing database: %s...", config.DATABASE)
        g.cursor.close()
        g.db.commit()
        g.db.close()


@app.after_request
def refresh_expiring_jwts(response):
    """Refresh token"""
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=1))
        if target_timestamp > exp_timestamp and current_user.logged_in():
            app.logger.info("Refresh...")
            access_token = create_access_token(identity=current_user)
            set_access_cookies(response, access_token)
        else:
            app.logger.info("No refresh!")
        return response
    except (RuntimeError, KeyError):
        return response


@app.route("/register", methods=["POST"])
def register():
    """Register a new user into the database"""
    data = json.loads(request.data)
    app.logger.info(data)
    username = data.get("username", "")
    if not username:
        return make_response({"success": False, "result": "Username must not be empty"})
    password = data.get("password", "")
    if len(password) < 8:
        return make_response(
            {"success": False, "result": "Password must be at least 8 characters"}
        )
    password_confirm = data.get("password_confirm", "")
    if password != password_confirm:
        return make_response(
            {"success": False, "result": "Passwords don't match, please try again"}
        )
    hashed_password = hashlib.md5(password.encode()).hexdigest()
    try:
        g.db.execute(
            "INSERT INTO USERS (USERNAME, PASSWORD) VALUES (?, ?)",
            (username, hashed_password),
        )
    except sqlite3.IntegrityError:
        app.logger.info("Username '%s' is already taken", username)
        return json.dumps(
            {"success": False, "result": f"Username {username} is already taken"}
        )
    app.logger.info("New User added with username '%s'", username)
    return json.dumps({"success": True, "result": "Successfully registered!"})


@app.route("/login", methods=["POST"])
def login():
    """Login for a user"""
    data = json.loads(request.data)
    app.logger.info(data)
    username = data.get("username", "")
    hashed_password = hashlib.md5(data.get("password", "").encode()).hexdigest()
    user_ = get_user_from_db(username, g.cursor)
    if user_ is None or not user_.validate(hashed_password):
        return json.dumps(
            {"success": False, "result": "Username or password is incorrect"}
        )
    user_.login()
    response = jsonify({"success": True})
    app.logger.info("Creating access token...")
    access_token = create_access_token(identity=user_)
    app.logger.info("Setting access cookies...")
    set_access_cookies(response, access_token)
    app.logger.info(response)
    return response


@app.route("/logoff", methods=["GET"])
@jwt_required()
def logoff() -> Dict:
    """Logoff current user"""
    response = jsonify({"success": current_user.logoff()})
    unset_jwt_cookies(response)
    return response


@jwt.user_identity_loader
def user_identity_lookup(user_: User):
    """Convert user to key"""
    app.logger.info("Converting user to key")
    app.logger.info(f"{user_=}")
    return user_.username


@jwt.user_lookup_loader
def user_lookup_loader(_jwt_header, jwt_data):
    """Lookup current user and get the last course in the database for the user"""
    username = jwt_data["sub"]
    app.logger.info("Getting User object for user '%s'...", username)
    user_ = get_user_from_db(username, g.cursor)
    if user_ is None:
        raise RuntimeError(f"Could not find user '{username}' in the database")
    app.logger.info("Loading courses for user '%s'...", username)
    if load_last_course_from_db(user_, g.cursor):
        app.logger.info("Loaded course for user '%s'", username)
    else:
        app.logger.info("No course found for user '%s'", username)
    app.logger.info("Got User object '%s'", user_)
    return user_


@jwt_required(optional=True)
def add_message_to_db(id_: int, msg: str):
    """Adds user feedback to the database"""
    g.db.execute("INSERT INTO FEEDBACK VALUES (?, ?)", (id_, msg))


@app.route("/evaluate", methods=["POST"])
@jwt_required()
def evaluating() -> str:
    """Evaluates a clo, returning feedback

    Input JSON with a inputs field (CLO as string)

    Args:
        data:

    Returns:
        output JSON with a result field (feedback as string)
    """
    data = json.loads(request.data)
    app.logger.info(data)
    course = current_user.course
    course_description = course.get_description()
    result = evaluate(data["inputs"], course_description)
    return json.dumps({"success": True, "result": result})


# allows users to upload a file
@app.route("/upload", methods=["POST"])
@jwt_required()
def upload():
    try:
        app.logger.info("Entered upload function")
        data = json.loads(request.data)
        file_data = json.loads(data["file"])
        course_id = get_course_id_from_db(current_user.id, g.cursor)
        course = Course(**file_data)
        app.logger.info("Created Course=%s", course)
        if course_id is None:
            add_course_to_db(current_user.id, course, g.cursor)
        else:
            update_course_in_db(current_user.id, course_id, course, g.cursor)
        return json.dumps({"success": True, "result": "Course uploaded successfully!"})
    except (json.decoder.JSONDecodeError, TypeError):
        return json.dumps(
            {
                "success": False,
                "result": "Course upload failed. Got malformed JSON file",
            }
        )


@app.route("/add_desc", methods=["POST"])
@jwt_required()
def add_desc() -> str:
    """Adds clo to course

    Input JSON text field (CLO as string)

    Returns:
        output JSON with success (bool) and result (bool)
    """
    data = json.loads(request.data)
    course = current_user.course
    result = course.set_description(data["text"])
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        add_course_to_db(current_user.id, course, g.cursor)
    else:
        update_course_in_db(current_user.id, course_id, course, g.cursor)
    return json.dumps({"success": True, "result": result})


@app.route("/save_course", methods=["GET"])
@jwt_required()
def save_course() -> str:
    """Save the current course to the database and start a new one"""
    add_course_to_db(current_user.id, Course(), g.cursor)
    return json.dumps({"success": True, "result": "Course successfully saved!"})


@app.route("/add_assessment", methods=["POST"])
@jwt_required()
def add_assessment() -> str:
    """Adds assessment to course

    Input JSON text field (assessment as string) and
    Weight field (assessment weight as int)

    Returns:
        output JSON with success (bool) and result (bool)
    """
    data = json.loads(request.data)
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        return json.dumps(
            {
                "success": False,
                "result": "Error: Could not add assessment as course could not be found",
            }
        )
    result = add_assessment_to_db(
        current_user.id,
        course_id,
        Assessment(data["text"], int(data["weight"])),
        g.cursor,
    )
    return json.dumps({"success": True, "result": result})


@app.route("/remove_assessment", methods=["POST"])
@jwt_required()
def remove_assessment() -> str:
    """Removes a clo of the course input JSON text field (CLO to remove as string)

    Returns:
        output JSON with success (bool) and result (bool)
    """
    data = json.loads(request.data)
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        return json.dumps(
            {
                "success": False,
                "result": "Error: Could not remove assessment as course could not be found",
            }
        )
    delete_assessment_from_db(
        current_user.id,
        course_id,
        Assessment(data["text"], int(data["weight"])),
        g.cursor,
    )
    return json.dumps({"success": True, "result": True})


@app.route("/set_assessment_rating", methods=["POST"])
@jwt_required()
def set_assessment_rating():
    """Set rating for an assessment"""
    data = json.loads(request.data)
    g.db.execute(
        "INSERT INTO ASSESSMENT_RATINGS VALUES (?, ?, ?, ?)",
        (current_user.id, data["text"], int(data["weight"]), data["rating"]),
    )
    return json.dumps({"success": True, "result": True})


@app.route("/add_clo", methods=["POST"])
@jwt_required()
def add_clo() -> str:
    """Adds clo to course input JSON text field (CLO as string)

    Returns:
        output JSON with success (bool) and result (bool)
    """
    data = json.loads(request.data)
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        return json.dumps(
            {
                "success": False,
                "result": "Error: Could not add clo as course could not be found",
            }
        )
    result = add_clo_to_db(current_user.id, course_id, Clo(data["text"]), g.cursor)
    return json.dumps({"success": True, "result": result})


@app.route("/remove_clo", methods=["POST"])
@jwt_required()
def remove_clo() -> str:
    """Removes a clo of the course input JSON and text field (CLO to remove as string)

    Returns:
        output JSON with success (bool) and result (bool)
    """
    data = json.loads(request.data)
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        return json.dumps(
            {
                "success": False,
                "result": "Error: Could not remove clo as course could not be found",
            }
        )
    delete_clo_from_db(current_user.id, course_id, Clo(data["text"]), g.cursor)
    return json.dumps({"success": True, "result": True})


@app.route("/set_clo_rating", methods=["POST"])
@jwt_required()
def set_clo_rating():
    """Update database with the CLO rating"""
    data = json.loads(request.data)
    g.db.execute(
        "INSERT INTO CLO_RATINGS VALUES (?,?,?)",
        (current_user.id, data["text"], data["rating"]),
    )
    return json.dumps({"success": True, "result": True})


@app.route("/course_info", methods=["GET"])
@jwt_required()
def course_info() -> Dict:
    """Gets the info of the current course for the user

    Returns:
        outputs JSON containing course info as follows
            success: boolean
            title: string
            discipline: string
            code: string
            faculty: string
            clos: all clos as an array of strings
            assessments:  all assessments as an array of strings
    """
    course = current_user.course
    return course.publish()


@app.route("/all_course_info", methods=["GET"])
@jwt_required()
def all_course_info() -> Dict:
    """Get all course detail info for the current user"""
    courses = load_all_courses_from_db(current_user.id, g.cursor)
    app.logger.info("Found courses %s for user %s", courses, current_user)
    return {"courses": courses}


@app.route("/modify_course", methods=["POST"])
@jwt_required()
def modify_course() -> str:
    """Modifies meta data of courses

       input JSON with following fields
       title: string representing new title
       discipline: string representing the discipline of the course
       code: string representing the course code
       faculty: string representing the school the course belongs too

    Returns:
        output JSON with success (bool), and result (bool)
    """
    data = json.loads(request.data)
    course = current_user.course
    course.set_title(data["title"])
    course.set_discipline(data["discipline"])
    course.set_code(data["code"])
    course.set_faculty(data["faculty"])
    course_id = get_course_id_from_db(current_user.id, g.cursor)
    if course_id is None:
        add_course_to_db(current_user.id, course, g.cursor)
    else:
        update_course_in_db(current_user.id, course_id, course, g.cursor)
    return json.dumps({"success": True, "result": "Success: Course updated!"})


@app.route("/question", methods=["POST"])
@jwt_required()
def question() -> str:
    """Converts user input into course description for CLO generation purposes
        inputs: JSON object containing
        title: String representing course title
        faculty: string representing course faculty
        code: string representing course code
        aim: string representing the aim of the course
        clos: number of clo inputs
        clo: json array of json objects containing the following fields
            desc: an expectation of a particular thing to be learnt
            qual: the level at which students are expected to learn it
        Important note, options on which qual can be can be found in question.py

    Returns:
        outputs: JSON object contatining
            success: boolean representing succesful operation
            result: course description
    """
    data = json.loads(request.data)
    course = current_user.course
    app.logger.info(data["answers"])
    answer = parse_answers(course, data["answers"])
    app.logger.info("Created answer '%s'", answer)
    return json.dumps({"success": True, "result": answer})


@app.route("/send_message", methods=["POST"])
@jwt_required(optional=True)
def send_message() -> str:
    """Save feedback message to database"""
    data = json.loads(request.data)
    add_message_to_db(current_user.id, data["text"])
    return json.dumps({"success": True, "result": "Success: Feedback submitted!"})


@app.route("/login_status", methods=["GET"])
@jwt_required(optional=True)
def login_status() -> str:
    """Check if a user is currently logged in"""
    app.logger.info("Checking login status...")
    return json.dumps({"success": True, "result": bool(current_user)})


@app.route("/download/<string:filetype>", methods=["GET"])
@app.route("/download/<string:filetype>/<int:course_id>", methods=["GET"])
@jwt_required()
def download(filetype: str, course_id: int = None):
    """Download course object as a file. Supported filetypes are pdf, json."""
    # create in memory buffer
    if course_id is None:
        course = current_user.course
    else:
        course = get_course_n_from_db(current_user.id, course_id, g.cursor)
        if course is None:
            raise RuntimeError(
                f"Got a request for the {course_id}th course for the user but could not find it"
            )
    buffer = BytesIO()
    if filetype == "pdf":
        writer = PDFWriter(course)
    elif filetype == "json":
        writer = JSONWriter(course)
    else:
        raise RuntimeError(
            f"Invalid filetype option '{filetype}', please give one of ['pdf', 'json']"
        )
    # write to buffer
    writer.save(buffer)
    # get underlying buffer content
    data = buffer.getvalue()
    # send binary data to frontend
    return make_response(data)
