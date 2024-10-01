import React, { useContext, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, Button, Switch, Spin, Select } from 'antd';
import { BulbOutlined, BulbFilled, CodeOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import './style.scss'; // Import tệp CSS tùy chỉnh
import { fetchApiPost, responseOk } from '../../utils/FetchUtil';
import { ApiEnpoint } from '../../config/ApiEnpoint';
import { MEDIA_TYPE, ROLE_NAME } from '../../config/data';
import { renderTable } from '../common/renderTable';
import toast, { NotifyType } from '../../utils/Toast';
import { GlobalContext } from '../../globalContext';

const { Option } = Select;
const MemoizedEditor = React.memo(Editor);
const SqlEditor = ({ query, setQuery, prefixCode, notifyUpdate, questionId, databases,onSelectData, hasSubmit }) => {
  const [results, setResults] = useState([])
  const [theme, setTheme] = useState('vs-light');
  const [loading, setLoading] = useState(false)
  const [sql, setSql] = useState("-- Nhập lệnh sql")
  const [update, setUpdate] = useState(0)
  const { user } = useContext(GlobalContext)
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [selectDatabaseId,setSelectDatabaseId] = useState('')

  const toggleTerminalVisibility = () => {
    setTerminalVisible(!isTerminalVisible);
  };

  useEffect(() => {
    if (query) {
      setSql(query)
    }
  }, [query])

  const handleQueryOnChange = (value) => {
    if (setQuery) {
      setQuery(value)
    }
    setSql(value)
  }

  const handleSelectData = (value) => {
    setSelectDatabaseId(value)
    if(onSelectData) {
      onSelectData(value)
    }
  }
  const handleSave = async () => {
    if (!user) {
      toast(NotifyType.WARNING, "Vui lòng đăng nhập!")
      return
    }
    if(!selectDatabaseId) {
      toast(NotifyType.WARNING, "Vui lòng chọn database!")
      return
    }
    setLoading(true)
    const sendData = {
      "sql": sql,
      "prefixTable": prefixCode ? prefixCode : "",
      "questionId": questionId ? questionId : "",
      "typeDatabaseId": selectDatabaseId
    }
    console.log(databases)
    console.log(sendData)
    let urlSub = ApiEnpoint.executeSqlUser
    const response = await fetchApiPost(urlSub, sendData, MEDIA_TYPE.JSON)
    if (responseOk(response)) {
      let change = update + 1
      setUpdate(change)
      if (notifyUpdate) {
        notifyUpdate(change)
      }

      setResults(response?.data)
      setTerminalVisible(true)
    } else {
      toast(NotifyType.ERROR, "Có lỗi xảy ra")
    }
    setLoading(false)
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'vs-light' ? 'vs-dark' : 'vs-light'));
  };

  return (
    <Card
      className="custom-card"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="custom-card-title">SQL Editor</span>
          <Select
            style={{ width: 150 }}
            placeholder="Chọn database"
            onChange={(value) => handleSelectData(value)}
          >
            {databases &&
              databases.map((db) => (
                <Option key={db?.typeDatabase?.id} value={db?.typeDatabase?.id}>
                  {db?.typeDatabase?.name}
                </Option>
              ))}
          </Select>
          <Switch
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
            onChange={toggleTheme}
            checked={theme === 'vs-dark'}
          />
        </div>
      }
    >
      <div className='editor-container'>
        <div className='editor-sql'>
          <Editor
            height="350px" // Set height to fill parent container
            width="100%"
            language="sql"
            theme={theme}
            value={sql}
            onChange={(value) => handleQueryOnChange(value)}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
            }}
            className='!w-[100%]'
          />
        </div>
        {
          hasSubmit && (
            <div className='flex items-center'>
              <Button onClick={toggleTerminalVisibility} type="default" className="flex items-center w-32 rounded-lg ml-2">
                <CodeOutlined className="mr-2" />
                {isTerminalVisible ? (
                  <>
                    Hide <UpOutlined className="ml-1" />
                  </>
                ) : (
                  <>
                    Show <DownOutlined className="ml-1" />
                  </>
                )}
              </Button>
              <Button onClick={handleSave} type="primary" className='flex m-w-[60px] rounded-lg' loading={loading}>
                Run
              </Button>
            </div>
          )
        }
        <div className={`editor-terminal ${isTerminalVisible || !hasSubmit ? '' : 'hidden'}`}>
          {!loading ? (
            renderTable(results?.result)
          ) : (
            <div>
              Đang thực thi ... <Spin />
            </div>
          )}
        </div>
      </div>
      {
        !hasSubmit && (
          <div className='flex items-center mt-3'>
            {
              hasSubmit && (
                <Button onClick={toggleTerminalVisibility} type="default" className={`flex items-center w-32 rounded-lg ml-2`}>
                  <CodeOutlined className="mr-2" />
                  {isTerminalVisible ? (
                    <>
                      Hide <UpOutlined className="ml-1" />
                    </>
                  ) : (
                    <>
                      Show <DownOutlined className="ml-1" />
                    </>
                  )}
                </Button>
              )
            }
            <Button onClick={handleSave} type="primary" className='flex m-w-[60px] rounded-lg' loading={loading}>
              Run
            </Button>
          </div>
        )
      }
    </Card>
  );
};

export default SqlEditor;
