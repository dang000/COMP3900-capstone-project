import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Title from '../components/Title';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import SpeechButton from '../components/SpeechButton';

const DisplayInfoDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const DisplayInfoPage = (props) => {
  const {
    getCourseInfo,
    setIsLoading,
  } = props;

  const [clos, setClos] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [cloSearch, setCloSearch] = useState('');
  const [assSearch, setAssSearch] = useState('');

  /**
   * Given a filetype, download the active course as that filetype
   * @param filetype
   * @returns {Promise<void>}
   */
  const download = async (filetype) => {
    setIsLoading(true);
    const result = await fetch(`/download/${filetype}`);
    if (result.status === 200) {
      const reader = result.body.getReader();
      reader.read().then(({ value }) => {
        const type = `application/${filetype}`;
        const blob = new Blob([new TextDecoder('utf-8').decode(value)], { type });
        const url = URL.createObjectURL(blob);
        // create temporary element
        const doc = document.createElement('a');
        doc.href = url;
        doc.download = `Course_Entry.${filetype}`;
        doc.click();
      });
    }
    setIsLoading(false);
  };

  useEffect(async () => {
    setIsLoading(true);
    const result = await getCourseInfo();
    const resultJSON = await result.json();
    console.log(resultJSON);
    setClos(resultJSON.clos.map((clo) => ({ generated_text: clo.text, removed: false })));
    setAssessments(resultJSON.assessments.map(
      (assessment) => ({ label: assessment.text, weight: assessment.weight, removed: false }),
    ));
    setIsLoading(false);
  }, []);

  return (
    <DisplayInfoDiv>
      <Header title="CLOs and Assessments" />
      <Title>Course Learning Outcomes</Title>
      <TextInput
        onChange={(e) => setCloSearch(e.target.value)}
        width="200px"
        placeholder="Search CLOs"
        marginLeft="auto"
      />
      {
        clos.filter((clo) => clo.generated_text.toLowerCase().includes(cloSearch.toLowerCase()))
          .map((clo) => (
            <RowContainer>
              <Text>{clo.generated_text}</Text>
              <SpeechButton text={clo.generated_text} />
            </RowContainer>
          ))
      }
      <Title>Assessments</Title>
      <div>
        <TextInput
          onChange={(e) => setAssSearch(e.target.value)}
          width="200px"
          placeholder="Search Assessments"
          marginLeft="auto"
        />
      </div>
      {
        assessments.filter((ass) => ass.label.toLowerCase().includes(assSearch.toLowerCase()))
          .map((ass) => (
            <RowContainer>
              <Text>
                {ass.label}
                {' '}
                (
                {ass.weight}
                /100)
              </Text>
              <SpeechButton text={`${ass.label}, ${ass.weight} out of 100`} />
            </RowContainer>
          ))
      }
      <Link to="/home">
        <Button title="RESTART" width="250px" height="60px" fontSize="24px" onClick={() => { setClos([]); setAssessments([]); }} />
      </Link>
      <Link to="/edit">
        <Button title="EDIT" width="250px" height="60px" fontSize="24px" />
      </Link>
      <Button title="EXPORT AS PDF" width="250px" height="60px" fontSize="24px" onClick={() => { download('pdf'); }} />
      <Button title="EXPORT AS JSON" width="250px" height="60px" fontSize="24px" onClick={() => { download('json'); }} />
    </DisplayInfoDiv>
  );
};

export default DisplayInfoPage;
