const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");

// const WebSocket = require("ws");
// //웹소켓은 http와는 다른 프로토콜이므로 http 요청과 별도의 연결이 필요함
// const wss = new WebSocket.Server({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("클라이언트 웹소켓 연결");
//   ws.on("message", (message) => {
//     console.log(`메세지 받음: ${message}`);
//   });
// });

// ws.on;
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));
//발급받은 접근토큰(authorizationToken) 변수에 저장(유효기간 1일)
//여기만 하루마다 바꿔주면됨
const authorizationToken =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6ImE1M2ZmMWZhLTBmZjAtNGI1Yy04Y2QwLWNmYzY4ODUyY2U4NyIsImlzcyI6InVub2d3IiwiZXhwIjoxNzAxODI3NTY3LCJpYXQiOjE3MDE3NDExNjcsImp0aSI6IlBTdUk5SjY0TndQNmhacUFVbndZWklQSm1hSlozMWFXWEZJZSJ9.PWrlrdVXCyNkpoilk4MbkwrOp9OZChwebg-XivFNBthfzOufJ3oxOpCwRSKtOKIzbm_4m4DN9319Mv_v7FP77A";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "19990922",
  database: "virtualStock",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }
  console.log("DB Connection Success");
});

//서버 시작
app.listen(8080, function () {
  console.log("listening on 8080");
});
//밑에 세개는 /와 /rank와 /mypage 경로에 대해 각각 index.html파일을 제공하도록 설정
//이렇게하면 저 경로의 요청만 index.html 파일을 제공하므로
//리액트 앱이 클라이언트 측에서 이 경로를 처리할 수 있음
//근데 다른경로로의 요청은 처리되지 않음
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/rank", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/mypage", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
//주식 차트 정보 제공
//이건 접근토큰(authorization) 유효기간 1일임
app.get("/getStockData30", async (req, res) => {
  try {
    const search = req.query.search; //매개변수 search값을 읽어옴
    const response = await axios.get(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${search}&fid_period_div_code=W&fid_org_adj_prc=1`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: authorizationToken,
          appkey: "PSuI9J64NwP6hZqAUnwYZIPJmaJZ31aWXFIe",
          appsecret:
            "pLuA0K7dvlHzJIoMG1lpoicr3i0rBUH6eO9U6X3Ezbbf4msReJUkv5eEW+h928h1/1aDJ6XELR9KFaMq/7kuGIpZ7CdD70qwJJHKqX/Rl4D7e3Ucya7ze44I9wy1FXDtdIbF+8lG2ARk+ImLCQiFI5zgl0fgVlzijC8K/RIW2KcCBGz9MRY=",
          tr_id: "FHKST01010400",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ error: "데이터를 가져오는 동안 오류가 발생했습니다" });
  }
});

//주식 종목명 가져와서 보내주기 //authorization 하루마다 바꿔주기
app.get("/getStockName", async (req, res) => {
  try {
    const search = req.query.search; //매개변수 search값을 읽어옴
    const response = await axios.get(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/search-info?PDNO=${search}&PRDT_TYPE_CD=300`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: authorizationToken,
          appkey: "PSuI9J64NwP6hZqAUnwYZIPJmaJZ31aWXFIe",
          appsecret:
            "pLuA0K7dvlHzJIoMG1lpoicr3i0rBUH6eO9U6X3Ezbbf4msReJUkv5eEW+h928h1/1aDJ6XELR9KFaMq/7kuGIpZ7CdD70qwJJHKqX/Rl4D7e3Ucya7ze44I9wy1FXDtdIbF+8lG2ARk+ImLCQiFI5zgl0fgVlzijC8K/RIW2KcCBGz9MRY=",
          tr_id: "CTPF1604R",
          custtype: "P",
        },
      }
    );
    let name = response.data.output.prdt_abrv_name;
    console.log(name);
    res.json({ name });
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ error: "데이터를 가져오는 동안 오류가 발생했습니다" });
  }
});

// authorization 하루마다 바꿔주기
// 주식 종가 가져오는 코드 (시간외 일자별 주가)
app.get("/getStckClpr", async (req, res) => {
  try {
    const search = req.query.search; //매개변수 search값을 읽어옴
    const response = await axios.get(
      `https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-daily-overtimeprice?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${search}`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: authorizationToken,
          appkey: "PSuI9J64NwP6hZqAUnwYZIPJmaJZ31aWXFIe",
          appsecret:
            "pLuA0K7dvlHzJIoMG1lpoicr3i0rBUH6eO9U6X3Ezbbf4msReJUkv5eEW+h928h1/1aDJ6XELR9KFaMq/7kuGIpZ7CdD70qwJJHKqX/Rl4D7e3Ucya7ze44I9wy1FXDtdIbF+8lG2ARk+ImLCQiFI5zgl0fgVlzijC8K/RIW2KcCBGz9MRY=",
          tr_id: "FHPST02320000",
        },
      }
    );
    //종가 추출
    let stckClpr = response.data.output2[0].stck_clpr;
    console.log(stckClpr);
    res.json({ stckClpr });
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ error: "데이터를 가져오는 동안 오류가 발생했습니다" });
  }
});

