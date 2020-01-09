import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title, Message } from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CourseList, { addScheduleTimes } from './components/CourseList';

// Firebase Info
const firebaseConfig = {
  apiKey: "AIzaSyDYpZBrieajimUfn1lUpcTs-vIKo0ZX1ME",
  authDomain: "scheduler-66dc0.firebaseapp.com",
  databaseURL: "https://scheduler-66dc0.firebaseio.com",
  projectId: "scheduler-66dc0",
  storageBucket: "scheduler-66dc0.appspot.com",
  messagingSenderId: "583473027878",
  appId: "1:583473027878:web:c2838ca7c36f1d27b93fe7",
  measurementId: "G-C73LJL8RGT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

// Authorization and Header UI
const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const Welcome = ({ user }) => (
  <Message color="info">
    <Message.Header>
      Welcome, {user.displayName}
      <Button primary onClick={() => firebase.auth().signOut()}>
        Log out
      </Button>
    </Message.Header>
  </Message>
);

const SignIn = () => (
  <StyledFirebaseAuth
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);

const Banner = ({ user, title }) => (
  <React.Fragment>
    { user ? <Welcome user={ user } /> : <SignIn /> }
    <Title>{ title || '[ loading... ]' }</Title>
  </React.Fragment>
);

// Components (Banner, CourseList) must be capitalized. They call the corresponding function
// useEffect gets called when the state of any of the elements in the arg2 list are updated
//     When empty, it's only called on the initial render
const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  return (
    <Container>
      <Banner title={ schedule.title}  user={ user } />
      <CourseList courses={ schedule.courses }  user={ user } />
    </Container>
  );
};

export default App;
export { db };