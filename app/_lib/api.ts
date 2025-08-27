import axios from "axios";

async function userExists(user: string) {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/auth/sign_in",
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

async function registerUser(userData: { email: string; password: string }) {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/auth/register",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("una", res);

    return res;
  } catch (err) {
    console.log(err);
  }
}

export { userExists, registerUser };
