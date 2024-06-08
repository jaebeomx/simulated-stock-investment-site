import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import StockData from "./Component/StockData";
import {
  Nav,
  Navbar,
  Button,
  Container,
  Form,
  Card,
  Offcanvas,
  Fade,
} from "react-bootstrap";
import { Routes, Route, Link } from "react-router-dom";
import React, { Component, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import ApexChart from "react-apexcharts";
import StockChart from "./Component/StockChart";
import ApexChartDraw from "./Component/ApexChartDraw";
import MyPage from "./Component/MyPage.js";
import Login from "./Component/Login.js";
import RankPage from "./Component/RankPage.js";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  //preSearch에 검색창에 입력한 검색어 임시저장
  const [preSearch, setPreSearch] = useState("");
  const [search, setSearch] = useState("005930");
  //검색값 StockData에서 setSearchPrice state 업데이트 하기
  const [searchPrice, setSearchPrice] = useState("");
  const [searchName, setSearchName] = useState("");
  const [error, setError] = useState(null);
  const [trade, setTrade] = useState("");
  const [tradeCheck, setTradeCheck] = useState(false);
  const [tradeMessage, setTradeMessage] = useState("");
  //매수/매도 주식 수량
  const [number, setNumber] = useState(0);
  const [show, setShow] = useState(false);
  //로그인상태 check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //로그인창에서 로그인하면 id,pw, 이름 여기에 저장함
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [nickName, setNickName] = useState("");

  //매수,매도 버튼 누를 때 OffCanvas 보여주기용 함수
  const handleShowBuy = () => {
    setShow(true);
    setTrade("매수");
  };
  const handleShowSell = () => {
    setShow(true);
    setTrade("매도");
  };
  const handleClose = () => {
    setShow(false);
  };

  //MySQL에서 종목명 찾고 setSearch에 저장
  useEffect(() => {
    //문자열로 시작하는지 parsedSearch로 확인
    const parsedSearch = parseInt(preSearch);
    //한글 종목이라면
    if (isNaN(parsedSearch)) {
      fetch(`/search?query=${preSearch}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0 && data[0].hasOwnProperty("stock_code")) {
            const code = data[0].stock_code;
            //한글종목에 해당하는 종목코드 찾아서 search에 업데이트
            setSearch(code);
            console.log(code);
          }
        });
    }
    setSearch(preSearch);
  }, [preSearch]);

  //ApexChart 그리기용 데이터 저장
  useEffect(() => {
    //저장한 종목코드를 기반으로 주식 30주봉 차트 그리기
    fetch(`/getStockData30?search=${search}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.output) {
          const transformedData = data.output.map((item) => ({
            x: item.stck_bsop_date,
            y: [item.stck_oprc, item.stck_hgpr, item.stck_lwpr, item.stck_clpr],
          }));
          setData(transformedData);
        } else {
          setError(data.error);
        }
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
      });
  }, [search]); //의존성배열 search 추가. search값 변경될 때마다 새로운 fetch함

  return (
    <div>
      {isLoggedIn ? (
        <MainNav
          preSearch={preSearch}
          setPreSearch={setPreSearch}
          setIsLoggedIn={setIsLoggedIn}
          setId={setId}
          setPw={setPw}
        ></MainNav>
      ) : (
        ""
      )}
      <Routes>
        <Route
          path="/rank"
          element={
            isLoggedIn ? (
              <RankPage id={id}></RankPage>
            ) : (
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setId={setId}
                setPw={setPw}
                setNickName={setNickName}
              ></Login>
            )
          }
        ></Route>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <div>
                <div>
                  <div className="row portfolio">
                    <div className="col-md-9">
                      <div style={{ height: "15vh" }}>
                        <StockData
                          search={search}
                          setSearch={setSearch}
                          handleShowBuy={handleShowBuy}
                          handleShowSell={handleShowSell}
                          setSearchPrice={setSearchPrice}
                          setSearchName={setSearchName}
                        ></StockData>
                      </div>
                      <div style={{ height: "70vh" }}>
                        <ApexChartDraw data={data}></ApexChartDraw>
                      </div>
                      <div class="container">
                        <div class="row">{/* <NewsCard></NewsCard> */}</div>
                      </div>
                    </div>
                    <div
                      className="col-md-3 portfolio-detail"
                      style={{ height: "90vh", overflow: "auto" }}
                    >
                      <PortfolioDetail
                        tradeCheck={tradeCheck}
                        id={id}
                        nickName={nickName}
                      ></PortfolioDetail>
                      {/* StockData 컴포넌트에서 매수/매도버튼 누르면 Offcanvas보여줌 */}
                      <Offcanvas
                        show={show}
                        onHide={handleClose}
                        placement="end"
                      >
                        <Offcanvas.Header closeButton>
                          <Offcanvas.Title>
                            <h1
                              style={
                                trade == "매수"
                                  ? { color: "red" }
                                  : { color: "blue" }
                              }
                            >
                              {trade}
                            </h1>
                          </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                          <h2>주식 주문</h2>
                          <h5>#주문은 자동으로 시장가 주문이 성립됩니다</h5>
                          <hr></hr>
                          <p>수량</p>
                          <div
                            style={{
                              display: "flex",
                              position: "relative",
                              marginBottom: "10px",
                            }}
                          >
                            <div style={{ position: "relative", flex: 1 }}>
                              <input
                                type="text"
                                value={number}
                                onChange={(event) => {
                                  //주식 주문 수량에 따라 state 변경하기
                                  setNumber(event.target.value);
                                }}
                                style={{
                                  paddingRight: "30px",
                                  width: "100%",
                                  textAlign: "right",
                                }}
                              ></input>
                              <label
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              >
                                주
                              </label>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setNumber(parseInt(number) + 1);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  class="bi bi-arrow-up"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (parseInt(number) > 0) {
                                    setNumber(parseInt(number) - 1);
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  class="bi bi-arrow-down"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {trade == "매수" ? (
                            //최종 매수버튼
                            <button
                              style={{
                                width: "100%",
                                color: "#ed2926",
                                backgroundColor: "#f0d1cf",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                              }}
                              onClick={() => {
                                if (number <= 0) {
                                  setTradeMessage("올바른 수량을 입력하세요");
                                  setTradeCheck(true);
                                  setTimeout(() => {
                                    setTradeCheck(false);
                                  }, 1100);
                                } else {
                                  fetch(
                                    `/buystock?number=${number}&id=${id}&searchPrice=${searchPrice}&searchName=${searchName}`
                                  )
                                    .then((response) => {
                                      if (!response.ok) {
                                        throw new Error(
                                          `HTTP error! status: ${response.status}`
                                        );
                                      }
                                      return response.text();
                                    })
                                    .then((message) => {
                                      console.log("Server response:", message);
                                      // 주문 체결되었습니다 반짝이고 없애기
                                      setTradeMessage(
                                        "매수 주문 체결되었습니다"
                                      );
                                      setTradeCheck(true);
                                      setTimeout(() => {
                                        setTradeCheck(false);
                                      }, 1100);
                                    })
                                    .catch((error) => {
                                      //현금이 부족해서 주문 체결이 안된다면 매수는 안되고
                                      //에러메세지 현금이 부족합니다<-  출력
                                      console.error("Error:", error);
                                      setTradeMessage("현금이 부족합니다");
                                      setTradeCheck(true);
                                      setTimeout(() => {
                                        setTradeCheck(false);
                                      }, 1100);
                                    });
                                }
                              }}
                              aria-controls="trade-check"
                              aria-expanded={tradeCheck}
                            >
                              {trade}
                            </button>
                          ) : (
                            //최종 매도버튼
                            <button
                              style={{
                                width: "100%",
                                color: "#2679ed",
                                backgroundColor: "#d0dbef",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                              }}
                              onClick={() => {
                                if (number <= 0) {
                                  setTradeMessage("올바른 수량을 입력하세요");
                                  setTradeCheck(true);
                                  setTimeout(() => {
                                    setTradeCheck(false);
                                  }, 1100);
                                } else {
                                  fetch(
                                    `/sellstock?number=${number}&id=${id}&searchPrice=${searchPrice}&searchName=${searchName}`
                                  )
                                    .then((response) => {
                                      if (!response.ok) {
                                        throw new Error(
                                          `HTTP error! status: ${response.status}`
                                        );
                                      }
                                      return response.text();
                                    })
                                    .then((message) => {
                                      console.log("Server response:", message);

                                      // 주문 체결되었습니다 반짝이고 없애기
                                      setTradeMessage(
                                        message ===
                                          "매도 수량이 보유 수량보다 많습니다"
                                          ? message
                                          : "매도 주문 체결되었습니다"
                                      );
                                      setTradeCheck(true);
                                      setTimeout(() => {
                                        setTradeCheck(false);
                                      }, 1100);
                                    })
                                    .catch((error) => {
                                      console.error("Error:", error);
                                      setTradeMessage(
                                        "올바른 수량을 입력하세요"
                                      );
                                      setTradeCheck(true);
                                      setTimeout(() => {
                                        setTradeCheck(false);
                                      }, 1100);
                                    });
                                }
                              }}
                              aria-controls="trade-check"
                              aria-expanded={tradeCheck}
                            >
                              {trade}
                            </button>
                          )}
                          <Fade in={tradeCheck}>
                            <h3
                              id="trade-check"
                              style={{
                                marginTop: "20px",
                                color: "#108229",
                                color:
                                  tradeMessage === "올바른 수량을 입력하세요" ||
                                  tradeMessage === "현금이 부족합니다" ||
                                  tradeMessage ===
                                    "올바른 매도 수량을 입력하세요" ||
                                  tradeMessage ===
                                    "매도 수량이 보유 수량보다 많습니다"
                                    ? "black"
                                    : "#4BA65F",
                                backgroundColor:
                                  tradeMessage === "올바른 수량을 입력하세요" ||
                                  tradeMessage === "현금이 부족합니다" ||
                                  tradeMessage ===
                                    "올바른 매도 수량을 입력하세요" ||
                                  tradeMessage ===
                                    "매도 수량이 보유 수량보다 많습니다"
                                    ? "#FCF311"
                                    : "#B3E0BD",
                                borderRadius: "10px",
                                textAlign: "center",
                                padding: "10px 20px",
                              }}
                            >
                              {tradeMessage}
                            </h3>
                          </Fade>
                        </Offcanvas.Body>
                      </Offcanvas>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setId={setId}
                setPw={setPw}
                setNickName={setNickName}
              ></Login>
            )
          }
        ></Route>
        <Route
          path="/mypage"
          element={
            isLoggedIn ? (
              <MyPage nickName={nickName} id={id}></MyPage>
            ) : (
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setId={setId}
                setPw={setPw}
                setNickName={setNickName}
              ></Login>
            )
          }
        ></Route>
      </Routes>
    </div>
  );
}

