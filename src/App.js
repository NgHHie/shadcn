
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout';
import SqlEditor from './components/Ide';
import '../src/config/common-css.scss'
import QuestionHome from './components/QuestionHome';
import QuestionDetail from './components/pages/QuestionDetail';
import { SubmitPage } from './components/pages/submitPage';
import { TopUserPage } from './components/pages/topUserPage';
import ContestPage from './components/pages/Contest';
import ExamPage from './components/pages/Contest/doContest';
import ContestWaitingPage from './components/pages/Contest/watingPage';
import ContestInfo from './components/pages/Contest/components/contestInfo';
import TableQuestionContest from './components/pages/Contest/components/contestTable';
import Discuss from './components/pages/Discuss';
import DiscussDetail from './components/pages/Discuss/Components/DiscussDetail';

import ReactGA from "react-ga4";

// Initialize Google Analytics with your Measurement ID
ReactGA.initialize("G-P64MHK0MR8"); // Replace with your Measurement ID

// Log the initial pageview
ReactGA.send("pageview");


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout></Layout>}>
            <Route path='/' element={<QuestionHome></QuestionHome>}></Route>
            <Route path='/ide' element={<SqlEditor></SqlEditor>}></Route>
            <Route path='/question-detail/:questionId' element={<QuestionDetail></QuestionDetail>}></Route>
            <Route path='/question-detail/:questionId/:questionContestId' element={<QuestionDetail></QuestionDetail>}></Route>
            <Route path='/submit-history' element={<SubmitPage></SubmitPage>}></Route>
            <Route path='/discuss' element={<Discuss></Discuss>}></Route>
            <Route path='/discuss/:topicId' element={<DiscussDetail></DiscussDetail>}></Route>
            <Route path='/top-user' element={<TopUserPage></TopUserPage>}></Route>
            <Route path='/contest' element={<ContestPage></ContestPage>}></Route>
            <Route path='/contest-wating/:contestId' element={<ContestWaitingPage></ContestWaitingPage>}></Route>
            <Route path='/contest-joined/:contestId' element={<ExamPage></ExamPage>}>
              <Route index  element={<TableQuestionContest contest={null}></TableQuestionContest>}></Route>
              <Route path=':questionId/:questionContestId' element={<QuestionDetail></QuestionDetail>}></Route>
            </Route>
            <Route path='/contest-info' element={<ContestInfo></ContestInfo>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

