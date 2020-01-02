import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title } from 'rbx';


const schedule = {
  "title": "CS Courses for 2018-2019"
};

const Banner = ({ title }) => (
  <Title>{ title || '[ loading... ]' }</Title>
);

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

const buttonColor = selected => (
  selected ? 'button is-success is-selected' : 'button'
);

// hasAddons connects the buttons
const TermSelector = ({ state }) => (
  <Button.Group hasAddons>
    { Object.values(terms)
        .map(value => 
            <Button key={value} 
              color={buttonColor(value === state.term)}
              onClick={ () => state.setTerm(value)}
              >
              { value }
            </Button>
        )
    }
  </Button.Group>
);

const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
  course.id.slice(1, 4)
);

// a conflict must involve overlapping days and times
const days = ['M', 'Tu', 'W', 'Th', 'F'];

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const daysOverlap = (days1, days2) => ( 
  days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
  course1 !== course2
  && getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
);

const hasConflict = (course, selected) => {
  console.log(course, selected);
  return (
  selected.some(selection => courseConflict(course, selection))
)};

const Course = ({ course, state }) => (
  <Button className={ buttonColor(state.selected.includes(course)) }
    onClick={ () => state.toggle(course) }
    disabled={ hasConflict(course, state.selected) }
    >
    { getCourseTerm(course) } CS { getCourseNumber(course) }: { course.title }
  </Button>
);

const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1,
      end: hh2 * 60 + mm2 * 1
    }
  };
};

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: schedule.courses.map(addCourseTimes)
});

const useSelection = () => {
  const [selected, setSelected] = useState([]);
  const toggle = (x) => {
    setSelected(selected.includes(x) ? selected.filter(y => y !== x) : [x].concat(selected))
  };
  return [ selected, toggle ];
};

// Always include a key when building components in loops. The key should be unique and constant (normally an id)
// React.Fragment allows for multiple components to be returned without generating an unnecessary HTML wrapper
const CourseList = ({ courses }) => {
  const [term, setTerm] = useState('Fall');
  const [selected, toggle] = useSelection();
  const termCourses = courses.filter(course => term === getCourseTerm(course));

  return (
    <React.Fragment>
      <TermSelector state={ { term, setTerm } } />
      <Button.Group>
        { termCourses.map(course => 
            <Course key={course.id} 
              course={ course }
              state={ { selected, toggle } }
              />) 
        }
      </Button.Group>
    </React.Fragment>
  )
};

// Components (Banner, CourseList) must be capitalized. They call the corresponding function
// useEffect gets called when the state of any of the elements in the arg2 list are updated
//     When empty, it's only called on the initial render
const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });
  const url = 'https://courses.cs.northwestern.edu/394/data/cs-courses.php';

  useEffect(() => {
    
    const fetchSchedule = async () => {
      const response = await fetch(url);
      if (!response.ok) throw response;
      const json = await response.json();
      setSchedule(addScheduleTimes(json));
    }
    
    fetchSchedule();
  }, []);

  return (
    <div className="container">
      <Banner title={ schedule.title } />
      <CourseList courses={ schedule.courses } />
    </div>
  );
};

export default App;
