import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Upload, message, Spin, Avatar } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { fetchApiPost, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { ERROR_CODE, MEDIA_TYPE } from '../../../config/data';
import toast, { NotifyType } from '../../../utils/Toast';
import { GlobalContext } from '../../../globalContext';
import dayjs from 'dayjs';
import { getUserInfo } from '../../../utils/masterData';
import { uploadFile } from '../../../services/fileUploadService';

const Information = ({ onClose }) => {
    const { user, setUser } = useContext(GlobalContext)
    const [loading, setLoading] = useState(false)

    const [form] = Form.useForm();

    const handleUpdate = async (values) => {
        if (values.birthDay) {
            values.birthDay = values.birthDay.format('YYYY-MM-DD');
        }
        if(user?.avatar) {
            values.avatar = user?.avatar
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

    const handleFileChange = (info) => {
        const file = info.file;
        if (file) {
          const isImage = info.file.type.startsWith('image/');
          if (!isImage) {
            message.error('Vui lòng tải ảnh!');
            return;
          }
    
          const formData = new FormData();
          formData.append('file', file);
          setLoading(true)
          uploadFile(formData)
            .then((data) => {
              if (data?.status === 1) {
                setUser({ ...user, avatar: data?.url })
              } else if (data?.status === ERROR_CODE.FILE_TOO_LARGE) {
                message.warning("Vui lòng upload file dưới 10MB")
              }
              else {
                message.error('Upload image thất bại, vui lòng thử lại.');
              }
            })
            .catch((error) => {
              message.error('Upload image thất bại, vui lòng thử lại.');
            })
            .finally(() => {
              setLoading(false)
            })
    
        } else {
          message.error('Vui lòng tải lại ảnh!');
        }
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
                onFinish={onFinish}
                initialValues={{ remember: true }}
                scrollToFirstError
                className="register-form"
            >
                <div className='logo-container'>
                    <h2 className='text-[18px]'>
                        Thông tin cá nhân
                    </h2>

                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <Upload
                        accept="image/*"
                        name="avatar"
                        showUploadList={false}
                        beforeUpload={() => false}
                        maxCount={1}
                        onChange={(info) => handleFileChange(info)}
                        loading={true}
                    >
                        {
                            loading ? (
                                <div className='text-center'>
                                    <Spin></Spin>
                                    <p className='mt-2'>Đang tải</p>
                                </div>
                            ) : (
                                <Avatar
                                    size={120}
                                    src={user?.avatar ? user?.avatar : '/assets/upload.jpg'} // Set imageUrl as the avatar source
                                    shape="circle"
                                >
                                </Avatar>
                            )
                        }

                    </Upload>
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
