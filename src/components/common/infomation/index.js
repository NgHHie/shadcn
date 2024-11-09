import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { fetchApiPost, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { ERROR_CODE, MEDIA_TYPE } from '../../../config/data';
import toast, { NotifyType } from '../../../utils/Toast';
import { GlobalContext } from '../../../globalContext';
import dayjs from 'dayjs';
import { getUserInfo } from '../../../utils/masterData';

const Information = ({ onClose }) => {
    const { user,setUser } = useContext(GlobalContext)

    const [form] = Form.useForm();

    const handleUpdate = async (values) => {
        if (values.birthDay) {
            values.birthDay = values.birthDay.format('YYYY-MM-DD');
        }
        values.username = user?.username
        const response = await fetchApiPost(ApiEnpoint.updateUser, values, MEDIA_TYPE.JSON)
        if (responseOk(response)) {
            toast(NotifyType.SUCCESS, "Cập nhật thông tin thành công!")

        } else {
            let messsage = response?.data?.description
            toast(NotifyType.ERROR, messsage ? messsage : "Có lỗi xảy ra!")
        }
    }
    const onFinish = (values) => {
        handleUpdate(values)
    };

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                ...user,
                birthDay: user.birthDay ? dayjs(user.birthDay, 'YYYY-MM-DD') : null, // Convert birthDay to moment if it exists
            });
        }
    }, [user])

    return (
        <div className="register-container">
            <Form
                form={form}
                name="Thông tin cá nhân"
                onFinish={onFinish}
                initialValues={{ remember: true }}
                scrollToFirstError
                className="register-form"
            >
                <div className='logo-container'>
                    <h2>
                        Thông tin cá nhân
                    </h2>

                </div>
                <Form.Item
                label="First Name"
                    name="firstName"
                    wrapperCol={{ span: 24 }}
                    labelCol={{ span: 24 }}
                    rules={[
                        { required: true, message: 'First name is mandatory' }
                    ]}
                >
                    <Input placeholder="First Name" className='input-form' />
                </Form.Item>

                <Form.Item
                    label='Last name'
                    wrapperCol={{ span: 24 }}
                    labelCol={{ span: 24 }}
                    name="lastName"
                    rules={[
                        { required: true, message: 'Last name is mandatory' }
                    ]}
                >
                    <Input placeholder="Last Name" className='input-form' />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Email is mandatory' },
                        { type: 'email', message: 'The input is not valid E-mail!' }
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" className='input-form' disabled={user?.email ? true : false} />
                </Form.Item>

                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: 'Phone is mandatory' }
                    ]}
                >
                    <Input prefix={<PhoneOutlined />} placeholder="Phone" className='input-form' />
                </Form.Item>

                <Form.Item
                    name="birthDay"
                    rules={[
                        { required: true, message: 'Birth date is mandatory' }
                    ]}
                >
                    <DatePicker format={'DD/MM/YYYY'} placeholder="Birth Date" className='input-form' />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        { required: false, message: 'Password is mandatory' },
                        { min: 6, message: 'Password must be at least 6 characters long' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" className='input-form' />
                </Form.Item>

                <Form.Item
                    name="repassword"
                    rules={[
                        { required: false, message: 'Password is mandatory' },
                        { min: 6, message: 'Password must be at least 6 characters long' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" className='input-form' />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="register-form-button">
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Information;
