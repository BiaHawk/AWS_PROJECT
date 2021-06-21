const https = require("https");
let aws = require("aws-sdk");
let kinesis = new aws.Kinesis(
    {region: "us-east-1"}
    );

exports.handler = async(event) => {
    const response = await request();
    
    const result = await sendToKinesis(response);
    if(result){
        
    return {
    "isBase64Encoded": false,
    "statusCode": 200,
    "body": "Success"
};
    } else {
  return {
    "isBase64Encoded": false,
    "statusCode": 500,
    "body": "Failed"
};      
    }
    
};

const request = () => {
    const today = new Date();
    let hh = today.getHours() -3;
    if(hh < 0){
        hh = 24 + hh;
    }
    let dd = "01";
    if(hh > 20 ){
        dd = String(today.getDate() -1 ).padStart(2, "0");
    }else{
        dd = String(today.getDate()).padStart(2, "0");
    }
    hh = String(hh).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    
    console.log(yyyy, mm,dd,hh);
    return new Promise((resolve, reject) => {
        https
            .get(
                `https://apitempo.inmet.gov.br/estacao/dados/${
          yyyy + "-" + mm + "-" + dd
        }/${hh}00`,
                (res) => {
                    let data = "";

                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        
                        const result = JSON.parse(data);
                        const filtered = result
                            .filter((data) => data.UF === "PE")
                            .map((data) => {
                                return {
                                    TEM_MAX: data.TEM_MAX,
                                    TEM_MIN: data.TEM_MIN,
                                    TEM_INS: data.TEM_INS,
                                    PREC: data.CHUVA,
                                    VENTO: data.VEN_VEL,
                                    CD_ESTACAO: data.CD_ESTACAO,
                                    HR_MEDICAO: data.HR_MEDICAO,
                                    DT_MEDICAO: data.DT_MEDICAO
                                };
                            });
                        
                        resolve(filtered);
                    });
                }
            )
            .on("error", (err) => {
                reject(err);
            });
    });
};

const sendToKinesis = (data) => {
    return new Promise((resolve, reject) => {
        const parsedData = JSON.stringify(data);
        console.log(parsedData);
        const params = {
            Data: parsedData,
            PartitionKey: "1",
            StreamName: "data-stream",
        };

        kinesis.putRecord(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(false);
            } else {

                resolve(true);
            }
        });
    });
};