///////////////////////////////////////////////

//DB

//주식명 찾기
app.get("/search", (req, res) => {
  const query = req.query.query;
  connection.query(
    "SELECT * FROM Company_Tbl WHERE stock_name = ?",
    [query],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
      } else {
        res.send(rows);
      }
    }
  );
});

//로그인 버튼 누르면
app.get("/login", (req, res) => {
  const id = req.query.id;
  const password = req.query.password;
  connection.query(
    "select * from user where id=? and password=?",
    [id, password],
    (error, results, fields) => {
      if (error) throw error;

      if (results.length > 0) {
        // res.send("Login successful");
        res.json({ status: "Login successful", name: results[0].name });
      } else {
        res.send("Login failed");
      }
    }
  );
});

//아이디 중복검사
app.get("/checkId", (req, res) => {
  const createUserId = req.query.createUserId;
  connection.query(
    "select * from user where id=?",
    [createUserId],
    (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        res.send("Can not use Id");
      } else {
        res.send("Can use Id");
      }
    }
  );
});

//회원 계정 생성
app.get("/createAccount", (req, res) => {
  const createUserId = req.query.createUserId;
  const createUserPassWord = req.query.createUserPassWord;
  const createUserNickName = req.query.createUserNickName;
  connection.query(
    "INSERT INTO user (id, password, name) VALUES (?, ?, ?)",
    [createUserId, createUserPassWord, createUserNickName],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error");
      } else {
        res.send("Success");
      }
    }
  );
});

//매수버튼 누르면
app.get("/buystock", (req, res) => {
  const id = req.query.id;
  const number = parseInt(req.query.number);
  const searchPrice = parseInt(req.query.searchPrice);
  const searchName = req.query.searchName;

  // 먼저 사용자의 현금을 업데이트
  connection.query(
    `UPDATE user SET cash = cash - ${number} * ${searchPrice} WHERE id = ?`,
    [id],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Database error");
        return;
      }

      // 그 다음에 이미 보유중인 주식인지 확인
      connection.query(
        "SELECT * FROM Account WHERE user_id = ? AND stock_name = ?",
        [id, searchName],
        (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500).send("Database error");
            return;
          }

          if (results.length > 0) {
            // 이미 보유 주식인 경우, 수량만 늘려주기
            connection.query(
              "SELECT quantity, averagePrice FROM Account WHERE user_id = ? AND stock_name = ?",
              [id, searchName],
              (error, results, fields) => {
                if (error) {
                  console.error(error);
                  res.status(500).send("Database error");
                  return;
                }

                if (results.length > 0) {
                  const oldQuantity = results[0].quantity;
                  const oldAveragePrice = results[0].averagePrice;
                  const newQuantity = oldQuantity + number;
                  const newAveragePrice =
                    (oldQuantity * oldAveragePrice + number * searchPrice) /
                    newQuantity;

                  connection.query(
                    "UPDATE Account SET quantity = ?, averagePrice = ? WHERE user_id = ? AND stock_name = ?",
                    [newQuantity, newAveragePrice, id, searchName],
                    (error, results, fields) => {
                      if (error) {
                        console.error(error);
                        res.status(500).send("Database error");
                        return;
                      }
                      res.send("Buy Success");
                    }
                  );
                }
              }
            );
          } else {
            // 새로운 종목 구매일경우
            connection.query(
              "INSERT INTO Account (stock_name, quantity, averagePrice, user_id) VALUES (?, ?, ?, ?)",
              [searchName, number, searchPrice, id],
              (error, results, fields) => {
                if (error) {
                  console.error(error);
                  res.status(500).send("Database error");
                  return;
                }
                res.send("Buy Success");
              }
            );
          }
        }
      );
    }
  );
});

