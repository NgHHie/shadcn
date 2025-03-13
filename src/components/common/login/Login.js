// src/Login.js
import React, { useContext } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import './style.scss';
import { ERROR_CODE, MEDIA_TYPE, TYPE_MODAL } from '../../../config/data';
import { fetchApiPost, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { HttpStatusCode } from 'axios';
import toast, { NotifyType } from '../../../utils/Toast';
import { setAuthenticator, setRefreshToken } from '../../../utils/localStorage';
import { GlobalContext } from '../../../globalContext';
import { getUserInfo } from '../../../utils/masterData';

const Login = ({onTypeModal,onClose}) => {
    const {user,setUser} = useContext(GlobalContext)

    const handleLogin = async (value) => {
        console.log(value)
        const response = await fetchApiPost(ApiEnpoint.login,value,MEDIA_TYPE.JSON)

        if(responseOk(response)) {
            setAuthenticator(response.data['accessToken'])
            setRefreshToken(response.data['refreshToken'])
            getUserInfo()
            .then(response => {
                setUser(response)
                toast(NotifyType.SUCCESS,"Đăng nhập thành công")
                onClose()
            })
            // setUser(getUserInfo())
        } else if(response) {
            if(response?.data.status === ERROR_CODE.INVALID_US_PW) {
                toast(NotifyType.WARNING,"Tài khoản hoặc mật khẩu không chính xác!")
            }
        } else {
            toast(NotifyType.ERROR,"Có lỗi xảy ra!")
        }
    }

    const onFinish = (values) => {
        handleLogin(values)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const handleOpenRegister = () => {
        if(onTypeModal) {
            onTypeModal(TYPE_MODAL.REGISTER)
        }
    }
    return (
        <div className="login-container">
            <Form
                name="login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <div className="logo-container">
                    <h2>Chào mừng đến với</h2>
                    <h3>Học SQL</h3>
                </div>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input placeholder="Username" className='input-login' />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input.Password placeholder="Password" className='input-login' />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <a className="login-form-forgot" href="">
                        Forgot password
                    </a>
                </Form.Item>
                <Form.Item>
                    <div className='btn-login-container'>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                    </div>
                    <div className='extra-container'>
                        <p>Bạn chưa có tài khoản? <span onClick={handleOpenRegister}>Đăng ký</span></p>
                    </div>

                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