export default App;

///////////////////////
///////////////////////
//이 밑에는 컴포넌트들 모음//
///////////////////////
///////////////////////

function MainNav(props) {
  const [input, setInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    props.setPreSearch(input); // input 값을 setSearch()에 전달
  };
  const handleChange = (event) => {
    setInput(event.target.value); // 입력 필드의 값을 input 상태에 저장
  };

  return (
    <div>
      <Navbar
        bg="light"
        data-bs-theme="light"
        expand="lg"
        style={{ borderBottom: "1px solid" }}
      >
        <Container fluid style={{ marginLeft: "50px", marginRight: "10px" }}>
          <Link to="/" className="link-style">
            <img
              alt=""
              src="hen.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Chicken Stock
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" />

          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            >
              <Link to="/" className="link-style">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  class="bi bi-house-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z" />
                  <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z" />
                </svg>
                Home
              </Link>
              <Link to="/rank" className="link-style">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  class="bi bi-award-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864 8 0z" />
                  <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z" />
                </svg>
                Rank
              </Link>
            </Nav>
            <Form className="d-flex mx-auto" onSubmit={handleSubmit}>
              <Form.Control
                type="search"
                placeholder="종목 검색"
                className="me-2"
                aria-label="Search"
                onChange={handleChange}
              />
              <Button variant="outline-success" type="submit">
                Search
              </Button>
            </Form>
            <Link to="/mypage" className="link-style">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-person-circle"
                viewBox="0 0 16 16"
                style={{ marginRight: "10px" }}
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fill-rule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
              </svg>
              마이페이지
            </Link>
            <button
              className="logout-btn"
              onClick={() => {
                props.setIsLoggedIn(false);
              }}
            >
              로그아웃
            </button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 라우트 추가 */}
    </div>
  );
}

