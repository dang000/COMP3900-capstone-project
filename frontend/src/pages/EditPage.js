import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import Header from '../components/Header';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import Title from '../components/Title';
import Modal from '../components/Modal';

const EditDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BodyDiv = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ContentDiv = styled.div`
  flex-direction: row;
  justify-content: space-between;
  display: flex;
  margin-bottom: 10px;
  margin-right: 40px;
`;

const EditPage = (props) => {
  const {
    addClo,
    removeClo,
    addAssessment,
    removeAssessment,
    getCourseInfo,
    setIsLoading,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [clos, setClos] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  // populates a list of old clos/assessments and new clos/assessments to track
  // differences for sending back to backend upon submit
  useEffect(async () => {
    setIsLoading(true);
    const result = await getCourseInfo();
    const resultJSON = await result.json();
    console.log(resultJSON);
    if (resultJSON.clos !== null) {
      const resClos = resultJSON.clos.map((clo) => ({
        id: uuid(),
        generated_text: clo.text,
        modified: false,
        added: false,
        removed: false,
      }));
      setClos(resClos);
      console.log(resClos);
    }
    if (resultJSON.assessments !== null) {
      const resAssessments = resultJSON.assessments.map((ass) => ({
        id: uuid(),
        label: ass.text,
        weight: ass.weight,
        modified: false,
        added: false,
        removed: false,
      }));
      setAssessments(resAssessments);
      console.log(resAssessments);
    }
    setIsLoading(false);
  }, []); // <-- empty dependency array

  const modifyElement = async (ele, newEle, remove, add) => {
    const promises = [];
    if (ele.added === false) {
      promises.push(remove(ele));
    }
    promises.push(add(newEle));
    return Promise.all(promises);
  };

  const onSave = async (clos, assessments) => {
    const anyNonInteger = assessments.some(
      (assessment) => !assessment.removed
        && assessment.modified
        && Number.isNaN(assessment.newWeight),
    );
    if (anyNonInteger) {
      setIsModalOpen(false);
      setErrorMessage('All assessment weights must be positive integer values');
      return;
    }
    const anyNegative = assessments.some(
      (assessment) => !assessment.removed
        && assessment.modified
        && assessment.newWeight <= 0,
    );
    if (anyNegative) {
      setIsModalOpen(false);
      setErrorMessage('All assessment weights must be positive integer values');
      return;
    }
    let totalWeight = 0;
    assessments.forEach((assessment) => {
      if (!assessment.removed) {
        totalWeight += assessment.newWeight || assessment.weight;
      }
    });
    if (totalWeight !== 100) {
      setIsModalOpen(false);
      setErrorMessage(`Assessment weights summed to ${totalWeight} but must sum to 100. Please update them`);
      return;
    }
    setIsLoading(true);
    console.log('on save start');
    const promises = [];
    clos.forEach((clo) => {
      if (clo.removed === true && clo.added === false) {
        promises.push(removeClo(clo));
      } else if (clo.modified === true) {
        const editClo = {
          ...clo,
          generated_text: clo.newText || clo.generated_text,
        };
        promises.push(modifyElement(clo, editClo, removeClo, addClo));
      }
    });
    assessments.forEach((assessment) => {
      if (assessment.removed === true && assessment.added === false) {
        promises.push(removeAssessment(assessment));
      } else if (assessment.modified === true) {
        const editAssessment = {
          ...assessment,
          label: assessment.newLabel || assessment.label,
          weight: assessment.newWeight || assessment.weight,
        };
        promises.push(modifyElement(assessment, editAssessment, removeAssessment, addAssessment));
      }
    });
    console.log(promises);
    await Promise.all(promises);
    setIsLoading(false);
    console.log('back to display');
    history.push('/display');
  };

  const onAddClo = () => {
    const newResObj = {
      id: uuid(),
      generated_text: '',
      newText: '',
      removed: false,
      added: true,
      modified: false,
    };
    setClos([...clos, newResObj]);
  };

  const onAddAss = () => {
    const newResObj = {
      id: uuid(),
      newLabel: '',
      weight: 0,
      removed: false,
      added: true,
      modified: false,
    };
    setAssessments([...assessments, newResObj]);
  };
  // () => { setClos(closCopy); setAssessments(assCopy); }
  return (
    <EditDiv>
      <Header title="Edit" />
      <BodyDiv>
        <Modal
          open={isModalOpen}
          message="Are you sure?"
          redText="Cancel"
          greenText="Continue"
          onRed={() => { setIsModalOpen(false); if (isCancel) setIsCancel(false); }}
          onGreen={() => { if (isCancel) { history.push('/display'); } else { onSave(clos, assessments); } }}
        />
        <Title>CLOs</Title>
        {
          clos.map((res) => (
            (!res.removed
              ? (
                <CloBody
                  currClo={res}
                  key={res.id}
                  clos={clos}
                  setClos={setClos}
                  removeClo={removeClo}
                />
              )
              : <></>
            )
          ))
        }
        <Button title="ADD" onClick={onAddClo} />
        <Title>Assessments</Title>
        {
          assessments.map((res) => (
            (!res.removed
              ? (
                <AssessmentBody
                  currAss={res}
                  key={res.id}
                  assessments={assessments}
                  setAssessments={setAssessments}
                />
              )
              : <></>
            )
          ))
        }
        <Button title="ADD" onClick={onAddAss} />
      </BodyDiv>
      {errorMessage}
      <EditDiv />
      <Button
        title="CANCEL"
        width="250px"
        height="60px"
        fontSize="24px"
        onClick={() => { setIsModalOpen(true); setIsCancel(true); }}
      />
      <Button
        title="SAVE"
        width="250px"
        height="60px"
        fontSize="24px"
        onClick={() => setIsModalOpen(true)}
      />
    </EditDiv>
  );
};

export default EditPage;

const AssessmentBody = (props) => {
  const {
    currAss,
    assessments,
    setAssessments,
  } = props;

  const onRemove = () => {
    setAssessments([
      ...assessments.filter((res) => (
        res.id !== currAss.id
      )),
      { ...currAss, removed: true },
    ]);
    console.log(assessments);
  };

  return (
    <ContentDiv>
      <TextArea
        width="250px"
        onChange={(e) => {
          currAss.newLabel = e.target.value;
          currAss.modified = true;
        }}
        defaultValue={currAss.label || currAss.newLabel}
      />
      <TextArea
        width="250px"
        onChange={(e) => {
          const parsedInt = parseInt(e.target.value, 10);
          console.log(Number(e.target.value));
          console.log(parsedInt);
          if (Number(e.target.value) !== parsedInt) {
            currAss.newWeight = NaN;
          } else {
            currAss.newWeight = parsedInt;
          }
          currAss.modified = true;
        }}
        defaultValue={currAss.weight || currAss.newWeight}
      />
      <Button title="REMOVE" marginLeft="10px" onClick={onRemove} />
    </ContentDiv>
  );
};

const CloBody = (props) => {
  const {
    currClo,
    clos,
    setClos,
  } = props;

  const onRemove = () => {
    setClos([
      ...clos.filter((res) => (
        res.id !== currClo.id
      )),
      { ...currClo, removed: true },
    ]);
    console.log(clos);
  };

  return (
    <ContentDiv>
      <TextArea
        width="500px"
        onChange={(e) => { currClo.newText = e.target.value; currClo.modified = true; }}
        defaultValue={currClo.generated_text || currClo.newText}
      />
      <Button title="REMOVE" marginLeft="10px" onClick={onRemove} />
    </ContentDiv>
  );
};
