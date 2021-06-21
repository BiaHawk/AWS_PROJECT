var AWS = require("aws-sdk");
exports.handler = async() => {
    const result = await getObjectFromDynamoDB();
    const station = await getEstationByCode(result.CODIGO_ESTACAO);
    console.log(station);
    const response = {...station, ...result };

    return response;
};

async function getEstationByCode(station) {
    var ddb = new AWS.DynamoDB();
    var params = {
        TableName: "estacao",
        Key: {
            CODIGO_ESTACAO: { S: station },
        },
    };
    return new Promise((resolve, reject) => {
        ddb.getItem(params, function(err, resData) {
            if (err) {
                reject(err);
            } else {
                const item = Object.keys(resData.Item).reduce(function(result, key) {
                    result[key] = resData.Item[key].S;
                    return result;
                }, {});
                resolve(item);
            }
        });
    });
}

async function getObjectFromDynamoDB() {
    var ddb = new AWS.DynamoDB();
    const today = new Date();
    let hh = today.getHours() - 3;
    let dd = "01";
    if (hh < 0) {
        dd = String(today.getDate() - 1).padStart(2, "0");
    } else {
        dd = String(today.getDate()).padStart(2, "0");
    }
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    console.log(yyyy, mm, dd);
    var params = {
        TableName: "Sensor",
        ExpressionAttributeValues: {
            ":d1": {
                S: yyyy + "-" + mm + "-" + dd,
            },
        },
        KeyConditionExpression: "DT_MEDICAO = :d1",
    };
    return new Promise((resolve, reject) => {
        ddb.query(params, function(err, resData) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Success", resData);
                if (resData.Count > 0) {
                    let returne = {
                        CODIGO_ESTACAO: "",
                        NOME_ESTACAO: "",
                        LATITUDE: "",
                        LONGITUDE: "",
                        HORARIO_COLETA: "",
                        VALOR_OBSERVADO: 0,
                    };
                    let maximum = 0;

                    for (let item of resData.Items) {
                        if (maximum >= Number(item.TEM_MAX.N)) {
                            continue;
                        } else {
                            maximum = item.TEM_MAX.N;
                            returne = {
                                CODIGO_ESTACAO: item.CD_ESTACAO_MAX.S,
                                VALOR_OBSERVADO: item.TEM_MAX.N,
                                HORARIO_COLETA: item.HR_MEDICAO.S,
                            };
                        }
                    }
                    console.log(returne);

                    resolve(returne);
                }
            }
        });
    });
}