function PortfolioDetail(props) {
  //가져온 내 매수 종목들 array
  const [myStockData, setMyStockData] = useState(null);
  const [myCash, setMyCash] = useState("");
  //이제 최종 매수/매도버튼을 누를때마다 포트폴리오detail 업데이트함
  useEffect(() => {
    fetch(`/portfolio/detail?id=${props.id}`)
      .then((response) => response.json())
      .then((data) => setMyStockData(data));
    console.log(myStockData);
    fetch(`/portfolio/detail/cash?id=${props.id}`)
      .then((response) => response.json())
      .then((data) => setMyCash(data[0].cash.toString()));
  }, [props.tradeCheck, props.id]);
  return (
    <div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#494B49",
          color: "white",
          borderRadius: "10px",
          padding: "5px 10px",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            class="bi bi-coin"
            viewBox="0 0 16 16"
            style={{ marginRight: "10px" }}
          >
            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z" />
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
          </svg>
          {props.nickName}님의 포트폴리오
        </h3>
        <div
          style={{
            backgroundColor: "white",
            color: "black",
            borderRadius: "5px",
          }}
        >
          <span>현금잔고(예수금): </span>
          <span>{parseInt(myCash).toLocaleString()} 원</span>
        </div>
      </div>
      {myStockData && myStockData.length > 0 ? (
        myStockData.map((stock, index) => (
          <div
            key={index}
            className="껍데기1"
            style={{
              width: "100%",
              backgroundColor: "#E6E2C6",
              marginBottom: "15px",
              padding: "10px 15px",
            }}
          >
            <div className="껍데기2">
              <div className="내용물1">
                <h4 style={{ color: "#000000" }}>{stock.stock_name}</h4>
                <span style={{ display: "inline-block", width: "80px" }}>
                  보유 수량
                </span>
                <span>: {stock.quantity}주</span>
              </div>
              <div className="내용물2">
                <span style={{ display: "inline-block", width: "80px" }}>
                  매수총액
                </span>
                <span>
                  : {(stock.averagePrice * stock.quantity).toLocaleString()}원
                </span>
              </div>
              <div className="내용물3">
                <span style={{ display: "inline-block", width: "80px" }}>
                  매수 단가
                </span>
                <span>: {stock.averagePrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            textAlign: "center",
            backgroundColor: "#eee",
            borderRadius: "10px",
            padding: "10px 20px",
            marginTop: "30px",
          }}
        >
          <h4>주식을 매수하세요!</h4>
          <h6>주식을 매수하면 매수한 주식의</h6>
          <h6> 수량, 수익, 매수 단가를 확인할 수 있습니다.</h6>
        </div>
      )}
    </div>
  );
}
