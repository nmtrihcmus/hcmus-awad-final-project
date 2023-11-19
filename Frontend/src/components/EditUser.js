import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, {setAuthToken} from '../api/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Input,
  InputLabel
} from '@mui/material';


const EditUser = () => {
  const [user, setUser] = useState({
    fullName: '',
    age: '',
    gender: 'male',
    birthday: null,
    email: '',
    avatar: '',
  });
  const [emailError, setEmailError] = useState(false);
  // Sử dụng useState để theo dõi trạng thái sau khi gửi yêu cầu
  const [saveStatus, setSaveStatus] = useState('');
  const handleChange = (field, value) => {
    setUser({
      ...user,
      [field]: value,
    });
    // Kiểm tra validation email
    if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!emailRegex.test(value));
      }
  };

  const handleSave = async () => {
    
    try {
      console.log(user);
      // Gửi yêu cầu PUT đến endpoint của server
      const response = await api.put('/users/update', user);
  
      // Xử lý kết quả từ server
      if (response.status === 200) {
        setSaveStatus('Update successful!');
      } else {
        setSaveStatus('Update failed.');
      }
    } catch (error) {
      // Xử lý lỗi từ server
      console.error('Error updating user:', error);
      setSaveStatus('Update failed. Please try again.');
    }
  };

  
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("render fetchUserData ");
        
        // Lấy token từ localStorage hoặc nơi lưu trữ khác
        const token = localStorage.getItem('token');
        if(!token){
          console.error('Error fetching user data:', Error);
          //navigate('/signin');
        }
        console.log("token fetchUserData: ", token);
        // Đặt token cho mọi yêu cầu
        setAuthToken(token);

        // Gọi API để lấy dữ liệu người dùng
        const response = await api.get('/users/profile');
        console.log("res data : ", response.data);
        // Lưu thông tin người dùng vào state
        console.log("userData before: ", user);
        setUser(response.data);
        

      } catch (error) {
        // Xử lý lỗi
        console.error('Error fetching user data:', error);

        // Nếu lỗi là do xác thực (ví dụ: token hết hạn), chuyển hướng về trang đăng nhập
        if (error.response && error.response.status === 401) {
          navigate('/signin');
        }
      }
    };

    // Gọi hàm lấy dữ liệu người dùng
    fetchUserData();

  }, []); // Thêm dependencies cần thiết
  console.log(" => userData after from /users/profile : ", user);
  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom mt={4}>
        Edit User
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          
          <InputLabel >Name</InputLabel>
          <Input
            
            fullWidth
            value={user.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          
        </Grid>
        
        
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              value={user.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="female" control={<Radio />} label="Female" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Birth Date"
            fullWidth
            type="date"
            value={user.birthDate}
            onChange={(e) => handleChange('birthday', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} >
          <InputLabel >Email</InputLabel>
          <Input
            label="Email"
            fullWidth
            type="email"
            value={user.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={emailError}
            helperText={emailError ? 'Invalid email format' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <InputLabel InputLabel >Avatar</InputLabel>
          <Input
            label="Avatar URL"
            fullWidth
            value={user.avatar}
            onChange={(e) => handleChange('avatar', e.target.value)}
          />
        </Grid>
        {saveStatus && <Grid item xs={12}>
          <Typography color={'success'}>
              {saveStatus}
          </Typography>
        </Grid>}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditUser;
