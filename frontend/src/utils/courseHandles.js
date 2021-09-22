// holds all api calls for interacting with the backend server

/**
 * TODO
 * @param name
 * @returns {string}
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  let ret = '';
  if (parts.length === 2) ret = parts.pop().split(';').shift();
  console.log(ret);
  return ret;
}

/**
 * Helper function to call backend server API
 * @param serverUrl API route
 * @param method one of ['GET', 'POST']
 * @param body if method is 'POST', body contains data to send to server
 * @param errorMessage error message to display if call fails
 * @returns {Promise<Response>} Promise returned by fetch to server
 */
async function callServerApi(serverUrl, method, body = null, errorMessage = 'Unknown error') {
  const result = await fetch(serverUrl, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCookie('csrf_access_token'),
    },
    [method === 'POST' ? 'body' : null]: JSON.stringify({ ...body }),
  });
  if (result.status !== 200) {
    if (result.status !== 401 || serverUrl !== '/login_status') {
      throw new Error(errorMessage);
    }
  }
  return result;
}

/**
 * Set user rating for a Course Learning Outcome
 * @param clo CLO object
 * @param rating User rating
 * @returns {Promise<Response>}
 */
export async function setCloRating(clo, rating) {
  return callServerApi('/set_clo_rating', 'POST',
    {
      text: clo.generated_text,
      rating,
    }, 'Failed to set course learning outcome rating');
}

/**
 * Set user rating for an Assessment
 * @param assessment Assessment object
 * @param rating User rating
 * @returns {Promise<Response>}
 */
export async function setAssessmentRating(assessment, rating) {
  return callServerApi('/set_assessment_rating', 'POST',
    {
      text: assessment.label,
      weight: assessment.weight,
      rating,
    }, 'Failed to set assessment rating');
}

/**
 * Set course information for the current user
 * @param courseObject Course object containing course details
 * @returns {Promise<Response>}
 */
export async function setCourseInfo(courseObject) {
  return callServerApi('/modify_course', 'POST',
    {
      title: courseObject.title,
      discipline: courseObject.discipline,
      code: courseObject.code,
      faculty: courseObject.faculty,
      aim: courseObject.aim,
    }, 'Failed to set course info');
}

/**
 * Send current user feedback to the server
 * @param input User feedback
 * @returns {Promise<Response>}
 */
export async function sendMessage(input) {
  return callServerApi('/send_message', 'POST',
    {
      text: input,
    }, 'Failed to get course info');
}

/**
 * Get all course object information for the current user
 * @returns {Promise<Response>}
 */
export async function getAllCourseInfo() {
  return callServerApi('/all_course_info', 'GET', {},
    'Failed to get all course info');
}

/**
 * Get course information for the active course for the current user
 * User can only have one `active` course at a time
 * @returns {Promise<Response>}
 */
export async function getCourseInfo() {
  return callServerApi('/course_info', 'GET', {},
    'Failed to get course info');
}

/**
 * Add description to the active course for the current user
 * @param description Course description
 * @returns {Promise<Response>}
 */
export async function addDesc(description) {
  return callServerApi('/add_desc', 'POST',
    {
      text: description,
    }, 'Failed to add description');
}

/**
 * Send user answers to questions on QuestionPage.js to be parsed by server
 * @param answers User answers
 * @returns {Promise<Response>}
 */
export async function parseQuestions(answers) {
  return callServerApi('/question', 'POST',
    {
      answers,
    },
    'Failed to send question answers');
}

/**
 * Adds a CLO to the active course for the current user
 * @param resObject CLO
 * @returns {Promise<Response>}
 */
export async function addClo(resObject) {
  return callServerApi('/add_clo', 'POST',
    {
      text: resObject.generated_text,
    },
    'Failed to add course learning outcome');
}

/**
 * Remove a CLO for the active course for the current user
 * @param resObject CLO
 * @returns {Promise<Response>}
 */
export async function removeClo(resObject) {
  return callServerApi('/remove_clo', 'POST',
    {
      text: resObject.generated_text,
    },
    'Failed to remove course learning outcome');
}

/**
 * Add assessment for the active course for the current user
 * @param resObject Assessment
 * @returns {Promise<Response>}
 */
export async function addAssessment(resObject) {
  return callServerApi('/add_assessment', 'POST',
    {
      text: resObject.label,
      weight: resObject.weight,
    },
    'Failed to add assessment');
}

/**
 * Remove assessment for the active course for the current user
 * @param resObject Assessment
 * @returns {Promise<Response>}
 */
export async function removeAssessment(resObject) {
  return callServerApi('/remove_assessment', 'POST',
    {
      text: resObject.label,
      weight: resObject.weight,
    },
    'Failed to remove assessment');
}

/**
 * Try to login the user in with user input
 * @param user Username
 * @param pass Password
 * @returns {Promise<Response>}
 */
export async function userLogin(user, pass) {
  return callServerApi('/login', 'POST',
    {
      username: user,
      password: pass,
    },
    'Failed to login');
}

/**
 * Register a new user to the server
 * @param user Username
 * @param pass Password
 * @param passConf Confirm password
 * @returns {Promise<Response>}
 */
export async function register(user, pass, passConf) {
  return callServerApi('/register', 'POST',
    {
      username: user,
      password: pass,
      password_confirm: passConf,
    },
    'Failed to register new account');
}

/**
 * Check login status for the current user
 * @returns {Promise<boolean>}
 */
export async function checkLogStatus() {
  const ret = await callServerApi('/login_status', 'GET',
    {}, 'Failed to check login status');
  const retJSON = await ret.json();
  return retJSON.result === true;
}

/**
 * Log the current user off
 * @returns {Promise<Response>}
 */
export async function logoff() {
  return callServerApi('/logoff', 'GET', {}, 'Failed to log off');
}

/**
 * Save a course with current details to the backend and start a new course
 * @returns {Promise<Response>}
 */
export async function saveCourse() {
  return callServerApi(
    '/save_course',
    'GET',
    {},
    'Failed to save course',
  );
}

/**
 * Upload a file to the backend
 * @param file JSON file
 * @returns {Promise<Response>}
 */
export async function upload(file) {
  console.log('Uploading file');
  return callServerApi('/upload', 'POST',
    {
      file,
    },
    'Failed to upload');
}

/**
 * Evaluate a user's CLO
 * @param clo CLO
 * @returns {Promise<Response>}
 */
export async function evaluate(clo) {
  return callServerApi('/evaluate', 'POST',
    {
      inputs: clo,
    },
    'Failed to evaluate');
}
