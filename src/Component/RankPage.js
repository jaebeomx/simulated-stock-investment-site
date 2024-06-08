import React, { useEffect, useState } from "react";
// 수익률은 (현재 주식 가격/매수한 주식 가격)*100 - 100 으로 계산

function RankPage(props) {
  //종목코드 안포함된 유저별 데이터
  const [data, setData] = useState([]);
  //종목코드도 포함됨
  const [data2, setData2] = useState([]);
  //총 매수금액
  const [totalBuy, setTotalBuy] = useState([]);
  //총 평가금액
  const [totalEvaluation, setTotalEvaluation] = useState([]);
  //주식 수익률
  const [stockReturns, setSockReturns] = useState([]);
  //수익률 띄우기 전 계산중 상태
  const [calculating, setCalculating] = useState(true);

  useEffect(() => {
    // 서버에서 데이터 가져오기
    fetch(`/ranking`)
      .then((response) => response.json())
      .then((fetchedData) => {
        setData(fetchedData); // 받아온 데이터를 state에 저장
        console.log("Received data:", fetchedData);
        transformData(fetchedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    console.log("Updated data2:", data2);
    if (data2.length > 0) {
      calculateTotalBuy();
      calculateTotalEvaluation();
    }
  }, [data2]);

  //수익률
  useEffect(() => {
    if (totalEvaluation.length > 0 && totalBuy.length > 0) {
      const updatedStockReturns = [];
      totalEvaluation.forEach((evalItem) => {
        const buyItem = totalBuy.find(
          (buy) => buy.user_id === evalItem.user_id
        );

        if (buyItem) {
          //수익률 공식
          const stockReturn = evalItem.total_evaluation / buyItem.total_buy;
          let formattedReturn = 0;
          if (stockReturn > 1) {
            formattedReturn = parseInt((stockReturn - 1) * 100); // 값이 1보다 크면 변환
          } else if (stockReturn < 1) {
            formattedReturn = parseInt((stockReturn - 1) * 100); // 값이 1보다 작으면 변환
          }
          updatedStockReturns.push({
            user_id: evalItem.user_id,
            stock_returns: formattedReturn,
          });
        }
      });
      setSockReturns(updatedStockReturns);
      //수익률 계산중 멘트 안보이게하기
      setCalculating(false);
    }
  }, [totalEvaluation, totalBuy]);

  useEffect(() => {
    console.log("Total Buy Updated:", totalBuy);
  }, [totalBuy]);
  useEffect(() => {
    console.log("Total Evaluation Updated:", totalEvaluation);
  }, [totalEvaluation]);
  useEffect(() => {
    console.log("수익률:", stockReturns);
  }, [stockReturns]);

  const transformData = async (fetchedData) => {
    const updatedData = [];
    for (const item of fetchedData) {
      const stocks = item.stocks.split(",");
      const updatedStocks = [];
      for (const stock of stocks) {
        const [stockName, quantity, averagePrice] = stock.split("^");
        //각 종목의 종목코드 가져오기
        const stockCode = await fetchStockCode(stockName);
        updatedStocks.push({ stockName, stockCode, quantity, averagePrice });
      }
      updatedData.push({ user_id: item.user_id, stocks: updatedStocks });
    }
    setData2(updatedData);
    // console.log(data2);
  };

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
  //새로추가
  const calculateTotalBuy = () => {
    const updatedTotalBuy = [];
    data2.forEach((item) => {
      let total = 0;
      item.stocks.forEach((stock) => {
        total += parseInt(stock.quantity) * parseInt(stock.averagePrice);
      });
      updatedTotalBuy.push({ user_id: item.user_id, total_buy: total });
    });
    setTotalBuy(updatedTotalBuy);
  };
  //
  // 기존 코드와 함께 아래 코드 추가

  //총평가금액
  const calculateTotalEvaluation = async () => {
    const updatedTotalEvaluation = [];
    for (const item of data2) {
      let total = 0;
      for (const stock of item.stocks) {
        const closingPrice = await fetchStockClosingPrice(stock.stockCode);
        if (closingPrice !== null) {
          total += parseInt(stock.quantity) * parseInt(closingPrice);
        }
      }
      updatedTotalEvaluation.push({
        user_id: item.user_id,
        total_evaluation: total,
      });
    }
    setTotalEvaluation(updatedTotalEvaluation);
  };

  const fetchStockClosingPrice = async (stockName) => {
    try {
      //초당 거래건수 초과 방지용 시간 조절
      await new Promise((resolve) => setTimeout(resolve, 90));
      const response = await fetch(`/getStckClpr?search=${stockName}`);
      const data = await response.json();
      if (data.hasOwnProperty("stckClpr")) {
        return data.stckClpr; // 전일 종가 반환
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  //수익률 내림차순 정렬
  const sortedStockReturns = [...stockReturns].sort(
    (a, b) => b.stock_returns - a.stock_returns
  );
  return (
    <div>
      <div className="rank-background">
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ marginRight: "30px" }}>
            <img src="ranking.png" style={{ width: "8%" }}></img>
          </span>
          명예의 전당
          <span style={{ marginLeft: "30px" }}>
            <img src="ranking.png" style={{ width: "8%" }}></img>
          </span>
        </h1>
        <table className="rank-table">
          <thead>
            <tr>
              <th>등수</th>
              <th className="cell-long">아이디</th>
              <th>수익률</th>
            </tr>
          </thead>
          <tbody>
            {calculating ? (
              <tr>
                <td colSpan="3">
                  <h1 style={{ color: "green" }}>🤫 수익률 계산중...</h1>
                </td>
              </tr>
            ) : (
              ""
            )}
            {sortedStockReturns.map((item, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor:
                    item.user_id === props.id ? "lightblue" : "white",
                }}
              >
                <td>
                  {index >= 3 && <span>{index + 1}</span>}
                  <span>
                    {index === 0 && (
                      <img src="gold-medal.png" style={{ width: "40px" }} />
                    )}
                    {index === 1 && (
                      <img src="silver-medal.png" style={{ width: "40px" }} />
                    )}
                    {index === 2 && (
                      <img src="bronze-medal.png" style={{ width: "40px" }} />
                    )}
                  </span>
                </td>
                <td>{item.user_id}</td>
                {item.stock_returns >= 0 ? (
                  <td style={{ color: "red" }}>{item.stock_returns}%</td>
                ) : (
                  <td style={{ color: "blue" }}>{item.stock_returns}%</td>
                )}
              </tr>
            ))}

            <tr>
              <td colSpan="5" style={{ textAlign: "right" }}>
                <p>
                  수익률은{" "}
                  <span style={{ color: "red" }}>
                    <h4 style={{ display: "inline-block" }}>
                      전일 종가를 기준으로 계산
                    </h4>
                  </span>
                  됩니다
                </p>
                (매주 일요일 23:00 수익률 하위 5명에겐 위로금 500만원을
                드립니다)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default RankPage;
