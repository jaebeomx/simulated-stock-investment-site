import { React, useState, useEffect } from "react";
//아래 한줄 추가 (Offcanvas)

function StockData(props) {
  // const [stockPrice, setStockPrice] = useState(null);
  // const [cumulativeVolume, setCumulativeVolume] = useState(null);
  // const [cumulativeTradeAmount, setCumulativeTradeAmount] = useState(null);
  // const [previousDayDifference, setPreviousDayDifference] = useState(null);
  // const [previousDayRate, setPreviousDayRate] = useState(null);
  // const [stockName, setStockName] = useState("");
  // const [stockClosingPrice, setStockClosingPrice] = useState("");
  //
  const [socket, setSocket] = useState(null);
  const [stockData, setStockData] = useState({
    stockPrice: null,
    cumulativeVolume: null,
    cumulativeTradeAmount: null,
    previousDayDifference: null,
    previousDayRate: null,
    stockName: "",
    stockClosingPrice: "",
  });
  //
  const [fade, setFade] = useState("");
  const [animation, setAnimation] = useState("");

  //애니메이션 효과
  useEffect(() => {
    let a = setTimeout(() => {
      setFade("end");
    }, 10);
    return () => {
      clearTimeout(a);
      setFade("");
    };
  }, [props.search]);

  useEffect(() => {
    //이 코드는 웹브라우저 환경에서 실행되므로(클라이언트 사이드 렌더링)
    // 추가적인 패키치 설치가 필요 없음
    const newSocket = new WebSocket(
      "ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0"
    );
    // 웹소켓 연결이 열릴 때 메시지 전송 //approval_key는 웹소켓 접속키. 유효기간 1년
    newSocket.onopen = () => {
      var message = {
        header: {
          approval_key: "904975d6-dabf-4ebd-afa3-c4f98679d161",
          custtype: "P",
          tr_type: "1",
          "content-type": "utf-8",
        },
        body: {
          input: {
            tr_id: "H0STCNT0",
            tr_key: props.search,
          },
        },
      };
      newSocket.send(JSON.stringify(message));
    };

    // 메시지가 도착했을 때 상태 업데이트
    newSocket.onmessage = (event) => {
      if (event.data.startsWith("0|H0STCNT0")) {
        // 메시지를 '|' 기호로 분리
        var parts = event.data.split("|");

        // '^' 기호로 분리하여 데이터 추출
        var data = parts[3].split("^");
        setStockData((prevData) => ({
          ...prevData,
          stockPrice: data[2] || prevData.stockPrice,
          previousDayDifference: data[4] || prevData.previousDayDifference,
          previousDayRate: data[5] || prevData.previousDayRate,
          cumulativeVolume: data[13] || prevData.cumulativeVolume,
          cumulativeTradeAmount: data[14] || prevData.cumulativeTradeAmount,
          // stockName: stockData.stockName,
          // stockClosingPrice: stockData.stockClosingPrice,
          stockName: prevData.stockName || "",
          stockClosingPrice: prevData.stockClosingPrice || "",
        }));
        props.setSearchPrice(data[2]);
      }
    };
    setSocket(newSocket);
    // 컴포넌트 unmount 시점에 웹소켓 연결 종료
    return () => {
      newSocket.close();
    };
  }, [props.search]);

  useEffect(() => {
    if (!socket) return;

    // API 호출 최적화 - 한 번에 정보 가져오기
    Promise.all([
      fetch(`/getStockName?search=${props.search}`).then((response) =>
        response.json()
      ),
      fetch(`/getStckClpr?search=${props.search}`).then((response) =>
        response.json()
      ),
    ])
      .then(([stockNameData, stockClosingPriceData]) => {
        setStockData((prevData) => ({
          ...prevData,
          stockName: stockNameData.name || prevData.stockName,
          stockClosingPrice:
            stockClosingPriceData.stckClpr || prevData.stockClosingPrice,
        }));
        props.setSearchName(stockNameData.name);
      })
      .catch((error) => console.error("Error:", error));
  }, [props.search, socket]);

  useEffect(() => {
    if (stockData.previousDayRate > 0) {
      setAnimation("red-flash");
    } else if (stockData.previousDayRate < 0) {
      setAnimation("blue-flash");
    }
    const timer = setTimeout(() => {
      setAnimation("");
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [stockData.stockPrice]);

  useEffect(() => {
    let a = setTimeout(() => {
      setFade("end");
    }, 10);
    return () => {
      clearTimeout(a);
      setFade("");
    };
  }, [props.search]);

  return (
    <div className={"start " + fade}>
      <div
        className={"stockdata-bg " + animation}
        style={{
          marginTop: "10px",
          width: "100%",
          display: "flex",
          padding: "5px 50px 5px 50px",
          // backgroundColor: "#EEE",
          borderRadius: "10px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2>{stockData.stockName}</h2>
          <h6>종목코드: {props.search}</h6>
        </div>
        <div>
          {stockData.stockPrice ? (
            <h4>주식 현재가</h4>
          ) : (
            <h4>시간외 주식 종가</h4>
          )}
          {stockData.stockPrice ? (
            <h4
              style={{
                color: stockData.previousDayRate > 0 ? "#ED2925" : "#2679ED",
              }}
            >
              {parseInt(stockData.stockPrice).toLocaleString()}원
            </h4>
          ) : (
            <h4>{parseInt(stockData.stockClosingPrice).toLocaleString()}원</h4>
          )}
        </div>
        <div>
          {stockData.previousDayDifference ? (
            <h4>전일 대비</h4>
          ) : (
            <div
              style={{
                padding: "5px 20px",
                borderRadius: "10px",
                backgroundColor: "#FCE4ED",
              }}
            >
              <h5 style={{ color: "red" }}>주식 매매 거래시간 안내</h5>
              <h6 style={{ color: "red" }}>09:00 ~ 15:30</h6>
            </div>
          )}
          {stockData.previousDayDifference ? (
            <h4
              style={{
                color:
                  stockData.previousDayDifference > 0 ? "#ED2925" : "#2679ED",
              }}
            >
              {parseInt(stockData.previousDayDifference).toLocaleString()}원
            </h4>
          ) : (
            ""
          )}
        </div>
        <div>
          {stockData.previousDayRate ? <h4>등락률</h4> : ""}
          {stockData.previousDayRate ? (
            <h4
              style={{
                color: stockData.previousDayRate > 0 ? "#ED2925" : "#2679ED",
              }}
            >
              {stockData.previousDayRate}%
            </h4>
          ) : (
            ""
          )}
        </div>
        <div>
          {stockData.cumulativeVolume ? (
            <h5>
              누적 거래량:{" "}
              {parseInt(stockData.cumulativeVolume).toLocaleString()}
            </h5>
          ) : (
            ""
          )}
          {stockData.cumulativeTradeAmount ? (
            <h5>
              누적 거래대금:{" "}
              {parseInt(stockData.cumulativeTradeAmount).toLocaleString()}원
            </h5>
          ) : (
            ""
          )}
        </div>
        <div>
          <button className="buy-btn" onClick={props.handleShowBuy}>
            매수
          </button>
          <button className="sell-btn" onClick={props.handleShowSell}>
            매도
          </button>
        </div>
      </div>
      <hr></hr>
    </div>
  );
}

export default StockData;
