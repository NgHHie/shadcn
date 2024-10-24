
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
import ContestInfoPage from './components/pages/Contest/contestInfo';
import ProblemPage from './components/pages/Contest/test';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout></Layout>}>
          <Route path='/' element={<QuestionHome></QuestionHome>}></Route>
            <Route path='/ide' element={<SqlEditor></SqlEditor>}></Route>
            <Route path='/question-detail/:questionId' element={<QuestionDetail></QuestionDetail>}></Route>
            <Route path='/submit-history' element={<SubmitPage></SubmitPage>}></Route>
            <Route path='/top-user' element={<TopUserPage></TopUserPage>}></Route>
            <Route path='/contest' element={<ContestPage></ContestPage>}></Route>
            <Route path='/contest-info' element={<ContestInfoPage></ContestInfoPage>}></Route>
            <Route path='/contest-join' element={<ProblemPage></ProblemPage>}></Route>
          </Route> 
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