//매도버튼 누르면
app.get("/sellstock", (req, res) => {
  const id = req.query.id;
  const number = parseInt(req.query.number);
  const searchPrice = parseInt(req.query.searchPrice);
  const searchName = req.query.searchName;

  // 매도하려는 주식을 보유중인지 확인
  connection.query(
    "SELECT quantity, averagePrice FROM Account WHERE user_id = ? AND stock_name = ?",
    [id, searchName],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Database error");
        return;
      }

      if (results.length > 0) {
        const oldQuantity = parseInt(results[0].quantity);
        const newQuantity = oldQuantity - number;

        if (newQuantity > 0) {
          // 매도 후 수량이 남아있다면
          connection.query(
            "UPDATE Account SET quantity = ? WHERE user_id = ? AND stock_name = ?",
            [newQuantity, id, searchName],
            (error, results, fields) => {
              if (error) {
                console.error(error);
                res.status(500).send("Database error");
                return;
              }
              res.send("Sell Success");
            }
          );
        } else if (newQuantity === 0) {
          // 매도 후 수량이 없다면
          connection.query(
            "DELETE FROM Account WHERE user_id = ? AND stock_name = ?",
            [id, searchName],
            (error, results, fields) => {
              if (error) {
                console.error(error);
                res.status(500).send("Database error");
                return;
              }
              res.send("Sell Success");
            }
          );
        } else {
          // 매도 수량이 보유 수량보다 많다면
          res.send("매도 수량이 보유 수량보다 많습니다");
        }

        // 현금 반환
        if (newQuantity >= 0) {
          connection.query(
            `UPDATE user SET cash = cash + ${number} * ${searchPrice} WHERE id = ?`,
            [id],
            (error, results, fields) => {
              if (error) {
                console.error(error);
                res.status(500).send("Database error");
                return;
              }
            }
          );
        }
      }
    }
  );
});

//포트폴리오 디테일 보여주기
app.get("/portfolio/detail", (req, res) => {
  const id = req.query.id;
  connection.query(
    "select * from Account where user_id=?",
    [id],
    (err, rows, fields) => {
      if (err) {
        console.log("Error");
      } else {
        res.send(rows);
      }
    }
  );
});

//포트폴리오중 현금 보유량
app.get("/portfolio/detail/cash", (req, res) => {
  const id = req.query.id;
  connection.query(
    "select * from user where id=?",
    [id],
    (err, rows, fields) => {
      if (err) {
        console.log("Error");
      } else {
        res.send(rows);
      }
    }
  );
});

//랭킹 가져오기
app.get("/ranking", (req, res) => {
  connection.query(
    "SELECT user_id, GROUP_CONCAT(CONCAT(stock_name, '^', quantity, '^', averagePrice)) AS stocks FROM Account GROUP BY user_id;",
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Rank Database error");
        return;
      }
      res.json(results);
    }
  );
});

//닉네임 변경
app.get("/changeNickName", (req, res) => {
  const nickName = req.query.changeNickName;
  const id = req.query.id;
  connection.query(
    "update user set name=? where id=?",
    [nickName, id],
    (err, rows, fields) => {
      if (err) {
        console.log("Error");
      } else {
        res.send("닉네임 변경완료!");
      }
    }
  );
});

//비밀번호 변경
app.get("/changePassWord", (req, res) => {
  const passWord = req.query.changePassWord;
  const id = req.query.id;
  connection.query(
    "update user set password=? where id=?",
    [passWord, id],
    (err, rows, fields) => {
      if (err) {
        console.log("Error");
      } else {
        res.send("비밀번호 변경완료!");
      }
    }
  );
});

//종합잔고 조회
app.get("/viewMyAccount", (req, res) => {
  const id = req.query.id;
  connection.query(
    "select stock_name, quantity, averagePrice from Account where user_id=?",
    [id],
    (err, rows, fields) => {
      if (err) {
        console.error(error);
      } else {
        res.send(rows);
      }
    }
  );
});

//주식현재가 시세 가져오기 테스트
app.get("/currentStockPrice", async (req, res) => {
  try {
    //stock_code는 문자열이어야함
    const stock_code = req.query.stock_code;
    const response = await axios.get(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stock_code}`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: authorizationToken,
          appkey: "PSuI9J64NwP6hZqAUnwYZIPJmaJZ31aWXFIe",
          appsecret:
            "pLuA0K7dvlHzJIoMG1lpoicr3i0rBUH6eO9U6X3Ezbbf4msReJUkv5eEW+h928h1/1aDJ6XELR9KFaMq/7kuGIpZ7CdD70qwJJHKqX/Rl4D7e3Ucya7ze44I9wy1FXDtdIbF+8lG2ARk+ImLCQiFI5zgl0fgVlzijC8K/RIW2KcCBGz9MRY=",
          tr_id: "FHKST01010100",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
  }
});
