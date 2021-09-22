import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Title from '../components/Title';
import Text from '../components/Text';
import Vote from '../components/Vote';
import SpeechButton from '../components/SpeechButton';
import Modal from '../components/Modal';

const ResultsDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BodyDiv = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Checkbox = styled.input`
`;

const CLODiv = styled.div`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  display: flex;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 3.5;
`;

const ButtonContainer = styled.div`
  flex: 0.5;
`;

const CheckboxContainer = styled.div`
  flex: 0.5;
`;

const ResultsPage = (props) => {
  const {
    clos,
    setClos,
    assessments,
    setAssessments,
    addClo,
    addAssessment,
    setCloRating,
    setAssessmentRating,
    setIsLoading,
  } = props;
  const [checked, setChecked] = useState(false);
  const [closCopy, setClosCopy] = useState(clos);
  const [assCopy, setAssCopy] = useState(assessments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  const onRemove = (obj, copy, set) => {
    set((copy) => copy.map((item) => {
      console.log([item.id, obj.id]);
      if (item.id === obj.id) {
        return {
          ...item,
          removed: !item.removed,
        };
      }
      return item;
    }));
    setChecked(!checked);
    console.log('new arr: ', copy);
  };

  const onFinalise = async (clos, assessments) => {
    setIsLoading(true);
    const promises = [];
    for (let i = 0; i < clos.length; i++) {
      if (clos[i].removed === false) {
        promises.push(addClo(clos[i]));
      }
      if (assessments[i].removed === false) {
        promises.push(addAssessment(assessments[i]));
      }
      const { rating: cloRating = 'neutral' } = clos[i];
      const { rating: assessmentsRating = 'neutral' } = assessments[i];
      promises.push(setCloRating(clos[i], cloRating));
      promises.push(setAssessmentRating(assessments[i], assessmentsRating));
    }
    await Promise.all(promises);
    setClos([]);
    setAssessments([]);
    setIsLoading(false);
    history.push('/display');
  };

  return (
    <ResultsDiv>
      <Header title="Results" />
      <BodyDiv>
        <Modal
          open={isModalOpen}
          message="Are you sure?"
          redText="Cancel"
          greenText="Continue"
          onRed={() => setIsModalOpen(false)}
          onGreen={() => onFinalise(closCopy, assCopy)}
        />
        <Title>Course Learning Outcomes</Title>
        <Text textAlign="right">Remove?</Text>
        {
          clos.map((clo) => (
            <ResultBar
              text={clo.generated_text}
              obj={clo}
              onChange={() => onRemove(clo, closCopy, setClosCopy)}
            />
          ))
        }
        <Title>Assessments</Title>
        <Text textAlign="right">Remove?</Text>
        {
          assessments.map((assessment) => (
            <ResultBar
              label={assessment.label}
              weight={assessment.weight}
              obj={assessment}
              onChange={() => onRemove(assessment, assCopy, setAssCopy)}
            />
          ))
        }
      </BodyDiv>
      <Link to="/home">
        <Button title="RESTART" width="250px" height="60px" fontSize="24px" onClick={() => { setClos([]); setAssessments([]); }} />
      </Link>
      <Button
        title="FINALISE"
        width="250px"
        height="60px"
        fontSize="24px"
        onClick={() => setIsModalOpen(true)}
      />
    </ResultsDiv>
  );
};

export default ResultsPage;

const ResultBar = (props) => {
  const {
    label,
    weight,
    text,
    obj,
    onChange,
  } = props;

  return (
    <CLODiv>
      <ButtonContainer>
        <Vote obj={obj} />
      </ButtonContainer>
      <RowContainer>
        {text ? <Text>{text}</Text> : <Text>{`${label} (${weight}/100)`}</Text>}
        <SpeechButton text={`${label} ${weight} out of 100`} />
      </RowContainer>
      <CheckboxContainer>
        <Checkbox type="checkbox" onChange={onChange} />
      </CheckboxContainer>
    </CLODiv>
  );
};
