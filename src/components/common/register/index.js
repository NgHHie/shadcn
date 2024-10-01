import React, { useState } from 'react';
import { Form, Input, Button, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import './style.scss'; // Assuming you want to use SCSS for styling
import dayjs from 'dayjs';
import { fetchApiPost, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { ERROR_CODE, MEDIA_TYPE } from '../../../config/data';
import toast, { NotifyType } from '../../../utils/Toast';

const Register = ({onClose}) => {
  const [form] = Form.useForm();

  const handleRegister = async(values) => {
    if (values.birthDay) {
      values.birthDay = values.birthDay.format('YYYY-MM-DD');
    }
    console.log(values)
    const response = await fetchApiPost(ApiEnpoint.register,values,MEDIA_TYPE.JSON)
    if(responseOk(response)) {
      if(response.data['status'] === ERROR_CODE.SUCCESS) {
        toast(NotifyType.SUCCESS,"Đăng ký tài khoản thành công!")
        if(onClose) {
          onClose()
        }
      } else if(response.data['status'] === ERROR_CODE.USER_EXIST) {
        toast(NotifyType.WARNING,"Tài khoản đã tồn tại!")
      } else if(response.data['status'] === ERROR_CODE.EMAIL_ALREADY_USE) {
        toast(NotifyType.WARNING,"Email đã được sử dụng")
      } else {
        toast(NotifyType.WARNING,"Vui lòng nhập đủ thông tin!")
      }
      
    } else {
      toast(NotifyType.ERROR,"Có lỗi xảy ra!")
    }
  }
  const onFinish = (values) => {
    handleRegister(values)
  };

  return (
    <div className="register-container">
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        scrollToFirstError
        className="register-form"
      >
        <div className='logo-container'>
            <h2>
                 Đăng ký <span>Học SQL</span>
            </h2>
           
        </div>
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Username is mandatory' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Password is mandatory' },
            { min: 6, message: 'Password must be at least 6 characters long' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="firstName"
          rules={[
            { required: true, message: 'First name is mandatory' }
          ]}
        >
          <Input placeholder="First Name" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[
            { required: true, message: 'Last name is mandatory' }
          ]}
        >
          <Input placeholder="Last Name" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Email is mandatory' },
            { type: 'email', message: 'The input is not valid E-mail!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[
            { required: true, message: 'Phone is mandatory' }
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Phone" className='input-form'/>
        </Form.Item>

        <Form.Item
          name="birthDay"
          rules={[
            { required: true, message: 'Birth date is mandatory' }
          ]}
        >
          <DatePicker format="YYYY-MM-DD" placeholder="Birth Date" className='input-form'/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-form-button">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
