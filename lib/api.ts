import axios from "axios";

const url = `${process.env.NEXT_PUBLIC_URL}/api`;
async function userExists(user: string) {
  try {
    const res = await axios.post(
      `${url}/auth/sign_in`,
      { user },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.user[0];
  } catch (err) {
    console.log(err);
  }
}

async function registerUser(userData: { email: string; password: string; name?: string }) {
  try {
    const res = await axios.post(`${url}/auth/register`, {
      ...userData,
      name: userData.name || userData.email.split('@')[0], // Use email username as default name
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return { 
      data: { 
        success: res.status === 201,
        requiresVerification: res.data.requiresVerification,
        error: null 
      } 
    };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { 
      data: { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed' 
      } 
    };
  }
}

export { userExists, registerUser };
