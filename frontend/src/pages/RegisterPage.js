import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Text from '../components/Text';
import TextInput from '../components/TextInput';

const HomeDiv = styled.div`
  width: 1200px;
  margin: 0 auto;
`;

const Divider = styled.div`
  width: 450px;
  height: 1px;
  background-color: black;
  margin: 30px auto;
`;

const LoginForm = styled.form`
  width: 350px;
  margin: 0 auto;
`;

const RegisterPage = (props) => {
  const { accountObj, register } = props;
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [passwordConf, setPasswordConf] = useState();
  const [serverMessage, setServerMessage] = useState();
  const history = useHistory();

  const onRegister = async (user, pass, passConf) => {
    const result = await register(user, pass, passConf);
    if (result.status === 200) {
      const resultJSON = await result.json();
      setServerMessage(resultJSON.result);
    }
  };

  useEffect(async () => {
    const ret = await accountObj.checkLogStatus();
    if (ret === true) {
      history.push('/login');
    }
  }, []);

  return (
    <HomeDiv>
      <Header title="REGISTER" />
      <LoginForm>
        <div style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
        }}
        >
          <Text>
            Username
          </Text>
          <TextInput
            id="username"
            placeholder="Username"
            width="200px"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
        }}
        >
          <Text>
            Password
          </Text>
          <TextInput
            placeholder="Password"
            type="password"
            width="200px"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
        }}
        >
          <Text>
            Confirm Password
          </Text>
          <TextInput
            placeholder="Confirm password"
            type="password"
            width="200px"
            onChange={(e) => setPasswordConf(e.target.value)}
          />
        </div>
      </LoginForm>
      {serverMessage}
      <Divider />
      <Button title="REGISTER" width="200px" fontSize="20px" onClick={() => onRegister(username, password, passwordConf)} />
      <Divider />
    </HomeDiv>
  );
};

export default RegisterPage;
