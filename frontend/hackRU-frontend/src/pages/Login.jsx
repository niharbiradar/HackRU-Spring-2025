import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Swal from 'sweetalert2';

export default function Login() {
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState(false);

  const handleClick = () => {
    const callbackUrl = `${window.location.origin}`;
    const googleClientId = "264932793055-5u8radqlsfp3ofjr1brvbk5gqcrs0abg.apps.googleusercontent.com";
    const targetUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=token&client_id=${googleClientId}&scope=openid%20email%20profile`;
    window.location.href = targetUrl;
  };

  const showAlert = () => {
    Swal.fire({
      title: `.edu email is required`,
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  };

  useEffect(() => {
    const accessTokenRegex = /access_token=([^&]+)/;
    const isMatch = window.location.href.match(accessTokenRegex);
  
    if (isMatch) {
      const accessToken = isMatch[1];
      Cookies.set("access_token", accessToken);

      // Fetch user info from Google
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.email && data.email.endsWith(".edu")) {
          const emailAddress = data.email;
          Cookies.set("user_email", emailAddress);  // ✅ Store email for Onboarding

          fetch(`http://localhost:8000/users/check_email?email=${encodeURIComponent(emailAddress)}`)
          .then((res) => res.json())
          .then((resData) => {
            if (resData.exists) {
              setIsLoggedin(true);
              navigate("/rides");
            } else {
              navigate("/onboarding");
            }
          })
          .catch((err) => console.error('Error checking email:', err));
        } else {
          showAlert();
          Cookies.remove("access_token");
        }
      })
      .catch((error) => console.error("Error fetching user info:", error));
    }
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/rides");
    }
  }, [isLoggedin, navigate]);

  return (
    <div className="root">
      <div>
        <h1>Log in with Google</h1>
        <div className="btn-container">
          <button className="btn btn-primary" onClick={handleClick}>Log in with Google</button>
        </div>
      </div>
    </div>
  );
}
