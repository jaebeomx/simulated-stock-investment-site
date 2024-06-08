import React, { useState, useEffect } from "react";
import { Button, Offcanvas } from "react-bootstrap";

function Login(props) {
  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [fade, setFade] = useState("");
  const [show, setShow] = useState(false);
  const [canUseId, setCanUseId] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [createUserId, setCreateUserId] = useState("");
  const [createUserNickName, setCreateUserNickName] = useState("");
  const [createUserPassWord, setCreateUserPassWord] = useState("");
  const [completeCreateAccount, setCompleteCreateAccount] = useState(false);
  const handleCreateUserId = (event) => {
    setCreateUserId(event.target.value);
  };
  const handleCreateUserNickName = (event) => {
    setCreateUserNickName(event.target.value);
  };
  const handleCreateUserPassWord = (event) => {
    setCreateUserPassWord(event.target.value);
  };
  //아이디 중복검사
  const handleCheckId = () => {
    fetch(`/checkId?createUserId=${createUserId}`)
      .then((response) => response.text())
      .then((data) => {
        if (data === "Can use Id") {
          setCanUseId(true);
          setTimeout(() => {
            setCanUseId(null);
          }, 1000);
        } else {
          setCanUseId(false);
          setTimeout(() => {
            setCanUseId(null);
          }, 1000);
        }
      })
      .catch((error) => console.error("Error: ", error));
  };

  useEffect(() => {
    let a = setTimeout(() => {
      setFade("end");
    }, 10);
    return () => {
      clearTimeout(a);
      setFade("");
    };
  }, []);

  //최종 로그인 버튼
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(userId, userPassword);
    fetch(`/login?id=${userId}&password=${userPassword}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Login successful") {
          props.setId(userId);
          props.setPw(userPassword);
          props.setIsLoggedIn(true);
          props.setNickName(data.name);
        } else {
          console.log("Login failed");
        }
      });
  };

  // 최종 회원가입 버튼 누르기
  const handleSignUp = (event) => {
    event.preventDefault();
    fetch(
      `/createAccount?createUserId=${createUserId}&createUserPassWord=${createUserPassWord}&createUserNickName=${createUserNickName}`
    )
      .then((response) => response.text())
      .then((data) => {
        if (data === "Success") {
          setCompleteCreateAccount(true);
          console.log("회원가입 완료");
        } else {
          setCompleteCreateAccount(false);
        }
        setTimeout(() => {
          setShow(false);
        }, 2000);
        setTimeout(() => {
          setCompleteCreateAccount(false);
        }, 2100);
      });
  };
  return (
    <div className="login-bg">
      <div className={"login-form start " + fade}>
        <h4 style={{ textAlign: "center", marginTop: "30px" }}>
          <span>
            <img src="chicken.png"></img>
          </span>
          Chicken Stock
        </h4>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              marginTop: "50px",
            }}
          >
            <input
              placeholder="아이디"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{
                border: "1px solid #dee2e6",
                padding: "13px 12px",
                width: "80%",
              }}
            ></input>
          </div>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <input
              placeholder="비밀번호"
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              style={{
                border: "1px solid #dee2e6",
                padding: "13px 12px",
                width: "80%",
              }}
            ></input>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className="login-btn" type="submit">
              로그인
            </button>
          </div>
        </form>

        <div style={{ marginTop: "10px", textAlign: "center" }}>
          Chicken Stock 회원이 아니신가요?
          <Button
            variant="secondary"
            onClick={handleShow}
            style={{ marginLeft: "10px" }}
          >
            회원가입
          </Button>
          <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>회원가입</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <form onSubmit={handleSignUp}>
                <div>
                  <label htmlFor="username" className="form-label">
                    아이디
                  </label>
                  <input
                    onChange={handleCreateUserId}
                    type="text"
                    className="form-control"
                    id="username"
                  />
                  <button
                    onClick={handleCheckId}
                    style={{
                      marginTop: "10px",
                      marginBottom: "10px",
                      marginRight: "10px",
                    }}
                    type="button"
                    className="btn btn-secondary"
                  >
                    중복 검사{" "}
                  </button>
                  {canUseId === true ? (
                    <span style={{ color: "green" }}>사용 가능한 Id입니다</span>
                  ) : canUseId === false ? (
                    <span style={{ color: "red" }}>이미 사용중인 Id입니다</span>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="nickname" className="form-label">
                    이름(닉네임)
                  </label>
                  <input
                    onChange={handleCreateUserNickName}
                    type="text"
                    className="form-control"
                    id="nickname"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="form-label">
                    비밀번호
                  </label>
                  <input
                    onChange={handleCreateUserPassWord}
                    type="password"
                    className="form-control"
                    id="password"
                  />
                </div>
                <button
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  type="submit"
                  className="btn btn-primary"
                >
                  가입하기
                </button>
                {completeCreateAccount ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#1C6E2E",
                      backgroundColor: "#B3E0BD",
                      padding: "5px 10px",
                    }}
                  >
                    <h2>회원가입 완료!</h2>
                    <h5>잠시후 창이 닫힙니다</h5>
                  </div>
                ) : (
                  ""
                )}
              </form>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>
    </div>
  );
}
export default Login;
