import React, { useState, useEffect } from "react";

function MyPage(props) {
  //nickName이랑 id를 props로 받음
  const [data, setData] = useState(null);
  const [editInfo, setEditInfo] = useState(false);
  const [changeNickName, setChangeNickName] = useState("");
  const [changePassWord, setChangePassWord] = useState("");
  const [fade, setFade] = useState("");
  const [stateMessage, setStateMessage] = useState("");
  const [cash, setCash] = useState("");
  const [myStockData, setMyStockData] = useState([]);
  const [myStockData2, setMyStockData2] = useState([]);
  const [myStockData3, setMyStockData3] = useState([]);

  const formatNumberWithCommas = (number) => {
    return number.toLocaleString();
  };

  //현금조회 먼저 하면 그다음 주식조회
  useEffect(() => {
    fetch(`/portfolio/detail/cash?id=${props.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("에러");
        }
        return response.json();
      })
      .then((data) => {
        setCash(data[0].cash);
        //내 주식 조회. 근데 종목코드, 현재가는 없음
        fetch(`/viewMyAccount?id=${props.id}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("에러");
            }
            return response.json();
          })
          .then((data) => {
            setMyStockData(data);
          });
      });
  }, []);

  //   내 주식에서 fetchStockCode()함수 사용해서 MySQL에 주식 종목코드 조회 후 업데이트
  useEffect(() => {
    const fetchData = async () => {
      const updatedStockData = [];
      for (const stockItem of myStockData) {
        const stockCode = await fetchStockCode(stockItem.stock_name);
        if (stockCode) {
          updatedStockData.push({
            stock_code: stockCode,
            stock_name: stockItem.stock_name,
            quantity: stockItem.quantity,
            averagePrice: stockItem.averagePrice,
          });
        }
      }
      setMyStockData2(updatedStockData);
    };
    fetchData();
  }, [myStockData]);

  useEffect(() => {
    console.log("cash: ", cash);
    console.log("myStockData: ", myStockData);
  }, [cash, myStockData]);

  //MySQL에서 종목코드 가져오는 함수
  const fetchStockCode = async (stockName) => {
    try {
      const response = await fetch(`/search?query=${stockName}`);
      const data = await response.json();
      if (data.length > 0 && data[0].hasOwnProperty("stock_code")) {
        return data[0].stock_code; //종목코드 반환
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    console.log("myStockData2: ", myStockData2);
    fetchStockPrice();
  }, [myStockData2]);

  const fetchStockPrice = async () => {
    try {
      const updatedStockData = await Promise.all(
        myStockData2.map(async (stockItem) => {
          const stockCode = stockItem.stock_code;
          const response = await fetch(
            `/currentStockPrice?stock_code=${stockCode}`
          );
          const data = await response.json();
          return {
            ...stockItem,
            stock_price: data.output.stck_prpr, // 주식 가격 필드 추가 (원하는 필드명 사용)
          };
        })
      );
      // 중복 체크를 통해 중복되지 않은 항목만 추가
      const uniqueStockData = updatedStockData.filter(
        (item) =>
          !myStockData3.some(
            (existingItem) => existingItem.stock_code === item.stock_code
          )
      );
      if (uniqueStockData.length > 0) {
        setMyStockData3((prevStockData) => [...uniqueStockData]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("myStockData3: ", myStockData3);
  }, [myStockData3]);

  useEffect(() => {
    let a = setTimeout(() => {
      setFade("end");
    }, 20);
    return () => {
      clearTimeout(a);
      setFade("");
    };
  }, [editInfo]);

  return (
    <>
      <div className="mypage-background">
        <div className="my-info-background">
          <div className="my-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="70"
              height="70"
              fill="currentColor"
              class="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path
                fill-rule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
              />
            </svg>
            <div style={{ marginTop: "5px" }}>{props.id}</div>
            <button
              onClick={() => {
                setEditInfo(true);
              }}
              className="edit-myinfo-btn"
            >
              내 정보 수정
            </button>
          </div>
          {editInfo ? (
            <div className={"edit-myinfo start " + fade}>
              <span>
                <button
                  onClick={() => {
                    setEditInfo(false);
                  }}
                  className="close-window-btn"
                >
                  창닫기
                </button>
              </span>
              <h4>내정보 수정</h4>
              <input
                placeholder="변경할 닉네임"
                type="text"
                onChange={(e) => setChangeNickName(e.target.value)}
                style={{
                  border: "1px solid #dee2e6",
                  padding: "3px 8px",
                  width: "50%",
                  marginRight: "10px",
                  marginBottom: "10px",
                }}
              ></input>
              <span>
                <button
                  className="change-btn"
                  onClick={() => {
                    fetch(
                      `/changeNickName?changeNickName=${changeNickName}&id=${props.id}`
                    )
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error("에러");
                        }
                        //서버 텍스트 응답 받아옴
                        return response.text();
                      })
                      .then((data) => {
                        setStateMessage(data);
                        setTimeout(() => {
                          setStateMessage("");
                        }, 1000);
                      })
                      .catch((error) => {
                        console.error(error);
                      });
                  }}
                >
                  닉네임 변경
                </button>
                <span style={{ marginLeft: "10px" }}>
                  {stateMessage === "닉네임 변경완료!" ? stateMessage : ""}
                </span>
              </span>
              <input
                placeholder="변경할 비밀번호"
                type="password"
                onChange={(e) => setChangePassWord(e.target.value)}
                style={{
                  border: "1px solid #dee2e6",
                  padding: "3px 8px",
                  width: "50%",
                  marginRight: "10px",
                }}
              ></input>
              <span>
                <button
                  className="change-btn"
                  onClick={() => {
                    fetch(
                      `/changePassWord?changePassWord=${changePassWord}&id=${props.id}`
                    )
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error("에러");
                        }
                        //서버 텍스트 응답 받아옴
                        return response.text();
                      })
                      .then((data) => {
                        setStateMessage(data);
                        setTimeout(() => {
                          setStateMessage("");
                        }, 1000);
                      })
                      .catch((error) => {
                        console.error(error);
                      });
                  }}
                >
                  비밀번호 변경
                </button>
                <span style={{ marginLeft: "10px" }}>
                  {stateMessage === "비밀번호 변경완료!" ? stateMessage : ""}
                </span>
              </span>
            </div>
          ) : (
            ""
          )}
        </div>
        <div style={{ clear: "both", textAlign: "center" }}>
          <p></p>
          <hr></hr>
          <h1>
            {props.nickName}님의 종합 잔고{" "}
            <img src="money-bag.png" style={{ width: "90px" }}></img>
          </h1>

          <table className="rank-table">
            <thead>
              <tr>
                <th>종목명</th>
                <th>보유수량</th>
                <th>수익률</th>
                <th>평가손익</th>
                <th>평가금액</th>
                <th>매수금액</th>
                <th>매수단가</th>
                <th>현재가</th>
              </tr>
            </thead>
            <tbody>
              {myStockData3.map((item, index) => {
                const stockReturn =
                  parseInt(item.stock_price) / myStockData2[index].averagePrice;
                let formattedReturn = 0;
                if (stockReturn != 1) {
                  formattedReturn = ((stockReturn - 1) * 100).toFixed(2);
                }
                return (
                  <tr key={index}>
                    <td>{item.stock_name}</td>
                    <td>{item.quantity}주</td>
                    <td
                      style={{ color: formattedReturn >= 0 ? "red" : "blue" }}
                    >
                      {formattedReturn}%
                    </td>
                    <td
                      style={{
                        color:
                          (item.stock_price -
                            myStockData2[index].averagePrice) *
                            item.quantity >=
                          0
                            ? "red"
                            : "blue",
                      }}
                    >
                      {formatNumberWithCommas(
                        (item.stock_price - myStockData2[index].averagePrice) *
                          item.quantity
                      )}
                      원
                    </td>
                    <td>
                      {formatNumberWithCommas(
                        item.quantity * parseInt(item.stock_price)
                      )}
                      원
                    </td>
                    <td>
                      {formatNumberWithCommas(
                        item.quantity * myStockData2[index].averagePrice
                      )}
                      원
                    </td>
                    <td>
                      {formatNumberWithCommas(myStockData2[index].averagePrice)}
                      원
                    </td>
                    <td>{formatNumberWithCommas(item.stock_price)}원</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="8" style={{ textAlign: "right" }}>
                  현금잔고(예수금): {formatNumberWithCommas(cash)}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MyPage;
