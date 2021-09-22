import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Question1 from './questions/Question1';
import Question2 from './questions/Question2';

const QuestionDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const QuestionPage = (props) => {
  const {
    handleSubmit, setCourseInfo, getCourseInfo, parseQuestions,
  } = props;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [courseDetails, setCourseDetails] = useState({});
  const [questionData, setQuestionData] = useState([]);
  const history = useHistory();

  const submitQuestions = async () => {
    // send course details to backend
    await setCourseInfo(courseDetails);
    // let backend create a course summary to be used
    const response = await parseQuestions(questionData);
    const responseJSON = await response.json();
    console.log(responseJSON);
    // pass course summary to course generation
    handleSubmit(responseJSON.result, history);
  };

  const onBack = () => {
    setQuestionIndex(questionIndex - 1);
  };

  const onNext = async () => {
    if (questionIndex === 1) {
      submitQuestions();
    } else {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const renderQuestion = (questionIndex) => {
    switch (questionIndex) {
      case 0:
        return (
          <Question1
            courseDetails={courseDetails}
            setCourseDetails={setCourseDetails}
          />
        );
      case 1:
        return (
          <Question2
            questionData={questionData}
            setQuestionData={setQuestionData}
          />
        );
      default:
    }
  };

  // only intended to run once when loading question page
  useEffect(async () => {
    const result = await getCourseInfo();
    console.log(result);
    const resultJSON = await result.json();
    console.log(resultJSON);
    delete resultJSON.success;
    setCourseDetails({ ...resultJSON });
  }, []); // <-- empty dependency array

  return (
    <QuestionDiv>
      <Header title="Questions" />
      {renderQuestion(questionIndex)}
      <Link to={questionIndex === 0 ? '/' : '/question'}>
        <Button title="BACK" width="300px" height="60px" fontSize="24px" onClick={onBack} />
      </Link>
      <Button title={questionIndex === 1 ? 'FINALISE' : 'NEXT'} width="300px" height="60px" fontSize="24px" onClick={onNext} />
    </QuestionDiv>
  );
};

export default QuestionPage;
