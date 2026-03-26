import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

async function test() {
  try {
    // 1. Login as guard to get token
    console.log('Logging in...');
    const loginRes = await api.post('/auth/login', {
      universityId: 'G12345',
      password: 'password123'
    });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Logged in successfully.');

    // 2. Search for a laptop to get an ID
    console.log('Searching for laptops...');
    const searchRes = await api.get('/laptops/search/G12345'); // Search by guard's laptops or something that exists
    if (searchRes.data.length === 0) {
      const allLaptops = await api.get('/admin/activities'); // Try to find any laptop ID
      // ...
    }
    const laptop = searchRes.data[0];
    console.log('Found laptop:', laptop._id);
    console.log('Initial student info:', laptop.studentId);

    // 3. Update location
    const newStatus = laptop.locationStatus === 'In Campus' ? 'Out of Campus' : 'In Campus';
    console.log(`Updating location to ${newStatus}...`);
    const updateRes = await api.put(`/laptops/${laptop._id}/location`, { locationStatus: newStatus });
    
    console.log('Update response dynamic data:', updateRes.data.locationStatus);
    console.log('Update response studentId field:', updateRes.data.studentId);
    
    if (typeof updateRes.data.studentId === 'object' && updateRes.data.studentId.name) {
      console.log('VERIFICATION SUCCESS: studentId is populated in response.');
    } else {
      console.log('VERIFICATION FAILURE: studentId is NOT populated in response.');
    }

  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

test();
