function StockChartTest() {
  fetch(
    "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-price?fid_cond_mrkt_div_code=J&fid_input_iscd=005930&fid_period_div_code=D&fid_org_adj_prc=1",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjMxMTljMWZmLTkwMDQtNDMwOS1iM2ZhLTA2YTIwODFjZmVjMiIsImlzcyI6InVub2d3IiwiZXhwIjoxNjk5MzcyNzYzLCJpYXQiOjE2OTkyODYzNjMsImp0aSI6IlBTdUk5SjY0TndQNmhacUFVbndZWklQSm1hSlozMWFXWEZJZSJ9.3t33D0ve2R-VILRt5etI0fhW3BDdxrgzXHno1tZMMV-75sOWaxtTF9Qxon65mDuijOJvQ4RUqstibFcjPsF0Rw",
        appkey: "PSuI9J64NwP6hZqAUnwYZIPJmaJZ31aWXFIe",
        appsecret:
          "pLuA0K7dvlHzJIoMG1lpoicr3i0rBUH6eO9U6X3Ezbbf4msReJUkv5eEW+h928h1/1aDJ6XELR9KFaMq/7kuGIpZ7CdD70qwJJHKqX/Rl4D7e3Ucya7ze44I9wy1FXDtdIbF+8lG2ARk+ImLCQiFI5zgl0fgVlzijC8K/RIW2KcCBGz9MRY=",
        tr_id: "FHKST01010400",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const extractedData = data.output.map((item) => ({
        stck_bsop_date: item.stck_bsop_date,
        stck_oprc: item.stck_oprc,
        stck_hgpr: item.stck_hgpr,
        stck_lwpr: item.stck_lwpr,
        stck_clpr: item.stck_clpr,
      }));
      console.log(extractedData);
    })
    .catch((error) => console.error("Error:", error));
}
export default StockChartTest;
