import React, { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import Loader from 'react-loader-spinner';
import BottomBar from './components/BottomBar';
import {
  HomePage,
  HistoryPage,
  ResultsPage,
  QuestionPage,
  EvaluatorPage,
  DisplayInfoPage,
  EditPage,
  FeedbackPage,
  RegisterPage,
  LoginPage,
} from './pages';
import UploadPage from './pages/UploadPage';
import {
  checkLogStatus,
  userLogin,
  logoff,
  register,
  sendMessage,
  setCourseInfo,
  getCourseInfo,
  parseQuestions,
  addDesc,
  addClo,
  removeClo,
  setCloRating,
  addAssessment,
  removeAssessment,
  setAssessmentRating,
  saveCourse,
  upload,
} from './utils/courseHandles';

function App() {
  const [clos, setClos] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const accountObj = {
    username,
    loggedIn,
    setUsername,
    setLoggedIn,
    logoff,
    checkLogStatus,
  };

  // HuggingFace API URL for the CLO generator Model
  const cloModel = 'https://api-inference.huggingface.co/models/Khu1998/clog-clo-model';
  // HuggingFace API URL for the Assessment generator Model
  const assessmentModel = 'https://api-inference.huggingface.co/models/Khu1998/clog-assessment-model';

  class Labels {
    /**
     * Labels which may occur once as output by the generator
     */
    static singleLabelAllowed = [
      'Portfolio',
      'Final exam',
    ];

    /**
     * Labels which may occur multiple times as output by the generator
     */
    static multipleLabelsAllowed = [
      'Lab',
      'Essay',
      'Report',
      'Class test',
      'Assignment',
      'Presentation',
      'Group assignment',
      'Class participation',
    ];

    /**
     * Get a random assessment label.
     * If the assessment label can only occur once,
     * then remove it as an available option.
     * This ensures that it won't be possible to get
     * 2 Final exam suggestions.
     * @returns {string} [assessment label]
     */
    static getRandomLabel() {
      let n = Math.floor(Math.random()
        * (Labels.singleLabelAllowed.length + Labels.multipleLabelsAllowed.length));
      if (n < Labels.singleLabelAllowed.length) {
        const ret = Labels.singleLabelAllowed[n];
        Labels.singleLabelAllowed.splice(n, 1);
        return ret;
      }
      n -= Labels.singleLabelAllowed.length;
      return Labels.multipleLabelsAllowed[n];
    }

    /**
     * Check if label has been assigned or not
     * @param label
     * @returns {boolean}
     */
    static containsSingleLabel(label) {
      return Labels.singleLabelAllowed.includes(label);
    }
  }

  /**
   * Generate body accepted by the CLO URL
   * @param input Course description
   * @returns {{headers: {Accept: string, "Content-Type": string}, method: string, body: string}}
   */
  function fillCloQuery(input) {
    return {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
        parameters: {
          top_k: 50,
          top_p: 0.95,
          num_return_sequences: 3,
        },
        options: {
          use_cache: true,
          wait_for_model: true,
        },
      }),
    };
  }

  /**
   * Generate body accepted by the Assessment URL
   * @param input Course Learning Outcome Text
   * @returns {{headers: {Accept: string, "Content-Type": string}, method: string, body: string}}
   */
  function fillAssessmentQuery(input) {
    return {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
        options: {
          use_cache: true,
          wait_for_model: true,
        },
      }),
    };
  }

  // TODO: untagle from app state to be moved to generator file
  /**
   * Take a user's course description input and generate
   * corresponding CLO and Assessment from that input.
   * CLO's are generated from the course description.
   * Assessment's are generated from the CLO's
   * @param input Course description
   * @param history Page history
   * @returns {Promise<void>}
   */
  const handleSubmit = async (input, history) => {
    setIsLoading(true);
    const result = await fetch(cloModel, fillCloQuery(input));

    if (result.status === 200) {
      const clos = await result.json();
      let results = [];
      for (let i = 0; i < clos.length; i++) {
        clos[i].id = uuid();
        clos[i].removed = false;
        results.push(fetch(assessmentModel, fillAssessmentQuery(clos[i].generated_text)));
      }
      results = await Promise.all(results);

      let assessments = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 200) {
          assessments.push(results[i].json());
        }
      }
      assessments = await Promise.all(assessments);

      for (let i = 0; i < assessments.length; i++) {
        const assessmentPredictions = assessments[i][0];
        let bestLabel = assessmentPredictions.reduce((a, b) => (a.score > b.score ? a : b)).label;
        // check if single label option is available to be assigned
        // get random label if not available
        if (!Labels.containsSingleLabel(bestLabel)) {
          bestLabel = Labels.getRandomLabel();
        }
        // check if model returned ? as label
        // get random label if so
        if (bestLabel === '?') {
          bestLabel = Labels.getRandomLabel();
        }
        assessments[i].label = bestLabel;
        assessments[i].id = uuid();
        assessments[i].removed = false;
      }

      // assign initial weights
      let totalWeight = 100;
      let remainingAssessments = 0;
      for (let i = 0; i < assessments.length; i++) {
        // set assessment weight to null initially
        assessments[i].weight = null;
        if (assessments[i].label === 'Final exam') {
          // if label is final exam, set weight to 50
          assessments[i].weight = 50;
        } else if (assessments[i].label === 'Class participation') {
          // if label is class participation, set weight to 10
          assessments[i].weight = 10;
        }
        if (assessments[i].weight != null) {
          totalWeight -= assessments[i].weight;
        } else {
          remainingAssessments++;
        }
      }

      // assign remaining
      for (let i = 0; i < assessments.length; i++) {
        if (assessments[i].weight === null) {
          assessments[i].weight = Math.floor(totalWeight / remainingAssessments);
        }
      }
      setClos(clos);
      setAssessments(assessments);
      history.push('/results');
      setIsLoading(false);
    }
  };

  useEffect(async () => {
    localStorage.clear();
    const ret = await checkLogStatus();
    setLoggedIn(ret);
  }, []);

  return (
    <div className="App">
      {isLoading
        && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loader type="ThreeDots" color="#00000" height="100" width="100" />
          </div>
        )}
      {(loggedIn !== null)
        ? (
          <Router>
            <Switch>
              <Route exact path="/home">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <HomePage
                      handleSubmit={handleSubmit}
                      addDesc={addDesc}
                      accountObj={accountObj}
                      checkLogStatus={checkLogStatus}
                      saveCourse={saveCourse}
                    />
                  )}
              </Route>
              <Route exact path="/question">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <QuestionPage
                      handleSubmit={handleSubmit}
                      setCourseInfo={setCourseInfo}
                      getCourseInfo={getCourseInfo}
                      parseQuestions={parseQuestions}
                      setIsLoading={setIsLoading}
                    />
                  )}
              </Route>
              <Route exact path="/results">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <ResultsPage
                      clos={clos}
                      setClos={setClos}
                      assessments={assessments}
                      setAssessments={setAssessments}
                      addClo={addClo}
                      addAssessment={addAssessment}
                      setCloRating={setCloRating}
                      setAssessmentRating={setAssessmentRating}
                      setIsLoading={setIsLoading}
                    />
                  )}
              </Route>
              <Route exact path="/contact_us">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <FeedbackPage sendMessage={sendMessage} />
                  )}
              </Route>
              <Route exact path="/evaluator">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <EvaluatorPage setIsLoading={setIsLoading} />
                  )}
              </Route>
              <Route exact path="/display">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <DisplayInfoPage
                      getCourseInfo={getCourseInfo}
                      setIsLoading={setIsLoading}
                    />
                  )}
              </Route>
              <Route exact path="/edit">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <EditPage
                      getCourseInfo={getCourseInfo}
                      addClo={addClo}
                      removeClo={removeClo}
                      addAssessment={addAssessment}
                      removeAssessment={removeAssessment}
                      setIsLoading={setIsLoading}
                    />
                  )}
              </Route>
              <Route exact path="/history">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <HistoryPage />
                  )}
              </Route>
              <Route exact path="/upload">
                {!loggedIn ? <Redirect to="/login" />
                  : (
                    <UploadPage upload={upload} />
                  )}
              </Route>
              <Route exact path="/login">
                {loggedIn ? <Redirect to="/home" />
                  : (
                    <LoginPage
                      login={userLogin}
                      accountObj={accountObj}
                    />
                  )}
              </Route>
              <Route exact path="/register">
                {loggedIn ? <Redirect to="/home" />
                  : (
                    <RegisterPage
                      register={register}
                      accountObj={accountObj}
                    />
                  )}
              </Route>
              <Route path="/">
                {loggedIn ? <Redirect to="/home" />
                  : (
                    <LoginPage
                      login={userLogin}
                      accountObj={accountObj}
                    />
                  )}
              </Route>
            </Switch>
            <BottomBar accountObj={accountObj} />
          </Router>
        ) : <div />}
    </div>
  );
}

export default App;
